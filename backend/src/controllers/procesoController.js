import { Proceso, Macroproceso, ActividadProceso, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarMacroprocesos = async (req, res) => {
  try {
    const data = await Macroproceso.findAll({
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
      order: [['creado_en', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerMacroprocesoPorId = async (req, res) => {
  try {
    const data = await Macroproceso.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
    });
    if (!data) {
      return res.status(404).json({ error: 'Macroproceso no encontrado' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearMacroproceso = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['responsable_id']);
    const mp = await Macroproceso.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(mp);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarMacroproceso = async (req, res) => {
  try {
    const mp = await Macroproceso.findByPk(req.params.id);
    if (!mp) {
      return res.status(404).json({ error: 'Macroproceso no encontrado' });
    }
    const data = prepareCreateData(req.body, ['responsable_id']);
    await mp.update({ ...data, modificado_por: req.usuario.id });
    res.json(mp);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const desactivarMacroproceso = async (req, res) => {
  try {
    const mp = await Macroproceso.findByPk(req.params.id);
    if (!mp) {
      return res.status(404).json({ error: 'Macroproceso no encontrado' });
    }
    await mp.update({ estado: 'inactivo', modificado_por: req.usuario.id });
    res.json({ message: 'Macroproceso desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarProcesos = async (req, res) => {
  try {
    const data = await Proceso.findAll({
      include: [
        { model: Macroproceso, as: 'macroproceso', attributes: ['nombre'] },
        { model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] },
      ],
      order: [['creado_en', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerProcesoPorId = async (req, res) => {
  try {
    const data = await Proceso.findByPk(req.params.id, {
      include: [
        { model: Macroproceso, as: 'macroproceso' },
        { model: Usuario, as: 'responsable' },
      ],
    });
    if (!data) {
      return res.status(404).json({ error: 'Proceso no encontrado' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarProceso = async (req, res) => {
  try {
    const p = await Proceso.findByPk(req.params.id);
    if (!p) {
      return res.status(404).json({ error: 'Proceso no encontrado' });
    }
    const data = prepareCreateData(req.body, ['macroproceso_id', 'responsable_id']);
    await p.update({ ...data, modificado_por: req.usuario.id });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const desactivarProceso = async (req, res) => {
  try {
    const p = await Proceso.findByPk(req.params.id);
    if (!p) {
      return res.status(404).json({ error: 'Proceso no encontrado' });
    }
    await p.update({ estado: 'inactivo', modificado_por: req.usuario.id });
    res.json({ message: 'Proceso desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearProceso = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['macroproceso_id', 'responsable_id']);
    const p = await Proceso.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
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
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearActividad = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['proceso_id', 'responsable_id']);
    const a = await ActividadProceso.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteMapaProcesos = async (req, res) => {
  try {
    const procesos = await Proceso.findAll({
      include: [{ model: Macroproceso, as: 'macroproceso' }],
    });
    let html = '<table><tr><th>Código</th><th>Nombre</th><th>Macroproceso</th><th>Objetivo</th><th>Estado</th></tr>';
    procesos.forEach(p => {
      html += `<tr><td>${p.codigo || '-'}</td><td>${p.nombre || '-'}</td><td>${p.macroproceso?.nombre || '-'}</td><td>${p.objetivo || '-'}</td><td>${p.estado || '-'}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Mapa de Procesos Institucionales', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=mapa-procesos.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteMapaProcesos:', err);
    res.status(500).json({ error: formatError(err) });
  }
};
