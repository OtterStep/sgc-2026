import { Op } from 'sequelize';
import { EstandarAcreditacion, FactorCriterio, Autoevaluacion, EvaluacionCriterio, PeriodoAcademico } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';
import { sequelize } from '../config/database.js';

export const listarEstandares = async (req, res) => {
  try {
    const data = await EstandarAcreditacion.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearEstandar = async (req, res) => {
  try {
    const e = await EstandarAcreditacion.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(e);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarEstandar = async (req, res) => {
  try {
    const { id } = req.params;
    const estandar = await EstandarAcreditacion.findByPk(id);
    if (!estandar) return res.status(404).json({ error: 'Estándar no encontrado' });
    await estandar.update(req.body);
    res.json({ message: 'Estándar actualizado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarEstandar = async (req, res) => {
  try {
    const { id } = req.params;
    const estandar = await EstandarAcreditacion.findByPk(id);
    if (!estandar) return res.status(404).json({ error: 'Estándar no encontrado' });
    await estandar.destroy();
    res.json({ message: 'Estándar eliminado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarFactores = async (req, res) => {
  try {
    const { estandar_id } = req.params;
    const data = await FactorCriterio.findAll({ where: { estandar_id } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearFactor = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['estandar_id']);
    const f = await FactorCriterio.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(f);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarFactor = async (req, res) => {
  try {
    const { id } = req.params;
    const factor = await FactorCriterio.findByPk(id);
    if (!factor) return res.status(404).json({ error: 'Factor no encontrado' });
    const data = prepareCreateData(req.body, ['estandar_id']);
    await factor.update({ ...data, modificado_por: req.usuario.id });
    res.json(factor);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarFactor = async (req, res) => {
  try {
    const { id } = req.params;
    const factor = await FactorCriterio.findByPk(id);
    if (!factor) return res.status(404).json({ error: 'Factor no encontrado' });
    await factor.destroy();
    res.json({ message: 'Factor eliminado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarAutoevaluaciones = async (req, res) => {
  try {
    const data = await Autoevaluacion.findAll({
      include: [{ model: EstandarAcreditacion, as: 'estandar', attributes: ['nombre', 'organizacion'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearAutoevaluacion = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['estandar_id']);
    if (data.periodo) {
      const periodoExiste = await PeriodoAcademico.findOne({ where: { codigo: data.periodo } });
      if (!periodoExiste) {
        return res.status(400).json({ error: `El período '${data.periodo}' no existe en la lista de periodos académicos` });
      }
    }
    const a = await Autoevaluacion.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarAutoevaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    await Autoevaluacion.destroy({ where: { id } });
    res.json({ message: 'Autoevaluación eliminada' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

const recalcularPuntajeAutoevaluacion = async (autoevaluacionId) => {
  const evaluaciones = await EvaluacionCriterio.findAll({
    where: { autoevaluacion_id: autoevaluacionId },
    include: [{ model: FactorCriterio, as: 'factor', attributes: ['peso'] }],
  });
  if (evaluaciones.length === 0) return;

  let sumaPonderada = 0;
  let sumaPesos = 0;
  for (const ev of evaluaciones) {
    const peso = parseFloat(ev.factor?.peso) || 0;
    const puntaje = parseFloat(ev.puntaje) || 0;
    sumaPonderada += puntaje * peso;
    sumaPesos += peso;
  }

  const puntajeTotal = sumaPesos > 0
    ? parseFloat((sumaPonderada / sumaPesos).toFixed(2))
    : null;

  await Autoevaluacion.update({ puntaje_total: puntajeTotal }, { where: { id: autoevaluacionId } });
};

export const listarEvaluacionesCriterio = async (req, res) => {
  try {
    const { autoevaluacion_id } = req.query;
    if (!autoevaluacion_id) return res.status(400).json({ error: 'autoevaluacion_id es requerido' });
    const data = await EvaluacionCriterio.findAll({
      where: { autoevaluacion_id },
      include: [{ model: FactorCriterio, as: 'factor', attributes: ['id', 'codigo', 'nombre', 'peso'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const evaluarCriterio = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = prepareCreateData(req.body, ['autoevaluacion_id', 'factor_id']);
    const e = await EvaluacionCriterio.create({ ...data, creado_por: req.usuario.id }, { transaction: t });
    await t.commit();
    await recalcularPuntajeAutoevaluacion(data.autoevaluacion_id);
    res.status(201).json(e);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarEvaluacionCriterio = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const ev = await EvaluacionCriterio.findByPk(id, { transaction: t });
    if (!ev) {
      await t.rollback();
      return res.status(404).json({ error: 'Evaluación de criterio no encontrada' });
    }
    const data = prepareCreateData(req.body, ['autoevaluacion_id', 'factor_id']);
    await ev.update({ ...data, modificado_por: req.usuario.id }, { transaction: t });
    await t.commit();
    await recalcularPuntajeAutoevaluacion(data.autoevaluacion_id || ev.autoevaluacion_id);
    res.json(ev);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteAcreditacion = async (req, res) => {
  try {
    const autoevaluaciones = await Autoevaluacion.findAll({
      include: [
        { model: EstandarAcreditacion, as: 'estandar' },
      ],
    });
    const filas = autoevaluaciones.map(a => ([
      a.periodo || '-',
      a.estandar?.nombre || '-',
      a.estado || '-',
      a.puntaje_total || '-',
    ]));
    const pdf = await generarPDF({
      titulo: 'Reporte de Acreditación y Autoevaluación',
      columnas: ['Periodo', 'Estandar', 'Estado', 'Puntaje'],
      filas,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=acreditacion.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteAcreditacion:', err);
    res.status(500).json({ error: formatError(err) });
  }
};
