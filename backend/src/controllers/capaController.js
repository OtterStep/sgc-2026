import { Capa, Hallazgo, Usuario, SeguimientoCapa } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { generarPDF } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

// ============================================================
// LISTAR CAPAS
// ============================================================
export const listarCapas = async (req, res) => {
  try {
    const capas = await Capa.findAll({
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['id', 'descripcion'] },
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombres', 'apellidos'] },
      ],
      order: [['creado_en', 'DESC']],
    });
    res.json(capas);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// OBTENER CAPA POR ID
// ============================================================
export const obtenerCapa = async (req, res) => {
  try {
    const capa = await Capa.findByPk(req.params.id, {
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['id', 'descripcion'] },
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombres', 'apellidos'] },
        { model: SeguimientoCapa, as: 'seguimientos', order: [['fecha_seguimiento', 'DESC']] },
      ],
    });
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    res.json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// CREAR CAPA
// ============================================================
export const crearCapa = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['hallazgo_id', 'responsable_id']);
    const capa = await Capa.create({
      ...data,
      creado_por: req.usuario.id,
      estado: 'registrada',
    });
    res.status(201).json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ACTUALIZAR CAPA (datos generales, no estado)
// ============================================================
export const actualizarCapa = async (req, res) => {
  try {
    const capa = await Capa.findByPk(req.params.id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    const data = prepareCreateData(req.body, ['hallazgo_id', 'responsable_id']);
    await capa.update({ ...data, modificado_por: req.usuario.id });
    res.json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ACTUALIZAR ESTADO (flujo general, SIN cierre)
// 'registrada' -> 'en_implementacion' -> 'implementada' -> 'verificada'
// El cierre ('cerrada') ahora se maneja exclusivamente en cerrarCapa(),
// porque requiere calificar efectividad obligatoriamente.
// ============================================================
export const actualizarEstadoCapa = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosPermitidos = ['registrada', 'en_implementacion', 'implementada', 'verificada', 'rechazada'];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Para cerrar una CAPA use PATCH /capas/:id/cerrar. Valores permitidos aquí: ${estadosPermitidos.join(', ')}`,
      });
    }

    const capa = await Capa.findByPk(req.params.id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    if (capa.estado === 'cerrada') {
      return res.status(400).json({ error: 'No se puede modificar una CAPA cerrada' });
    }

    await capa.update({ estado, modificado_por: req.usuario.id });
    res.json({ mensaje: 'Estado actualizado correctamente', capa });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// CERRAR CAPA  (NUEVA FUNCIONALIDAD — endpoint dedicado)
// Exige calificar efectividad: efectiva | parcial | no_efectiva
// - Cierra la CAPA y cierra el hallazgo origen (si tiene).
// - Si efectividad === 'no_efectiva', genera automáticamente una
//   CAPA derivada en estado 'registrada', vinculada al mismo hallazgo.
// - Registra un SeguimientoCapa de cierre para trazabilidad.
// ============================================================
export const cerrarCapa = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { efectividad, comentario_cierre, fecha_verificacion } = req.body;

    const efectividadesValidas = ['efectiva', 'parcial', 'no_efectiva'];
    if (!efectividadesValidas.includes(efectividad)) {
      await t.rollback();
      return res.status(400).json({
        error: `Debe calificar la efectividad para cerrar la CAPA. Valores permitidos: ${efectividadesValidas.join(', ')}`,
      });
    }

    const capa = await Capa.findByPk(id, { transaction: t });
    if (!capa) {
      await t.rollback();
      return res.status(404).json({ error: 'CAPA no encontrada' });
    }
    if (capa.estado === 'cerrada') {
      await t.rollback();
      return res.status(400).json({ error: 'Esta CAPA ya se encuentra cerrada' });
    }
    if (!['implementada', 'verificada'].includes(capa.estado)) {
      await t.rollback();
      return res.status(400).json({
        error: `Solo se pueden cerrar CAPAs en estado 'implementada' o 'verificada'. Estado actual: ${capa.estado}`,
      });
    }

    // Cerrar la CAPA con su calificación de efectividad
    await capa.update(
      {
        estado: 'cerrada',
        efectividad,
        fecha_verificacion: fecha_verificacion || capa.fecha_verificacion || new Date().toISOString().split('T')[0],
        modificado_por: req.usuario.id,
      },
      { transaction: t }
    );

    // Registrar seguimiento de cierre (trazabilidad)
    await SeguimientoCapa.create(
      {
        capa_id: capa.id,
        fecha_seguimiento: new Date().toISOString().split('T')[0],
        avance: 100,
        observaciones: `Cierre de CAPA. Efectividad calificada: ${efectividad}.${comentario_cierre ? ' Comentario: ' + comentario_cierre : ''}`,
        creado_por: req.usuario.id,
      },
      { transaction: t }
    );

    // Cerrar el hallazgo origen, si existe
    if (capa.hallazgo_id) {
      const fechaHoy = new Date().toISOString().split('T')[0];
      await Hallazgo.update(
        { estado: 'cerrado', fecha_cierre: fechaHoy, modificado_por: req.usuario.id },
        { where: { id: capa.hallazgo_id }, transaction: t }
      );
    }

    let capaDerivada = null;

    // Si NO fue efectiva, generar CAPA derivada automáticamente
    if (efectividad === 'no_efectiva') {
      const codigoDerivado = `${capa.codigo}-DER-${Date.now().toString().slice(-5)}`;

      capaDerivada = await Capa.create(
        {
          codigo: codigoDerivado,
          tipo: capa.tipo,
          hallazgo_id: capa.hallazgo_id,
          descripcion: `CAPA derivada por inefectividad de "${capa.codigo}". ${capa.descripcion}`,
          causa_raiz: `Causa raíz no resuelta tras la acción "${capa.codigo}". Causa raíz previa: ${capa.causa_raiz || 'no especificada'}.`,
          accion_propuesta: 'Pendiente de definir nueva acción correctiva tras inefectividad de la CAPA original.',
          responsable_id: capa.responsable_id,
          estado: 'registrada',
          efectividad: 'pendiente',
          creado_por: req.usuario.id,
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.json({
      mensaje:
        efectividad === 'no_efectiva'
          ? 'CAPA cerrada como No Efectiva. Se generó una CAPA derivada.'
          : `CAPA cerrada correctamente con efectividad: ${efectividad}.`,
      capa,
      capa_derivada: capaDerivada,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// REPORTE PDF
// ============================================================
export const reporteCapa = async (req, res) => {
  try {
    const capas = await Capa.findAll({
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['codigo'] },
        { model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] },
      ],
    });
    const filas = capas.map((c) => [
      c.codigo || '-',
      c.tipo || '-',
      c.descripcion || '-',
      c.responsable ? `${c.responsable.nombres || ''} ${c.responsable.apellidos || ''}`.trim() : '-',
      c.estado || '-',
      c.efectividad || '-',
      c.hallazgo?.codigo || '-',
    ]);
    const pdf = await generarPDF({
      titulo: 'Reporte de Acciones Correctivas y Preventivas',
      columnas: ['Código', 'Tipo', 'Descripción', 'Responsable', 'Estado', 'Efectividad', 'Hallazgo Origen'],
      filas,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=reporte-capas.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteCapa:', err);
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ELIMINAR CAPA
// ============================================================
export const eliminarCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const capa = await Capa.findByPk(id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    if (capa.estado === 'cerrada') {
      return res.status(400).json({ error: 'No se puede eliminar una CAPA cerrada' });
    }
    await capa.destroy();
    res.json({ mensaje: 'CAPA eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};