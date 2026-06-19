import { PlanAuditoria, Hallazgo, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarPlanes = async (req, res) => {
  try {
    const data = await PlanAuditoria.findAll({
      include: [{ model: Usuario, as: 'lider', attributes: ['nombres', 'apellidos'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearPlan = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['lider_id']);
    const p = await PlanAuditoria.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarHallazgos = async (req, res) => {
  try {
    const { plan_id } = req.query;
    const where = plan_id ? { plan_id } : {};
    const data = await Hallazgo.findAll({
      where,
      include: [
        { model: PlanAuditoria, as: 'plan', attributes: ['codigo', 'nombre'] },
        { model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] },
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearHallazgo = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['plan_id', 'area_proceso_id']);
    const h = await Hallazgo.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(h);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarHallazgo = async (req, res) => {
  try {
    const { id } = req.params;
    const h = await Hallazgo.findByPk(id);
    if (!h) {
      return res.status(404).json({ error: 'Hallazgo no encontrado' });
    }
    const data = prepareCreateData(req.body, ['plan_id', 'area_proceso_id']);
    await h.update({ ...data, modificado_por: req.usuario.id });
    res.json({ mensaje: 'Hallazgo actualizado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const cerrarHallazgo = async (req, res) => {
  try {
    const { id } = req.params;
    const h = await Hallazgo.findByPk(id);
    if (!h) {
      return res.status(404).json({ error: 'Hallazgo no encontrado' });
    }
    const fechaHoy = new Date().toISOString().split('T')[0];
    await h.update({ estado: 'cerrado', fecha_cierre: fechaHoy, modificado_por: req.usuario.id });
    res.json({ mensaje: 'Hallazgo cerrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteAuditoria = async (req, res) => {
  try {
    const planes = await PlanAuditoria.findAll();
    let html = '<table><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Estado</th></tr>';
    planes.forEach(p => {
      html += `<tr><td>${p.codigo || '-'}</td><td>${p.nombre || '-'}</td><td>${p.tipo || '-'}</td><td>${p.estado || '-'}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Reporte de Auditorías e Inspecciones', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=auditorias.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteAuditoria:', err);
    res.status(500).json({ error: formatError(err) });
  }
};
