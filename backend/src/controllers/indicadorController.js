import { Indicador, MedicionIndicador, Proceso } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError } from '../utils/errorHandler.js';

export const listarIndicadores = async (req, res) => {
  try {
    const data = await Indicador.findAll({
      include: [{ model: Proceso, as: 'proceso', attributes: ['nombre'] }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearIndicador = async (req, res) => {
  try {
    const i = await Indicador.create({ ...req.body, creado_por: req.usuario.id });
    res.status(201).json(i);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarMediciones = async (req, res) => {
  try {
    const { indicador_id } = req.params;
    const data = await MedicionIndicador.findAll({
      where: { indicador_id },
      order: [['creado_en', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const registrarMedicion = async (req, res) => {
  try {
    const { indicador_id, periodo, valor_real, valor_esperado } = req.body;
    const cumplimiento = valor_esperado ? ((valor_real / valor_esperado) * 100).toFixed(2) : null;
    const m = await MedicionIndicador.create({
      indicador_id, periodo, valor_real, valor_esperado, cumplimiento,
      creado_por: req.usuario.id,
    });
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteIndicadores = async (req, res) => {
  try {
    const indicadores = await Indicador.findAll({ include: [{ model: Proceso, as: 'proceso' }] });
    let html = '<table><tr><th>Código</th><th>Nombre</th><th>Proceso</th><th>Tipo</th><th>Meta</th><th>Estado</th></tr>';
    indicadores.forEach(i => {
      html += `<tr><td>${i.codigo}</td><td>${i.nombre}</td><td>${i.proceso?.nombre || '-'}</td><td>${i.tipo}</td><td>${i.meta || '-'}</td><td>${i.estado}</td></tr>`;
    });
    html += '</table>';
    const pdf = await generarPDF(plantillaReporte('Reporte de Indicadores de Gestión', html));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=indicadores.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
