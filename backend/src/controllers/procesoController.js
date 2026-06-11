import { Proceso, Macroproceso, ActividadProceso, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';

export const listarMacroprocesos = async (req, res) => {
  try {
    const data = await Macroproceso.findAll({
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearMacroproceso = async (req, res) => {
  try {
    const mp = await Macroproceso.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(mp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarProcesos = async (req, res) => {
  try {
    const data = await Proceso.findAll({
      include: [
        { model: Macroproceso, as: 'macroproceso', attributes: ['nombre'] },
        { model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] },
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearProceso = async (req, res) => {
  try {
    const p = await Proceso.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listarActividades = async (req, res) => {
  try {
    const { proceso_id } = req.params;
    const data = await ActividadProceso.findAll({
      where: { proceso_id },
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
      order: [['secuencia', 'ASC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearActividad = async (req, res) => {
  try {
    const a = await ActividadProceso.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reporteMapaProcesos = async (req, res) => {
  try {
    const procesos = await Proceso.findAll({
      include: [{ model: Macroproceso, as: 'macroproceso' }, { model: ActividadProceso, as: 'actividades' }],
    });
    let html = '<table><tr><th>Código</th><th>Nombre</th><th>Macroproceso</th><th>Objetivo</th><th>Estado</th></tr>';
    procesos.forEach(p => {
      html += `<tr><td>${p.codigo}</td><td>${p.nombre}</td><td>${p.macroproceso?.nombre || '-'}</td><td>${p.objetivo || '-'}</td><td>${p.estado}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Mapa de Procesos Institucionales', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=mapa-procesos.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
