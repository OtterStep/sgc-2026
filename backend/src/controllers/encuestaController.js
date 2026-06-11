import { Encuesta, PreguntaEncuesta, RespuestaEncuesta } from '../models/index.js';

export const listarEncuestas = async (req, res) => {
  try {
    const data = await Encuesta.findAll({
      include: [{ model: PreguntaEncuesta, as: 'preguntas' }],
      order: [['creado_en', 'DESC']]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearEncuesta = async (req, res) => {
  try {
    const { codigo, titulo, descripcion, dirigido_a, fecha_inicio, fecha_fin, anonima, preguntas } = req.body;
    
    // Crear la encuesta
    const encuesta = await Encuesta.create({
      codigo,
      titulo,
      descripcion,
      dirigido_a,
      fecha_inicio,
      fecha_fin,
      anonima,
      estado: 'borrador',
      creado_por: req.usuario.id
    });

    // Crear preguntas si se proveen
    if (preguntas && preguntas.length > 0) {
      const preguntasData = preguntas.map((p, index) => ({
        encuesta_id: encuesta.id,
        texto: p.texto,
        tipo: p.tipo,
        orden: p.orden || (index + 1),
        obligatoria: p.obligatoria !== undefined ? p.obligatoria : true
      }));
      await PreguntaEncuesta.bulkCreate(preguntasData);
    }

    const encuestaCompleta = await Encuesta.findByPk(encuesta.id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas' }]
    });

    res.status(201).json(encuestaCompleta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const enviarRespuesta = async (req, res) => {
  try {
    const { encuesta_id, respuestas } = req.body;
    const usuario_id = req.usuario?.id || null;

    if (!respuestas || !Array.isArray(respuestas)) {
      return res.status(400).json({ error: 'Respuestas no proporcionadas o en formato inválido' });
    }

    const respuestasData = respuestas.map(r => ({
      encuesta_id,
      pregunta_id: r.pregunta_id,
      usuario_id: r.usuario_id || usuario_id,
      valor_texto: r.valor_texto,
      valor_numerico: r.valor_numerico
    }));

    await RespuestaEncuesta.bulkCreate(respuestasData);
    res.status(201).json({ mensaje: 'Respuestas registradas con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const obtenerResultados = async (req, res) => {
  try {
    const { id } = req.params;
    
    const encuesta = await Encuesta.findByPk(id, {
      include: [{ model: PreguntaEncuesta, as: 'preguntas' }]
    });

    if (!encuesta) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    // Obtener todas las respuestas para esta encuesta
    const respuestas = await RespuestaEncuesta.findAll({
      where: { encuesta_id: id }
    });

    res.json({
      encuesta,
      respuestas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
