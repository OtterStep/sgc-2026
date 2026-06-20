import { Capa, Hallazgo, Usuario } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
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
    const filas = capas.map(c => ([
      c.codigo || '-',
      c.tipo || '-',
      c.descripcion || '-',
      c.responsable ? `${c.responsable.nombres || ''} ${c.responsable.apellidos || ''}`.trim() : '-',
      c.estado || '-',
      c.efectividad || '-',
      c.hallazgo?.codigo || '-',
    ]));
    const pdf = await generarPDF({
      titulo: 'Reporte de Acciones Correctivas y Preventivas',
      columnas: ['Código', 'Tipo', 'Descripción', 'Responsable', 'Estado', 'Efectividad', 'Hallazgo Origen'],
      filas,
    });
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
