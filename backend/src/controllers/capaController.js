import { Capa, Hallazgo, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError } from '../utils/errorHandler.js';

export const listarCapas = async (req, res) => {
  try {
    const capas = await Capa.findAll({
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['descripcion'] },
        { model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] },
      ],
    });
    res.json(capas);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearCapa = async (req, res) => {
  try {
    const capa = await Capa.create({
      ...req.body,
      creado_por: req.usuario.id,
    });
    res.status(201).json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarEstadoCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, efectividad } = req.body;
    await Capa.update({ estado, efectividad, modificado_por: req.usuario.id }, { where: { id } });
    res.json({ mensaje: 'CAPA actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteCapa = async (req, res) => {
  try {
    const capas = await Capa.findAll({ include: [{ model: Usuario, as: 'responsable' }], raw: true });
    const html = plantillaReporte('Reporte de Acciones Correctivas y Preventivas', `
      <table>
        <tr><th>Código</th><th>Tipo</th><th>Descripción</th><th>Responsable</th><th>Estado</th><th>Efectividad</th></tr>
        ${capas.map(c => `<tr><td>${c.codigo}</td><td>${c.tipo}</td><td>${c.descripcion}</td><td>${c['responsable.nombres'] || ''}</td><td>${c.estado}</td><td>${c.efectividad || '-'}</td></tr>`).join('')}
      </table>
    `);
    const pdf = await generarPDF(html);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=capa.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
