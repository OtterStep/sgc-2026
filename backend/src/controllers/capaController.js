import { Capa, Hallazgo, Usuario } from '../models/index.js';
import { generarPDF, plantillaReporte } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarCapas = async (req, res) => {
  try {
    const capas = await Capa.findAll({
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['id', 'codigo', 'descripcion'] },
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombres', 'apellidos'] },
      ],
      order: [['creado_en', 'DESC']],
    });
    res.json(capas);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerCapa = async (req, res) => {
  try {
    const capa = await Capa.findByPk(req.params.id, {
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['id', 'codigo', 'descripcion'] },
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombres', 'apellidos'] },
      ],
    });
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    res.json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearCapa = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['hallazgo_id', 'responsable_id']);
    const capa = await Capa.create({
      ...data,
      creado_por: req.usuario.id,
      estado: 'registrada',
    });
    res.status(201).json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarCapa = async (req, res) => {
  try {
    const capa = await Capa.findByPk(req.params.id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    const data = prepareCreateData(req.body, ['hallazgo_id', 'responsable_id']);
    await capa.update({ ...data, modificado_por: req.usuario.id });
    res.json(capa);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarEstadoCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, efectividad } = req.body;
    const updateData = { estado, modificado_por: req.usuario.id };
    
    if (efectividad) {
      updateData.efectividad = efectividad;
    }

    const capa = await Capa.findByPk(id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    await capa.update(updateData);

    if (estado === 'cerrada' && capa.hallazgo_id) {
      const fechaHoy = new Date().toISOString().split('T')[0];
      await Hallazgo.update(
        { estado: 'cerrado', fecha_cierre: fechaHoy, modificado_por: req.usuario.id },
        { where: { id: capa.hallazgo_id } }
      );
    }

    if (efectividad === 'no_efectiva') {
      const fechaHoy = new Date();
      const year = fechaHoy.getFullYear();
      const codigoNuevo = `CAPA-DERIVADA-${year}-${Date.now()}`;
      const dataNueva = {
        codigo: codigoNuevo,
        tipo: 'correctiva',
        descripcion: `CAPA derivada de la no efectividad de ${capa.codigo}`,
        causa_raiz: `Acción de ${capa.codigo} no fue efectiva`,
        accion_propuesta: 'Reevaluar y definir nueva acción',
        responsable_id: capa.responsable_id,
        fecha_implementacion: null,
      };
      await Capa.create({
        ...dataNueva,
        creado_por: req.usuario.id,
        estado: 'registrada',
      });
    }

    res.json({ mensaje: 'CAPA actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteCapa = async (req, res) => {
  try {
    const capas = await Capa.findAll({
      include: [
        { model: Hallazgo, as: 'hallazgo', attributes: ['codigo'] },
        { model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] },
      ],
    });
    let html = plantillaReporte('Reporte de Acciones Correctivas y Preventivas', `
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f1f5f9;">
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Código</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Tipo</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Descripción</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Responsable</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Estado</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Efectividad</th>
          <th style="border: 1px solid #e2e8f0; padding: 8px;">Hallazgo Origen</th>
        </tr>
        ${capas.map(c => `<tr>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.codigo || '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.tipo || '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.descripcion || '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.responsable ? `${c.responsable.nombres || ''} ${c.responsable.apellidos || ''}` : '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.estado || '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.efectividad || '-'}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px;">${c.hallazgo?.codigo || '-'}</td>
        </tr>`).join('')}
      </table>
    `);
    const pdf = await generarPDF(html);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=reporte-capas.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteCapa:', err);
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarCapa = async (req, res) => {
  try {
    const { id } = req.params;
    const capa = await Capa.findByPk(id);
    if (!capa) return res.status(404).json({ error: 'CAPA no encontrada' });
    await capa.destroy();
    res.json({ mensaje: 'CAPA eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
