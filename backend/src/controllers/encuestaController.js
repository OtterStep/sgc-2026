import { Op } from 'sequelize';
import { Encuesta, PreguntaEncuesta, RespuestaEncuesta, Usuario } from '../models/index.js';
import { formatError } from '../utils/errorHandler.js';

// ============================================================
// LISTAR ENCUESTAS
// Filtra según el rol del usuario:
//   - admin / gestor_calidad → ven todas
//   - estudiante → solo las dirigidas a 'estudiantes' o 'todos', publicadas
//   - docente     → 'docentes' o 'todos', publicadas
//   - egresado    → 'egresados' o 'todos', publicadas
//   - administrativos → 'administrativos' o 'todos', publicadas
// ============================================================
export const listarEncuestas = async (req, res) => {
  try {
    const { rol, id: userId } = req.usuario;
    const esAdmin = ['admin', 'gestor_calidad'].includes(rol);

    // Mapa rol → valor "dirigido_a"
    const rolADirigido = {
      estudiante: 'estudiantes',
      docente: 'docentes',
      egresado: 'egresados',
      administrativos: 'administrativos',
    };

    const where = esAdmin
      ? {}
      : {
          estado: 'publicada',
          dirigido_a: { [Op.in]: [rolADirigido[rol] ?? rol, 'todos'] },
        };

    const encuestas = await Encuesta.findAll({
      where,
      include: [{ model: PreguntaEncuesta, as: 'preguntas', order: [['orden', 'ASC']] }],
      order: [['creado_en', 'DESC']],
    });

    // Para usuarios no-admin, indicar si ya respondieron cada encuesta
    if (!esAdmin) {
      const ids = encuestas.map((e) => e.id);
      const yaRespondidas = await RespuestaEncuesta.findAll({
        where: { encuesta_id: { [Op.in]: ids }, usuario_id: userId },
        attributes: ['encuesta_id'],
        group: ['encuesta_id'],
      });
      const respondidosSet = new Set(yaRespondidas.map((r) => r.encuesta_id));

      return res.json(
        encuestas.map((e) => ({
          ...e.toJSON(),
          ya_respondida: respondidosSet.has(e.id),
        }))
      );
    }

    res.json(encuestas);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// CREAR ENCUESTA (admin / gestor_calidad)
// ============================================================
export const crearEncuesta = async (req, res) => {
  try {
    const {
      codigo, titulo, descripcion, dirigido_a,
      fecha_inicio, fecha_fin, anonima, preguntas,
    } = req.body;

    const encuesta = await Encuesta.create({
      codigo, titulo, descripcion, dirigido_a,
      fecha_inicio, fecha_fin,
      anonima: anonima ?? true,
      estado: 'borrador',
      creado_por: req.usuario.id,
    });

    if (Array.isArray(preguntas) && preguntas.length > 0) {
      await PreguntaEncuesta.bulkCreate(
        preguntas.map((p, i) => ({
          encuesta_id: encuesta.id,
          texto: p.texto,
          tipo: p.tipo,
          orden: p.orden ?? i + 1,
          obligatoria: p.obligatoria !== undefined ? p.obligatoria : true,
        }))
      );
    }

    const encuestaCompleta = await Encuesta.findByPk(encuesta.id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas', order: [['orden', 'ASC']] }],
    });

    res.status(201).json(encuestaCompleta);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ACTUALIZAR ENCUESTA (admin / gestor_calidad)
// ============================================================
export const actualizarEncuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const encuesta = await Encuesta.findByPk(id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });

    const {
      titulo, descripcion, dirigido_a,
      fecha_inicio, fecha_fin, anonima, preguntas,
    } = req.body;

    await encuesta.update({
      titulo, descripcion, dirigido_a,
      fecha_inicio, fecha_fin, anonima,
      modificado_por: req.usuario.id,
    });

    // Reemplazar preguntas si se envían
    if (Array.isArray(preguntas)) {
      await PreguntaEncuesta.destroy({ where: { encuesta_id: id } });
      if (preguntas.length > 0) {
        await PreguntaEncuesta.bulkCreate(
          preguntas.map((p, i) => ({
            encuesta_id: id,
            texto: p.texto,
            tipo: p.tipo,
            orden: p.orden ?? i + 1,
            obligatoria: p.obligatoria !== undefined ? p.obligatoria : true,
          }))
        );
      }
    }

    const encuestaCompleta = await Encuesta.findByPk(id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas', order: [['orden', 'ASC']] }],
    });

    res.json(encuestaCompleta);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// CAMBIAR ESTADO (borrador → publicada → cerrada → archivada)
// ============================================================
export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = ['borrador', 'publicada', 'en_curso', 'cerrada', 'archivada'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores: ${estadosValidos.join(', ')}` });
    }

    const encuesta = await Encuesta.findByPk(id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });

    await encuesta.update({ estado, modificado_por: req.usuario.id });
    res.json({ mensaje: `Estado actualizado a '${estado}'`, encuesta });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// AGREGAR / ACTUALIZAR UNA PREGUNTA
// ============================================================
export const gestionarPregunta = async (req, res) => {
  try {
    const { encuesta_id } = req.params;
    const { id, texto, tipo, orden, obligatoria } = req.body;

    const encuesta = await Encuesta.findByPk(encuesta_id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });

    let pregunta;
    if (id) {
      pregunta = await PreguntaEncuesta.findByPk(id);
      if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
      await pregunta.update({ texto, tipo, orden, obligatoria });
    } else {
      pregunta = await PreguntaEncuesta.create({
        encuesta_id, texto, tipo, orden, obligatoria: obligatoria ?? true,
      });
    }

    res.status(id ? 200 : 201).json(pregunta);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ELIMINAR PREGUNTA
// ============================================================
export const eliminarPregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const pregunta = await PreguntaEncuesta.findByPk(id);
    if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
    await pregunta.destroy();
    res.json({ mensaje: 'Pregunta eliminada' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// ENVIAR RESPUESTAS
// Bloquea si el usuario ya respondió (encuesta contestada).
// Respeta anonimato: no guarda usuario_id si anonima = true.
// ============================================================
export const enviarRespuesta = async (req, res) => {
  try {
    const { encuesta_id, respuestas } = req.body;
    const userId = req.usuario?.id ?? null;

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ error: 'Respuestas no proporcionadas o formato inválido' });
    }

    const encuesta = await Encuesta.findByPk(encuesta_id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas' }],
    });
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
    if (encuesta.estado !== 'publicada' && encuesta.estado !== 'en_curso') {
      return res.status(400).json({ error: 'La encuesta no está disponible para responder' });
    }

    // Verificar si ya respondió (solo si no es anónima o si podemos rastrear)
    if (userId) {
      const yaRespondio = await RespuestaEncuesta.findOne({
        where: { encuesta_id, usuario_id: userId },
      });
      if (yaRespondio) {
        return res.status(409).json({ error: 'Ya respondiste esta encuesta' });
      }
    }

    const respuestasData = respuestas.map((r) => ({
      encuesta_id,
      pregunta_id: r.pregunta_id,
      usuario_id: encuesta.anonima ? null : userId,
      valor_texto: r.valor_texto ?? null,
      valor_numerico: r.valor_numerico !== undefined ? r.valor_numerico : null,
    }));

    await RespuestaEncuesta.bulkCreate(respuestasData);
    res.status(201).json({ mensaje: 'Respuestas registradas con éxito' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

// ============================================================
// RESULTADOS CONSOLIDADOS
// Devuelve por pregunta: total, promedio (numéricas/likert),
// distribución de valores y respuestas abiertas.
// ============================================================
export const obtenerResultados = async (req, res) => {
  try {
    const { id } = req.params;

    const encuesta = await Encuesta.findByPk(id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas', order: [['orden', 'ASC']] }],
    });
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });

    const todasRespuestas = await RespuestaEncuesta.findAll({
      where: { encuesta_id: id },
    });

    // Contar respondentes únicos.
    // Para encuestas anónimas (usuario_id = null) contamos sesiones únicas
    // agrupando por enviado_en truncado al minuto — pero lo más fiable es
    // dividir el total de filas entre el número de preguntas.
    const totalPreguntas = encuesta.preguntas.length;
    const identificados = new Set(
      todasRespuestas.filter((r) => r.usuario_id).map((r) => r.usuario_id)
    );
    const totalRespondentes = identificados.size > 0
      ? identificados.size
      : totalPreguntas > 0
        ? Math.round(todasRespuestas.length / totalPreguntas)
        : 0;

    const resultadosPorPregunta = encuesta.preguntas.map((pregunta) => {
      const rPreg = todasRespuestas.filter((r) => r.pregunta_id === pregunta.id);
      const total = rPreg.length;

      if (['likert_5', 'likert_7', 'numerica'].includes(pregunta.tipo)) {
        const valores = rPreg
          .map((r) => parseFloat(r.valor_numerico))
          .filter((v) => !isNaN(v));
        const promedio = valores.length
          ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2)
          : null;

        // Distribución de frecuencias
        const distribucion = {};
        valores.forEach((v) => { distribucion[v] = (distribucion[v] ?? 0) + 1; });

        return { pregunta_id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, total, promedio, distribucion };
      }

      if (pregunta.tipo === 'si_no') {
        // Usar == (loose) o parseFloat para manejar strings/decimals de PG
        const si = rPreg.filter((r) => parseFloat(r.valor_numerico) === 1).length;
        const no = rPreg.filter((r) => parseFloat(r.valor_numerico) === 0).length;
        return { pregunta_id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, total, si, no };
      }

      if (pregunta.tipo === 'abierta') {
        const textos = rPreg.map((r) => r.valor_texto).filter(Boolean);
        return { pregunta_id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, total, respuestas_texto: textos };
      }

      return { pregunta_id: pregunta.id, texto: pregunta.texto, tipo: pregunta.tipo, total };
    });

    res.json({
      encuesta: {
        id: encuesta.id,
        codigo: encuesta.codigo,
        titulo: encuesta.titulo,
        estado: encuesta.estado,
        dirigido_a: encuesta.dirigido_a,
        anonima: encuesta.anonima,
        fecha_inicio: encuesta.fecha_inicio,
        fecha_fin: encuesta.fecha_fin,
      },
      total_respondentes: totalRespondentes,
      resultados: resultadosPorPregunta,
    });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};