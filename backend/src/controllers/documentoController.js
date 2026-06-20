import { Documento, Usuario, TipoDocumento } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
import { dispararWebhook } from '../services/n8nService.js';
import { validationResult } from 'express-validator';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarDocumentos = async (req, res) => {
  try {
    const docs = await Documento.findAll({
      include: [
        { model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] },
        { model: TipoDocumento, as: 'tipo', attributes: ['id', 'nombre', 'codigo'] }
      ],
      order: [['creado_en', 'DESC']],
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] },
        { model: TipoDocumento, as: 'tipo', attributes: ['id', 'nombre', 'codigo'] }
      ]
    });
    if (!doc) {
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

export const crearDocumento = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const data = prepareCreateData(req.body, ['proceso_id']);
    const doc = await Documento.create({
      ...data,
      creado_por: req.usuario.id,
    });
    await dispararWebhook('notificar-documento', { accion: 'creado', documento: doc.codigo });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarDocumento = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    const data = prepareCreateData(req.body, ['proceso_id']);
    await doc.update({
      ...data,
      modificado_por: req.usuario.id,
    });
    await dispararWebhook('notificar-documento', { accion: 'actualizado', documento: doc.codigo });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const archivarDocumento = async (req, res) => {
  try {
    const doc = await Documento.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    await doc.update({
      estado: 'archivado',
      modificado_por: req.usuario.id,
    });
    await dispararWebhook('notificar-documento', { accion: 'archivado', documento: doc.codigo });
    res.json({ message: 'Documento archivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const generarReporteDocumentos = async (req, res) => {
  try {
    const docs = await Documento.findAll({ raw: true });
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
