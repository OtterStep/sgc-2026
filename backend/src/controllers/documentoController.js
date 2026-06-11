import { Documento, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { dispararWebhook } from '../services/n8nService.js';
import { validationResult } from 'express-validator';

export const listarDocumentos = async (req, res) => {
  try {
    const docs = await Documento.findAll({
      include: [{ model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] }],
      order: [['creado_en', 'DESC']],
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearDocumento = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const doc = await Documento.create({
      ...req.body,
      creado_por: req.usuario.id,
    });
    await dispararWebhook('notificar-documento', { accion: 'creado', documento: doc.codigo });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generarReporteDocumentos = async (req, res) => {
  try {
    const docs = await Documento.findAll({ raw: true });
    let filas = docs.map(d => `
      <tr>
        <td>${d.codigo}</td>
        <td>${d.titulo}</td>
        <td>${d.estado}</td>
        <td>${d.version_actual}</td>
        <td>${new Date(d.creado_en).toLocaleDateString('es-PE')}</td>
      </tr>
    `).join('');

    const html = plantillaReporte('Reporte de Documentos', `
      <table>
        <tr><th>Código</th><th>Título</th><th>Estado</th><th>Versión</th><th>Fecha Creación</th></tr>
        ${filas}
      </table>
    `);

    const pdf = await generarPDF(html);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=documentos.pdf' });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
