import { Riesgo, Proceso, PlanMitigacion } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError } from '../utils/errorHandler.js';

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
    const r = await Riesgo.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(r);
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
    const p = await PlanMitigacion.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteRiesgos = async (req, res) => {
  try {
    const riesgos = await Riesgo.findAll({ include: [{ model: Proceso, as: 'proceso' }] });
    let html = '<table><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Nivel</th><th>Prob</th><th>Imp</th><th>Estado</th></tr>';
    riesgos.forEach(r => {
      const nivel = (r.probabilidad * r.impacto) <= 4 ? 'Bajo' : (r.probabilidad * r.impacto) <= 9 ? 'Medio' : (r.probabilidad * r.impacto) <= 14 ? 'Alto' : 'Crítico';
      html += `<tr><td>${r.codigo}</td><td>${r.nombre}</td><td>${r.categoria}</td><td>${nivel}</td><td>${r.probabilidad}</td><td>${r.impacto}</td><td>${r.estado}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Reporte de Gestión de Riesgos', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=riesgos.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
