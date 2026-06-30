import { PeriodoAcademico } from '../models/index.js';
import { formatError } from '../utils/errorHandler.js';

export const listarPeriodos = async (req, res) => {
  try {
    const data = await PeriodoAcademico.findAll({
      order: [['fecha_inicio', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearPeriodo = async (req, res) => {
  try {
    const { codigo, nombre, fecha_inicio, fecha_fin } = req.body;
    if (!codigo || !nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const existe = await PeriodoAcademico.findOne({ where: { codigo } });
    if (existe) return res.status(400).json({ error: 'El código de periodo ya existe' });

    const p = await PeriodoAcademico.create({
      codigo, nombre, fecha_inicio, fecha_fin,
      creado_por: req.usuario.id,
    });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerPeriodoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await PeriodoAcademico.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Periodo no encontrado' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarPeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await PeriodoAcademico.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Periodo no encontrado' });
    const { codigo, nombre, fecha_inicio, fecha_fin, activo } = req.body;
    if (codigo && codigo !== p.codigo) {
      const existe = await PeriodoAcademico.findOne({ where: { codigo } });
      if (existe) return res.status(400).json({ error: 'El código de periodo ya está en uso' });
    }
    await p.update({ codigo, nombre, fecha_inicio, fecha_fin, activo });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const desactivarPeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await PeriodoAcademico.findByPk(id);
    if (!p) return res.status(404).json({ error: 'Periodo no encontrado' });
    await p.update({ activo: false });
    res.json({ message: 'Periodo desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
