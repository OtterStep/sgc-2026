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
