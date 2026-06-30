import { Riesgo, Proceso, PlanMitigacion } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarRiesgos = async (req, res) => {
  try {
    const data = await Riesgo.findAll({
      include: [{ model: Proceso, as: 'proceso', attributes: ['nombre'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearRiesgo = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['proceso_id']);
    const r = await Riesgo.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(r);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarRiesgo = async (req, res) => {
  try {
    const { id } = req.params;
    const riesgo = await Riesgo.findByPk(id);
    if (!riesgo) return res.status(404).json({ error: 'Riesgo no encontrado' });
    const data = prepareCreateData(req.body, ['proceso_id']);
    await Riesgo.update(data, { where: { id } });
    res.json({ message: 'Riesgo actualizado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarRiesgo = async (req, res) => {
  try {
    const { id } = req.params;
    await Riesgo.destroy({ where: { id } });
    res.json({ message: 'Riesgo eliminado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarPlanesMitigacion = async (req, res) => {
  try {
    const { riesgo_id } = req.params;
    const data = await PlanMitigacion.findAll({ where: { riesgo_id } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearPlanMitigacion = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['riesgo_id', 'responsable_id']);
    const p = await PlanMitigacion.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteRiesgos = async (req, res) => {
  try {
    const riesgos = await Riesgo.findAll({ include: [{ model: Proceso, as: 'proceso' }] });
    const filas = riesgos.map(r => {
      const prob = r.probabilidad || 0;
      const imp = r.impacto || 0;
      const nivel = (prob * imp) <= 4 ? 'Bajo' : (prob * imp) <= 9 ? 'Medio' : (prob * imp) <= 14 ? 'Alto' : 'Crítico';

      return [
        r.codigo || '-',
        r.nombre || '-',
        r.categoria || '-',
        nivel,
        prob,
        imp,
        r.estado || '-',
      ];
    });
    const pdf = await generarPDF({
      titulo: 'Reporte de Gestión de Riesgos',
      columnas: ['Código', 'Nombre', 'Categoría', 'Nivel', 'Prob', 'Imp', 'Estado'],
      filas,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=riesgos.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteRiesgos:', err);
    res.status(500).json({ error: formatError(err) });
  }
};
