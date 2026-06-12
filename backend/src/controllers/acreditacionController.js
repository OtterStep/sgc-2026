import { EstandarAcreditacion, FactorCriterio, Autoevaluacion, EvaluacionCriterio } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

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
    const a = await Autoevaluacion.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const evaluarCriterio = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['autoevaluacion_id', 'factor_id']);
    const e = await EvaluacionCriterio.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(e);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteAcreditacion = async (req, res) => {
  try {
    const autoevaluaciones = await Autoevaluacion.findAll({
      include: [
        { model: EstandarAcreditacion, as: 'estandar' },
        { model: EvaluacionCriterio, as: 'evaluaciones', include: [{ model: FactorCriterio, as: 'factor' }] },
      ],
    });
    let html = '<table><tr><th>Periodo</th><th>Estandar</th><th>Estado</th><th>Puntaje</th></tr>';
    autoevaluaciones.forEach(a => {
      html += `<tr><td>${a.periodo}</td><td>${a.estandar?.nombre}</td><td>${a.estado}</td><td>${a.puntaje_total || '-'}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Reporte de Acreditación y Autoevaluación', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=acreditacion.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
