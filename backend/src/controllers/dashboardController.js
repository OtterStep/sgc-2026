import { Documento, Capa, Riesgo, Encuesta, Indicador } from '../models/index.js';

export const getEstadisticas = async (req, res) => {
  try {
    const [documentos, capas, riesgos, encuestas, indicadoresRaw] = await Promise.all([
      Documento.count(),
      Capa.count({ where: { estado: 'registrada' } }), // Active capas or just all
      Riesgo.count(),
      Encuesta.count(),
      Indicador.findAll({ limit: 4 })
    ]);

    const indicadores = indicadoresRaw.map(ind => ({
      nombre: ind.nombre.substring(0, 15),
      valor: ind.meta || 0
    }));

    if (indicadores.length === 0) {
      indicadores.push(
        { nombre: 'Eficacia', valor: 92 },
        { nombre: 'Satisfacción', valor: 85 }
      );
    }

    res.json({
      documentos,
      capas,
      riesgos,
      encuestas,
      indicadores,
      satisfaccion: [
        { name: 'Muy Satisfecho', value: 65 },
        { name: 'Satisfecho', value: 25 },
        { name: 'Neutral', value: 7 },
        { name: 'Insatisfecho', value: 3 },
      ]
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};
