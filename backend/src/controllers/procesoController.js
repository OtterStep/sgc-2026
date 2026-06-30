import { Proceso, Macroproceso, ActividadProceso, Usuario, VersionMapa, ParametroSistema } from '../models/index.js';
import { generarPDF } from '../services/pdfService.js';
import { formatError, prepareCreateData } from '../utils/errorHandler.js';
import { sequelize } from '../config/database.js';

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
    const filas = procesos.map(p => ([
      p.codigo || '-',
      p.nombre || '-',
      p.macroproceso?.nombre || '-',
      p.objetivo || '-',
      p.estado || '-',
    ]));
    const pdf = await generarPDF({
      titulo: 'Mapa de Procesos Institucionales',
      columnas: ['Código', 'Nombre', 'Macroproceso', 'Objetivo', 'Estado'],
      filas,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=mapa-procesos.pdf' });
    res.send(pdf);
  } catch (err) {
    console.error('Error en reporteMapaProcesos:', err);
    res.status(500).json({ error: formatError(err) });
  }
};

// ==========================================
// MAPA DE PROCESOS - VERSIONES
// ==========================================

export const obtenerMapaPublico = async (req, res) => {
  try {
    const param = await ParametroSistema.findOne({ where: { clave: 'version_mapa_actual' } });
    const versionActual = parseInt(param?.valor || '0', 10);

    if (versionActual === 0) {
      return res.json({ publicada: false, version: null, datos: null });
    }

    const version = await VersionMapa.findOne({
      where: { numero_version: versionActual, activa: true },
      include: [{ model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] }],
    });

    if (version) {
      return res.json({
        publicada: true,
        version: version.numero_version,
        datos: version.datos,
        creado_en: version.creado_en,
        cambios_descripcion: version.cambios_descripcion,
        creado_por: version.creadoPor,
      });
    }

    return res.json({ publicada: false, version: null, datos: null });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const obtenerMapaActual = async (req, res) => {
  try {
    const param = await ParametroSistema.findOne({ where: { clave: 'version_mapa_actual' } });
    const versionActual = parseInt(param?.valor || '1', 10);

    const version = await VersionMapa.findOne({
      where: { numero_version: versionActual, activa: true },
      include: [{ model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] }],
    });

    if (version) {
      return res.json({ version: version.numero_version, datos: version.datos, creado_en: version.creado_en, creado_por: version.creadoPor });
    }

    const macroprocesos = await Macroproceso.findAll({
      where: { estado: true },
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
      order: [['codigo', 'ASC']],
    });

    return res.json({
      version: 1,
      datos: {
        estrategicos: macroprocesos.filter(m => m.clasificacion_mapa === 'estrategico'),
        misionales: macroprocesos.filter(m => m.clasificacion_mapa === 'misional'),
        soporte: macroprocesos.filter(m => m.clasificacion_mapa === 'soporte'),
        sin_clasificar: macroprocesos.filter(m => !m.clasificacion_mapa || !['estrategico', 'misional', 'soporte'].includes(m.clasificacion_mapa)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const listarVersionesMapa = async (req, res) => {
  try {
    const versiones = await VersionMapa.findAll({
      include: [{ model: Usuario, as: 'creadoPor', attributes: ['nombres', 'apellidos'] }],
      order: [['numero_version', 'DESC']],
    });
    res.json(versiones);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const crearNuevaVersionMapa = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cambios_descripcion } = req.body;

    const param = await ParametroSistema.findOne({
      where: { clave: 'version_mapa_actual' },
      transaction: t,
    });

    const versionActual = param ? parseInt(param.valor, 10) : 0;
    const nuevaVersion = versionActual + 1;

    const macroprocesos = await Macroproceso.findAll({
      where: { estado: true },
      include: [{ model: Usuario, as: 'responsable', attributes: ['nombres', 'apellidos'] }],
      order: [['codigo', 'ASC']],
      transaction: t,
    });

    const datos = {
      estrategicos: macroprocesos.filter(m => m.clasificacion_mapa === 'estrategico'),
      misionales: macroprocesos.filter(m => m.clasificacion_mapa === 'misional'),
      soporte: macroprocesos.filter(m => m.clasificacion_mapa === 'soporte'),
      sin_clasificar: macroprocesos.filter(m => !m.clasificacion_mapa || !['estrategico', 'misional', 'soporte'].includes(m.clasificacion_mapa)),
    };

    await VersionMapa.create({
      numero_version: nuevaVersion,
      cambios_descripcion: cambios_descripcion || `Versión ${nuevaVersion} del mapa de procesos`,
      datos,
      activa: true,
      creado_por: req.usuario.id,
    }, { transaction: t });

    if (versionActual > 0) {
      await VersionMapa.update(
        { activa: false },
        { where: { numero_version: versionActual }, transaction: t }
      );
    }

    if (param) {
      await param.update({ valor: String(nuevaVersion) }, { transaction: t });
    } else {
      await ParametroSistema.create({
        clave: 'version_mapa_actual',
        valor: String(nuevaVersion),
        descripcion: 'Versión actual del mapa de procesos',
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Nueva versión publicada', version: nuevaVersion });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: formatError(err) });
  }
};
