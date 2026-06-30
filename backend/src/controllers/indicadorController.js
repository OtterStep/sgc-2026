import { Op } from 'sequelize';
import { Indicador, MedicionIndicador, Proceso, PeriodoAcademico } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { generarPDFReporteIndicadores } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';

export const listarIndicadores = async (req, res) => {
  try {
    const data = await Indicador.findAll({
      include: [{ model: Proceso, as: 'proceso', attributes: ['nombre'] }],
      order: [['creado_en', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearIndicador = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['proceso_id']);
    const i = await Indicador.create({ ...data, creado_por: req.usuario.id });
    res.status(201).json(i);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarIndicador = async (req, res) => {
  try {
    const { id } = req.params;
    const data = prepareCreateData(req.body, ['proceso_id']);
    const indicador = await Indicador.findByPk(id);
    if (!indicador) return res.status(404).json({ error: 'Indicador no encontrado' });
    await Indicador.update({ ...data, modificado_por: req.usuario.id }, { where: { id } });
    res.json({ mensaje: 'Indicador actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarIndicador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const indicador = await Indicador.findByPk(id, { transaction: t });
    if (!indicador) {
      await t.rollback();
      return res.status(404).json({ error: 'Indicador no encontrado' });
    }
    await MedicionIndicador.destroy({ where: { indicador_id: id }, transaction: t });
    await Indicador.destroy({ where: { id }, transaction: t });
    await t.commit();
    res.json({ mensaje: 'Indicador eliminado correctamente' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarMediciones = async (req, res) => {
  try {
    const { indicador_id } = req.params;
    const data = await MedicionIndicador.findAll({
      where: { indicador_id },
      order: [['fecha_medicion', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const registrarMedicion = async (req, res) => {
  try {
    const data = prepareCreateData(req.body, ['indicador_id']);
    if (data.periodo) {
      const periodoExiste = await PeriodoAcademico.findOne({ where: { codigo: data.periodo } });
      if (!periodoExiste) {
        return res.status(400).json({ error: `El período '${data.periodo}' no existe en la lista de periodos académicos` });
      }
    }
    const cumplimiento = data.valor_esperado ? ((data.valor_real / data.valor_esperado) * 100).toFixed(2) : null;
    if (!data.fecha_medicion) {
      data.fecha_medicion = new Date().toISOString().split('T')[0];
    }
    const m = await MedicionIndicador.create({
      ...data,
      cumplimiento,
      creado_por: req.usuario.id,
    });
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const actualizarMedicion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = prepareCreateData(req.body, ['indicador_id']);
    const med = await MedicionIndicador.findByPk(id);
    if (!med) return res.status(404).json({ error: 'Medición no encontrada' });
    if (data.periodo) {
      const periodoExiste = await PeriodoAcademico.findOne({ where: { codigo: data.periodo } });
      if (!periodoExiste) {
        return res.status(400).json({ error: `El período '${data.periodo}' no existe en la lista de periodos académicos` });
      }
    }
    const cumplimiento = data.valor_esperado ? ((data.valor_real / data.valor_esperado) * 100).toFixed(2) : null;
    await MedicionIndicador.update({ ...data, cumplimiento }, { where: { id } });
    res.json({ mensaje: 'Medición actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const eliminarMedicion = async (req, res) => {
  try {
    const { id } = req.params;
    const med = await MedicionIndicador.findByPk(id);
    if (!med) return res.status(404).json({ error: 'Medición no encontrada' });
    await MedicionIndicador.destroy({ where: { id } });
    res.json({ mensaje: 'Medición eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const reporteIndicadores = async (req, res) => {
  try {
    const { tipo_filtro, periodo_id, fecha_inicio, fecha_fin } = req.query;

    let rangoInfo = '';
    let filtroMediciones = {};

    if (tipo_filtro === 'periodo' && periodo_id) {
      const periodo = await PeriodoAcademico.findByPk(periodo_id);
      if (periodo) {
        const inicio = new Date(periodo.fecha_inicio).toLocaleDateString('es-PE');
        const fin = new Date(periodo.fecha_fin).toLocaleDateString('es-PE');
        rangoInfo = `Periodo: ${periodo.codigo} — ${periodo.nombre} (${inicio} al ${fin})`;
        filtroMediciones = {
          fecha_medicion: { [Op.between]: [periodo.fecha_inicio, periodo.fecha_fin] },
        };
      }
    } else if (tipo_filtro === 'fecha' && fecha_inicio && fecha_fin) {
      rangoInfo = `Desde: ${new Date(fecha_inicio).toLocaleDateString('es-PE')} — Hasta: ${new Date(fecha_fin).toLocaleDateString('es-PE')}`;
      filtroMediciones = {
        fecha_medicion: { [Op.between]: [fecha_inicio, fecha_fin] },
      };
    }

    const indicadores = await Indicador.findAll({
      include: [
        { model: Proceso, as: 'proceso', attributes: ['nombre'] },
        {
          model: MedicionIndicador, as: 'mediciones',
          where: Object.keys(filtroMediciones).length ? filtroMediciones : undefined,
          required: false,
          order: [['fecha_medicion', 'ASC']],
        },
      ],
      order: [['codigo', 'ASC']],
    });

    const pdf = await generarPDFReporteIndicadores({
      titulo: 'Reporte de Indicadores de Gestión',
      subtitulo: rangoInfo,
      indicadores: indicadores.map(i => ({
        codigo: i.codigo,
        nombre: i.nombre,
        tipo: i.tipo,
        meta: i.meta,
        unidad_medida: i.unidad_medida || '',
        proceso: i.proceso?.nombre || '-',
        estado: i.estado,
        mediciones: (i.mediciones || []).map(m => ({
          periodo: m.periodo,
          fecha_medicion: m.fecha_medicion,
          valor_real: Number(m.valor_real),
          valor_esperado: Number(m.valor_esperado),
          cumplimiento: Number(m.cumplimiento),
        })),
      })),
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=indicadores.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteIndicadores:', err);
    res.status(500).json({ error: formatError(err) });
  }
};
