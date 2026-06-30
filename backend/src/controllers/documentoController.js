import { Documento, Usuario, TipoDocumento, VersionDocumento } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
import { dispararWebhook } from '../services/n8nService.js';
import { validationResult } from 'express-validator';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';
import { sequelize } from '../config/database.js';

const includeBase = [
  { model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] },
  { model: TipoDocumento, as: 'tipo', attributes: ['id', 'nombre', 'codigo', 'requiere_aprobacion'] },
];

// Verifica que sea el creador del documento o un admin
const esCreadorOAdmin = (doc, usuario) => {
  return doc.creado_por === usuario.id || usuario.rol === 'admin';
};

const rolesSoloAprobados = ['docente', 'estudiante', 'administrativo'];

export const listarDocumentos = async (req, res) => {
  try {
    const where = {};
    if (req.query.estado) {
      where.estado = req.query.estado;
    } else if (rolesSoloAprobados.includes(req.usuario.rol)) {
      where.estado = 'aprobado';
    }

    const docs = await Documento.findAll({
      where,
      include: includeBase,
      order: [['creado_en', 'DESC']],
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id, { include: includeBase });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    if (rolesSoloAprobados.includes(req.usuario.rol) && doc.estado !== 'aprobado') {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarTiposDocumento = async (req, res) => {
  try {
    const tipos = await TipoDocumento.findAll({ order: [['id', 'ASC']] });
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// CREAR DOCUMENTO (siempre nace en 'borrador' + versión 1)
// ==========================================
export const crearDocumento = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const t = await sequelize.transaction();
  try {
    const data = prepareCreateData(req.body, ['proceso_id']);
    const doc = await Documento.create({
      ...data,
      estado: 'borrador',
      version_actual: 1,
      creado_por: req.usuario.id,
    }, { transaction: t });

    await VersionDocumento.create({
      documento_id: doc.id,
      numero_version: 1,
      cambios_descripcion: 'Versión inicial del documento',
      contenido: doc.contenido,
      archivo_url: doc.archivo_url,
      estado: 'borrador',
      creado_por: req.usuario.id,
    }, { transaction: t });

    await t.commit();
    await dispararWebhook('notificar-documento', { accion: 'creado', documento: doc.codigo });
    res.status(201).json(doc);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// ACTUALIZAR DOCUMENTO
// Solo el creador (o admin). Si edita contenido de un doc ya 'aprobado',
// se crea nueva versión y vuelve a 'borrador'.
// ==========================================
export const actualizarDocumento = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const t = await sequelize.transaction();
  try {
    const doc = await Documento.findByPk(req.params.id, { transaction: t });
    if (!doc) {
      await t.rollback();
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (!esCreadorOAdmin(doc, req.usuario)) {
      await t.rollback();
      return res.status(403).json({ error: 'Solo el creador del documento o un administrador puede editarlo' });
    }

    if (doc.estado === 'archivado') {
      await t.rollback();
      return res.status(400).json({ error: 'No se puede editar un documento archivado' });
    }

    const data = prepareCreateData(req.body, ['proceso_id']);
    const cambioContenido = data.contenido !== undefined && data.contenido !== doc.contenido;
    const eraAprobado = doc.estado === 'aprobado';

    let nuevaVersionNumero = doc.version_actual;
    let nuevoEstado = doc.estado;

    if (cambioContenido && eraAprobado) {
      nuevaVersionNumero = doc.version_actual + 1;
      nuevoEstado = 'borrador';

      await VersionDocumento.create({
        documento_id: doc.id,
        numero_version: nuevaVersionNumero,
        cambios_descripcion: req.body.cambios_descripcion || `Actualización de versión ${nuevaVersionNumero}`,
        contenido: data.contenido,
        archivo_url: data.archivo_url ?? doc.archivo_url,
        estado: 'borrador',
        creado_por: req.usuario.id,
      }, { transaction: t });
    }

    await doc.update({
      ...data,
      version_actual: nuevaVersionNumero,
      estado: nuevoEstado,
      modificado_por: req.usuario.id,
    }, { transaction: t });

    await t.commit();
    await dispararWebhook('notificar-documento', { accion: 'actualizado', documento: doc.codigo });
    res.json(doc);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// ENVIAR A REVISIÓN: borrador -> en_revision (solo el creador / admin)
// ==========================================
export const enviarRevision = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    if (!esCreadorOAdmin(doc, req.usuario)) {
      return res.status(403).json({ error: 'Solo el creador del documento o un administrador puede enviarlo a revisión' });
    }
    if (doc.estado !== 'borrador') {
      return res.status(400).json({ error: `No se puede enviar a revisión desde el estado '${doc.estado}'` });
    }

    await doc.update({ estado: 'en_revision', modificado_por: req.usuario.id });
    await VersionDocumento.update(
      { estado: 'en_revision' },
      { where: { documento_id: doc.id, numero_version: doc.version_actual } }
    );

    await dispararWebhook('notificar-documento', { accion: 'enviado_revision', documento: doc.codigo });
    res.json({ message: 'Documento enviado a revisión', documento: doc });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// APROBAR: en_revision -> aprobado (solo el creador / admin)
// El mismo usuario que está revisando su documento confirma la aprobación.
// ==========================================
export const aprobarDocumento = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await Documento.findByPk(req.params.id, { transaction: t });
    if (!doc) {
      await t.rollback();
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (!esCreadorOAdmin(doc, req.usuario)) {
      await t.rollback();
      return res.status(403).json({ error: 'Solo el creador del documento o un administrador puede aprobarlo' });
    }
    if (doc.estado !== 'en_revision') {
      await t.rollback();
      return res.status(400).json({ error: 'El documento no está en estado de revisión' });
    }

    await doc.update({
      estado: 'aprobado',
      fecha_revision: new Date(),
      modificado_por: req.usuario.id,
    }, { transaction: t });

    await VersionDocumento.update(
      { estado: 'aprobado' },
      { where: { documento_id: doc.id, numero_version: doc.version_actual }, transaction: t }
    );

    await t.commit();
    await dispararWebhook('notificar-documento', { accion: 'documento_aprobado', documento: doc.codigo });
    res.json({ message: 'Documento aprobado correctamente', documento: doc });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// DEVOLVER A BORRADOR: en_revision -> borrador (correcciones, mismo creador/admin)
// ==========================================
export const devolverBorrador = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    if (!esCreadorOAdmin(doc, req.usuario)) {
      return res.status(403).json({ error: 'Solo el creador del documento o un administrador puede hacer esto' });
    }
    if (doc.estado !== 'en_revision') {
      return res.status(400).json({ error: 'El documento no está en estado de revisión' });
    }

    await doc.update({ estado: 'borrador', modificado_por: req.usuario.id });
    await VersionDocumento.update(
      { estado: 'borrador' },
      { where: { documento_id: doc.id, numero_version: doc.version_actual } }
    );

    res.json({ message: 'Documento devuelto a borrador para correcciones', documento: doc });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// MARCAR COMO OBSOLETO: aprobado -> obsoleto
// ==========================================
export const marcarObsoleto = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    if (doc.estado !== 'aprobado') {
      return res.status(400).json({ error: 'Solo un documento aprobado puede marcarse como obsoleto' });
    }

    await doc.update({ estado: 'archivado', modificado_por: req.usuario.id });
    await dispararWebhook('notificar-documento', { accion: 'obsoleto', documento: doc.codigo });
    res.json({message: 'Documento archivado por obsolescencia', documento: doc});
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// HISTORIAL DE VERSIONES (botón "Ver")
// ==========================================
export const listarVersiones = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    if (rolesSoloAprobados.includes(req.usuario.rol) && doc.estado !== 'aprobado') {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const versiones = await VersionDocumento.findAll({
      where: { documento_id: req.params.id },
      include: [{ model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] }],
      order: [['numero_version', 'DESC']],
    });

    res.json({ documento: doc, versiones });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const generarReporteDocumentos = async (req, res) => {
  try {
    const where = rolesSoloAprobados.includes(req.usuario.rol) ? { estado: 'aprobado' } : {};
    const docs = await Documento.findAll({ where, raw: true });
    const filas = docs.map(d => ([
      d.codigo || '-',
      d.titulo || '-',
      d.estado || '-',
      d.version_actual || '-',
      d.creado_en ? new Date(d.creado_en).toLocaleDateString('es-PE') : '-',
    ]));

    const pdf = await generarPDF({
      titulo: 'Reporte de Documentos',
      columnas: ['Código', 'Título', 'Estado', 'Versión', 'Fecha Creación'],
      filas,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=documentos.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en generarReporteDocumentos:', err);
    res.status(500).json({ error: formatError(err) });
  }
};