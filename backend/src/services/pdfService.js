import PDFDocument from 'pdfkit';

const MARGIN = 40;
const BORDER_COLOR = '#D1D5DB';
const HEADER_BG = '#003366';
const HEADER_TEXT = '#FFFFFF';
const TITLE_COLOR = '#111827';
const SUBTITLE_COLOR = '#4B5563';

const normalizarValor = (valor) => (valor === null || valor === undefined || valor === '' ? '-' : String(valor));

const calcularAnchoColumnas = (columnas, anchoDisponible) => {
  if (!columnas.length) {
    return [];
  }

  const anchoBase = anchoDisponible / columnas.length;
  return columnas.map(() => anchoBase);
};

const dibujarEncabezado = (doc, titulo, institucion) => {
  const anchoPagina = doc.page.width - (MARGIN * 2);

  doc.fillColor(TITLE_COLOR).fontSize(18).text(institucion, MARGIN, MARGIN, {
    align: 'center',
    width: anchoPagina,
  });

  doc.fillColor(SUBTITLE_COLOR).fontSize(13).text('Sistema de Gestión de la Calidad', {
    align: 'center',
  });

  doc.moveDown(0.4);

  doc.fillColor(TITLE_COLOR).fontSize(15).text(titulo, {
    align: 'center',
  });

  doc.moveDown(1);
};

const dibujarCabeceraTabla = (doc, columnas, xInicial, yInicial, anchos, altura) => {
  let x = xInicial;

  columnas.forEach((columna, indice) => {
    doc.save();
    doc.rect(x, yInicial, anchos[indice], altura).fillAndStroke(HEADER_BG, BORDER_COLOR);
    doc.fillColor(HEADER_TEXT).fontSize(10).text(columna, x + 4, yInicial + 6, {
      width: anchos[indice] - 8,
      align: 'left',
    });
    doc.restore();
    x += anchos[indice];
  });
};

const dibujarFila = (doc, fila, xInicial, yInicial, anchos, altura) => {
  let x = xInicial;

  fila.forEach((valor, indice) => {
    doc.save();
    doc.rect(x, yInicial, anchos[indice], altura).strokeColor(BORDER_COLOR).stroke();
    doc.fillColor('#111827').fontSize(10).text(normalizarValor(valor), x + 4, yInicial + 5, {
      width: anchos[indice] - 8,
      height: altura - 10,
      align: 'left',
    });
    doc.restore();
    x += anchos[indice];
  });
};

const COLOR_META = '#EF4444';
const COLOR_VALOR_REAL = '#003366';
const COLOR_CUMPLIMIENTO = '#4d94ff';

const verificarSaltoPagina = (doc, y, espacioNecesario) => {
  if (y + espacioNecesario > doc.page.height - MARGIN - 30) {
    doc.addPage();
    return MARGIN + 20;
  }
  return y;
};

const dibujarBarChart = (doc, mediciones, meta, x, y, ancho, alto) => {
  if (!mediciones.length) return y;

  const valores = mediciones.map(m => m.valor_real);
  const cumplimientos = mediciones.map(m => m.cumplimiento);
  const maxValor = Math.max(...valores, ...cumplimientos, Number(meta || 0), 100);
  const yMax = Math.ceil(maxValor / 10) * 10;

  const chartLeft = x + 40;
  const chartBottom = y + alto;
  const chartWidth = ancho - 50;
  const chartHeight = alto - 25;

  // Ejes
  doc.rect(chartLeft, y, 1, chartHeight).stroke('#94A3B8');
  doc.rect(chartLeft, chartBottom, chartWidth, 1).stroke('#94A3B8');

  // Línea de meta
  if (meta) {
    const metaY = chartBottom - (Number(meta) / yMax) * chartHeight;
    doc.save();
    doc.moveTo(chartLeft, metaY).lineTo(chartLeft + chartWidth, metaY);
    doc.dash(4, 3);
    doc.stroke(COLOR_META);
    doc.restore();
    doc.fillColor(COLOR_META).fontSize(8).text(`Meta: ${meta}`, chartLeft + chartWidth - 50, metaY - 10);
  }

  // Y-axis labels
  doc.fillColor('#64748B').fontSize(8);
  for (let i = 0; i <= 4; i++) {
    const val = (yMax / 4) * i;
    const labelY = chartBottom - (val / yMax) * chartHeight;
    doc.text(String(Math.round(val)), chartLeft - 30, labelY - 4, { width: 25, align: 'right' });
    doc.rect(chartLeft - 3, labelY, 3, 0.5).fill('#94A3B8');
  }

  // Barras
  const barWidth = Math.min((chartWidth / mediciones.length) * 0.35, 20);
  const gap = chartWidth / mediciones.length;

  mediciones.forEach((m, i) => {
    const xBar = chartLeft + gap * i + (gap - barWidth * 2) / 2;
    const hReal = (m.valor_real / yMax) * chartHeight;
    const hCumpl = (m.cumplimiento / yMax) * chartHeight;

    // Barra valor_real
    doc.rect(xBar, chartBottom - hReal, barWidth, hReal).fill(COLOR_VALOR_REAL);

    // Barra % cumplimiento
    doc.rect(xBar + barWidth + 2, chartBottom - hCumpl, barWidth, hCumpl).fill(COLOR_CUMPLIMIENTO);

    // Periodo label
    doc.fillColor('#64748B').fontSize(7).text(m.periodo || '', xBar - 5, chartBottom + 4, {
      width: gap + 10, align: 'center',
    });
  });

  // Leyenda
  const leyendaY = chartBottom + 20;
  doc.rect(chartLeft, leyendaY, 10, 10).fill(COLOR_VALOR_REAL);
  doc.fillColor('#111827').fontSize(8).text('Valor Real', chartLeft + 14, leyendaY + 1);
  doc.rect(chartLeft + 80, leyendaY, 10, 10).fill(COLOR_CUMPLIMIENTO);
  doc.fillColor('#111827').fontSize(8).text('% Cumplimiento', chartLeft + 94, leyendaY + 1);

  return chartBottom + 40;
};

export const generarPDF = async ({
  titulo,
  institucion = 'Universidad Nacional de Trujillo',
  columnas = [],
  filas = [],
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: columnas.length > 5 ? 'landscape' : 'portrait',
        margin: MARGIN,
        bufferPages: true,
      });

      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      const anchoDisponible = doc.page.width - (MARGIN * 2);
      const anchosColumnas = calcularAnchoColumnas(columnas, anchoDisponible);
      const xTabla = MARGIN;
      const alturaCabecera = 24;
      let y = 0;

      dibujarEncabezado(doc, titulo, institucion);
      y = doc.y + 4;

      if (!columnas.length || !filas.length) {
        doc.fillColor('#111827').fontSize(11).text('No hay datos disponibles para generar el reporte.', MARGIN, y);
        doc.end();
        return;
      }

      dibujarCabeceraTabla(doc, columnas, xTabla, y, anchosColumnas, alturaCabecera);
      y += alturaCabecera;

      filas.forEach((fila) => {
        const alturaFila = Math.max(
          24,
          ...fila.map((valor, indice) => doc.heightOfString(normalizarValor(valor), {
            width: anchosColumnas[indice] - 8,
            align: 'left',
          }))
        ) + 10;

        if (y + alturaFila > doc.page.height - MARGIN - 30) {
          doc.addPage();
          dibujarEncabezado(doc, titulo, institucion);
          y = doc.y + 4;
          dibujarCabeceraTabla(doc, columnas, xTabla, y, anchosColumnas, alturaCabecera);
          y += alturaCabecera;
        }

        dibujarFila(doc, fila, xTabla, y, anchosColumnas, alturaFila);
        y += alturaFila;
      });

      doc.moveDown(1.5);
      doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(
        `Documento generado el ${new Date().toLocaleString('es-PE')} | SGC-UNT v1.0`,
        {
          align: 'center',
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generarPDFReporteIndicadores = async ({
  titulo,
  subtitulo = '',
  institucion = 'Universidad Nacional de Trujillo',
  indicadores = [],
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: MARGIN, bufferPages: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      dibujarEncabezado(doc, titulo, institucion);
      let y = doc.y + 4;

      if (subtitulo) {
        doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(subtitulo, MARGIN, y, { align: 'center', width: doc.page.width - MARGIN * 2 });
        y = doc.y + 6;
      }
      const anchoPagina = doc.page.width - MARGIN * 2;
      const xTabla = MARGIN;

      // Tabla resumen
      const columnas = ['Código', 'Nombre', 'Proceso', 'Tipo', 'Meta', 'Mediciones'];
      const anchos = [50, 140, 100, 60, 40, 60];
      const altCab = 22;

      y = verificarSaltoPagina(doc, y, 200);
      doc.fillColor('#111827').fontSize(12).text('Resumen de Indicadores', MARGIN, y);
      y = doc.y + 6;

      dibujarCabeceraTabla(doc, columnas, xTabla, y, anchos, altCab);
      y += altCab;

      indicadores.forEach(ind => {
        const fila = [
          ind.codigo, ind.nombre, ind.proceso,
          ind.tipo, ind.meta, `${ind.mediciones.length} registros`,
        ];
        const altFila = Math.max(22, ...fila.map((v, i) =>
          doc.heightOfString(normalizarValor(v), { width: anchos[i] - 8 })
        )) + 10;

        y = verificarSaltoPagina(doc, y, altFila);
        dibujarFila(doc, fila, xTabla, y, anchos, altFila);
        y += altFila;
      });

      y += 20;

      // Sección por indicador con gráficos
      indicadores.forEach(ind => {
        y = verificarSaltoPagina(doc, y, 120);

        doc.save();
        doc.rect(MARGIN, y, anchoPagina, 1).fill('#003366');
        doc.restore();

        y += 6;
        doc.fillColor('#003366').fontSize(13).text(`${ind.codigo} — ${ind.nombre}`, MARGIN, y);
        y = doc.y + 2;

        doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(
          `Tipo: ${ind.tipo}  |  Meta: ${ind.meta}${ind.unidad_medida}  |  Proceso: ${ind.proceso}  |  Estado: ${ind.estado}`,
          MARGIN, y
        );
        y = doc.y + 8;

        if (!ind.mediciones.length) {
          doc.fillColor('#9CA3AF').fontSize(10).text('No hay mediciones registradas para este indicador.', MARGIN, y);
          y = doc.y + 12;
          return;
        }

        // Tabla de mediciones del indicador
        const colsMed = ['Fecha', 'Periodo', 'Valor Real', 'Valor Esperado', '% Cumplimiento'];
        const anchosMed = [60, 60, 70, 70, 70];
        const anchoTotal = anchosMed.reduce((a, b) => a + b, 0);
        const xCentrado = MARGIN + (anchoPagina - anchoTotal) / 2;

        dibujarCabeceraTabla(doc, colsMed, xCentrado, y, anchosMed, altCab);
        y += altCab;

        ind.mediciones.forEach(m => {
          const fila = [
            m.fecha_medicion ? new Date(m.fecha_medicion).toLocaleDateString('es-PE') : '-',
            m.periodo,
            m.valor_real.toFixed(2),
            m.valor_esperado ? m.valor_esperado.toFixed(2) : '-',
            `${m.cumplimiento.toFixed(1)}%`,
          ];
          const altFila = 22;
          y = verificarSaltoPagina(doc, y, altFila);
          dibujarFila(doc, fila, xCentrado, y, anchosMed, altFila);
          y += altFila;
        });

        y += 10;

        // Gráfico de barras
        const altoChart = 150;
        y = verificarSaltoPagina(doc, y, altoChart + 60);
        y = dibujarBarChart(doc, ind.mediciones, ind.meta, MARGIN, y, anchoPagina, altoChart);
        y += 15;
      });

      doc.moveDown(1.5);
      doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(
        `Documento generado el ${new Date().toLocaleString('es-PE')} | SGC-UNT v1.0`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const LIKERT_COLORS = ['#cce0ff', '#99c2ff', '#4d94ff', '#0066cc', '#003366'];

const dibujarLikertChart = (doc, distribucion, x, y, ancho, alto) => {
  const valores = Object.entries(distribucion || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
  if (!valores.length) return y;

  const maxCount = Math.max(...valores.map(([, c]) => c), 1);
  const chartLeft = x + 30;
  const chartBottom = y + alto;
  const chartWidth = ancho - 35;
  const chartHeight = alto - 30;
  const barGap = 8;
  const totalBars = valores.length;
  const barWidth = Math.min((chartWidth - barGap * (totalBars + 1)) / totalBars, 40);

  doc.rect(chartLeft, y, 1, chartHeight).stroke('#94A3B8');
  doc.rect(chartLeft, chartBottom, chartWidth, 1).stroke('#94A3B8');

  doc.fillColor('#64748B').fontSize(7);
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxCount / 4) * i);
    const labelY = chartBottom - (val / maxCount) * chartHeight;
    doc.text(String(val), chartLeft - 22, labelY - 3, { width: 18, align: 'right' });
    doc.rect(chartLeft - 2, labelY, 2, 0.5).fill('#94A3B8');
  }

  valores.forEach(([valor, conteo], i) => {
    const xBar = chartLeft + barGap + i * (barWidth + barGap);
    const hBar = (conteo / maxCount) * chartHeight;
    const colorIdx = Math.min(Number(valor) - 1, LIKERT_COLORS.length - 1);
    doc.rect(xBar, chartBottom - hBar, barWidth, hBar).fill(LIKERT_COLORS[colorIdx] || '#3b82f6');
    doc.fillColor('#111827').fontSize(8).text(String(valor), xBar, chartBottom + 4, { width: barWidth, align: 'center' });
    doc.fillColor('#64748B').fontSize(7).text(String(conteo), xBar, chartBottom - hBar - 10, { width: barWidth, align: 'center' });
  });

  return chartBottom + 20;
};

const dibujarPieChart = (doc, cx, cy, r, valores, colores, etiquetas) => {
  const total = valores.reduce((a, b) => a + b, 0) || 1;
  let anguloActual = -Math.PI / 2;

  valores.forEach((val, i) => {
    const angulo = (val / total) * 2 * Math.PI;
    if (val > 0) {
      doc.save();
      doc.moveTo(cx, cy);
      doc.arc(cx, cy, r, anguloActual, anguloActual + angulo);
      doc.closePath();
      doc.fillAndStroke(colores[i] || '#ccc', colores[i] || '#ccc');
      doc.restore();
    }
    anguloActual += angulo;

    const anguloMedio = anguloActual - angulo / 2;
    const labelX = cx + (r + 28) * Math.cos(anguloMedio);
    const labelY = cy + (r + 28) * Math.sin(anguloMedio);
    doc.fillColor('#111827').fontSize(8).text(
      `${etiquetas[i]}: ${val} (${Math.round((val / total) * 100)}%)`,
      labelX - 30, labelY - 4, { width: 60, align: 'center' }
    );
  });
};

const dibujarParticipationBarChart = (doc, facultades, x, y, ancho, alto) => {
  if (!facultades.length) return y;

  const maxVal = Math.max(...facultades.flatMap(f => [f.respondieron, f.no_respondieron]), 1);
  const chartLeft = x + 80;
  const chartBottom = y + alto;
  const chartWidth = ancho - 90;
  const chartHeight = alto - 40;
  const barGap = 6;
  const totalBars = facultades.length;
  const groupWidth = totalBars > 0 ? chartWidth / totalBars : chartWidth;
  const barWidth = Math.max(0, Math.min((groupWidth - barGap * 3) / 2, 25));

  doc.rect(chartLeft, y, 1, chartHeight).stroke('#94A3B8');
  doc.rect(chartLeft, chartBottom, chartWidth, 1).stroke('#94A3B8');

  doc.fillColor('#64748B').fontSize(7);
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const labelY = chartBottom - (val / maxVal) * chartHeight;
    doc.text(String(val), chartLeft - 22, labelY - 3, { width: 18, align: 'right' });
    doc.rect(chartLeft - 2, labelY, 2, 0.5).fill('#94A3B8');
  }

  facultades.forEach((f, i) => {
    const xGroup = chartLeft + i * groupWidth;
    const hRes = (f.respondieron / maxVal) * chartHeight;
    const hNoRes = (f.no_respondieron / maxVal) * chartHeight;

    doc.rect(xGroup + barGap, chartBottom - hRes, barWidth, hRes).fill('#3b82f6');
    doc.rect(xGroup + barGap * 2 + barWidth, chartBottom - hNoRes, barWidth, hNoRes).fill('#e2e8f0');

    const nombre = f.facultad.length > 15 ? f.facultad.substring(0, 13) + '..' : f.facultad;
    doc.fillColor('#64748B').fontSize(6).text(nombre, xGroup, chartBottom + 4, { width: groupWidth, align: 'center' });
  });

  const leyY = chartBottom + 22;
  doc.rect(chartLeft, leyY, 8, 8).fill('#3b82f6');
  doc.fillColor('#111827').fontSize(7).text('Respondieron', chartLeft + 11, leyY + 1);
  doc.rect(chartLeft + 65, leyY, 8, 8).fill('#e2e8f0');
  doc.fillColor('#111827').fontSize(7).text('No respondieron', chartLeft + 76, leyY + 1);

  return chartBottom + 35;
};

export const generarPDFReporteEncuestas = async ({
  encuesta,
  resultados = [],
  participacion = null,
  institucion = 'Universidad Nacional de Trujillo',
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: MARGIN, bufferPages: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const anchoPagina = doc.page.width - MARGIN * 2;
      const ahora = new Date().toLocaleString('es-PE');

      // ============================
      // ENCABEZADO
      // ============================
      doc.fillColor(TITLE_COLOR).fontSize(18).text(institucion, MARGIN, MARGIN, { align: 'center', width: anchoPagina });
      doc.fillColor(SUBTITLE_COLOR).fontSize(13).text('Sistema de Gestión de la Calidad', { align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor(TITLE_COLOR).fontSize(15).text(`REPORTE DE ENCUESTA: ${encuesta.titulo}`, { align: 'center' });
      doc.moveDown(0.8);

      let y = doc.y + 2;

      // Metadatos
      doc.fillColor('#64748B').fontSize(9);
      doc.text(`Código: ${encuesta.codigo}`, MARGIN, y);
      doc.text(`Dirigido a: ${encuesta.dirigido_a}`, MARGIN + 150, y);
      doc.text(`Estado: ${encuesta.estado}`, MARGIN + 300, y);
      y = doc.y + 4;

      doc.fillColor('#64748B').fontSize(9);
      const periodo = encuesta.fecha_inicio
        ? `${encuesta.fecha_inicio}${encuesta.fecha_fin ? ` → ${encuesta.fecha_fin}` : ''}`
        : '—';
      doc.text(`Período: ${periodo}`, MARGIN, y);
      doc.text(`Tipo: ${encuesta.anonima ? 'Anónima' : 'Identificada'}`, MARGIN + 150, y);
      doc.text(`Procesado: ${ahora}`, MARGIN + 300, y);
      y = doc.y + 12;

      // ============================
      // RESUMEN
      // ============================
      doc.save();
      const boxW = (anchoPagina - 16) / 3;
      const boxY = y;
      const boxH = 50;

      doc.rect(MARGIN, boxY, boxW, boxH).fillAndStroke('#eff6ff', '#bfdbfe');
      doc.fillColor('#2563eb').fontSize(20).text(String(encuesta.total_respondentes ?? 0), MARGIN, boxY + 8, { width: boxW, align: 'center' });
      doc.fillColor('#3b82f6').fontSize(9).text('Respondentes', MARGIN, boxY + 32, { width: boxW, align: 'center' });

      doc.rect(MARGIN + boxW + 8, boxY, boxW, boxH).fillAndStroke('#ecfdf5', '#a7f3d0');
      doc.fillColor('#059669').fontSize(20).text(String(encuesta.total_esperado ?? 0), MARGIN + boxW + 8, boxY + 8, { width: boxW, align: 'center' });
      doc.fillColor('#10b981').fontSize(9).text('Esperados', MARGIN + boxW + 8, boxY + 32, { width: boxW, align: 'center' });

      const pct = encuesta.total_esperado > 0
        ? Math.round((encuesta.total_respondentes / encuesta.total_esperado) * 100)
        : 0;
      doc.rect(MARGIN + 2 * (boxW + 8), boxY, boxW, boxH).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#475569').fontSize(20).text(`${pct}%`, MARGIN + 2 * (boxW + 8), boxY + 8, { width: boxW, align: 'center' });
      doc.fillColor('#64748b').fontSize(9).text('Participación', MARGIN + 2 * (boxW + 8), boxY + 32, { width: boxW, align: 'center' });
      doc.restore();

      // Barra de participación
      const barY = boxY + boxH + 10;
      const barW = anchoPagina;
      doc.rect(MARGIN, barY, barW, 12).fill('#f1f5f9');
      if (pct > 0) {
        doc.rect(MARGIN, barY, (pct / 100) * barW, 12).fill('#3b82f6');
      }
      doc.fillColor('#FFFFFF').fontSize(8).text(`${pct}%`, MARGIN + 4, barY + 2);

      y = barY + 22;

      // ============================
      // PARTICIPACIÓN POR ESCUELA
      // ============================
      if (participacion && participacion.por_escuela && participacion.por_escuela.length > 0) {
        y = verificarSaltoPagina(doc, y, 60);
        doc.save();
        doc.rect(MARGIN, y, anchoPagina, 1).fill('#003366');
        doc.restore();
        y += 6;
        doc.fillColor('#003366').fontSize(13).text('Participación por Facultad y Escuela', MARGIN, y);
        y = doc.y + 6;

        const colsPart = ['Facultad', 'Escuela', 'Total', 'Respondieron', 'No respondieron', '%'];
        const anchosPart = [70, 80, 35, 65, 75, 35];
        const altCab = 20;
        const xPart = MARGIN;

        y = verificarSaltoPagina(doc, y, altCab + 10);
        dibujarCabeceraTabla(doc, colsPart, xPart, y, anchosPart, altCab);
        y += altCab;

        // Agrupar por facultad para el chart y tabla
        const gruposFac = {};
        for (const e of participacion.por_escuela) {
          if (!gruposFac[e.facultad]) {
            gruposFac[e.facultad] = { facultad: e.facultad, respondieron: 0, no_respondieron: 0, total: 0 };
          }
          gruposFac[e.facultad].respondieron += e.respondieron;
          gruposFac[e.facultad].no_respondieron += e.no_respondieron;
          gruposFac[e.facultad].total += e.total;
        }

        for (const e of participacion.por_escuela) {
          const fila = [e.facultad, e.escuela, String(e.total), String(e.respondieron), String(e.no_respondieron), `${e.porcentaje}%`];
          const altFila = 20;
          y = verificarSaltoPagina(doc, y, altFila);
          dibujarFila(doc, fila, xPart, y, anchosPart, altFila);
          y += altFila;
        }

        y += 10;

        // Gráfico de participación por facultad
        const facData = Object.values(gruposFac);
        const altoChartPart = 130;
        y = verificarSaltoPagina(doc, y, altoChartPart + 50);
        y = dibujarParticipationBarChart(doc, facData, MARGIN, y, anchoPagina, altoChartPart);
        y += 10;
      }

      // ============================
      // RESULTADOS POR PREGUNTA
      // ============================
      for (let i = 0; i < resultados.length; i++) {
        const r = resultados[i];
        const numPreg = i + 1;

        y = verificarSaltoPagina(doc, y, 80);
        doc.save();
        doc.rect(MARGIN, y, anchoPagina, 1).fill('#003366');
        doc.restore();
        y += 6;

        doc.fillColor('#003366').fontSize(12).text(`Pregunta ${numPreg}`, MARGIN, y);
        y = doc.y + 2;

        doc.fillColor(TITLE_COLOR).fontSize(10).text(r.texto, MARGIN, y);
        y = doc.y + 2;

        const badges = [];
        if (r.tipo === 'likert_5') badges.push('Likert (1-5)');
        else if (r.tipo === 'likert_7') badges.push('Likert (1-7)');
        else if (r.tipo === 'numerica') badges.push('Numérica');
        else if (r.tipo === 'si_no') badges.push('Sí / No');
        else if (r.tipo === 'abierta') badges.push('Abierta');
        badges.push(`Total: ${r.total} respuestas`);
        if (r.promedio && ['likert_5', 'likert_7', 'numerica'].includes(r.tipo)) {
          badges.push(`Promedio: ${r.promedio}`);
        }

        doc.fillColor('#64748B').fontSize(8).text(badges.join('  |  '), MARGIN, y);
        y = doc.y + 8;

        if (['likert_5', 'likert_7', 'numerica'].includes(r.tipo) && r.distribucion) {
          // Tabla de distribución
          const distEntries = Object.entries(r.distribucion).sort((a, b) => Number(a[0]) - Number(b[0]));
          const colsDist = ['Valor', ...distEntries.map(([v]) => String(v))];
          const anchosDist = [35, ...distEntries.map(() => Math.min(50, (anchoPagina - 35) / distEntries.length))];
          const row1 = ['Conteo', ...distEntries.map(([, c]) => String(c))];
          const row2 = ['%', ...distEntries.map(([, c]) => `${r.total > 0 ? Math.round((c / r.total) * 100) : 0}%`)];

          y = verificarSaltoPagina(doc, y, 50);
          dibujarCabeceraTabla(doc, colsDist, MARGIN, y, anchosDist, 18);
          y += 18;
          dibujarFila(doc, row1, MARGIN, y, anchosDist, 18);
          y += 18;
          y = verificarSaltoPagina(doc, y, 18);
          dibujarFila(doc, row2, MARGIN, y, anchosDist, 18);
          y += 22;

          // Bar chart
          const altoLC = 110;
          y = verificarSaltoPagina(doc, y, altoLC + 20);
          y = dibujarLikertChart(doc, r.distribucion, MARGIN, y, anchoPagina, altoLC);
          y += 12;
        } else if (r.tipo === 'si_no') {
          // Pie chart sólido + cards debajo
          const si = r.si || 0;
          const no = r.no || 0;
          const totalSN = si + no || 1;
          const cx = MARGIN + 80;
          const cy = y + 60;
          const radio = 50;

          if (totalSN > 0) {
            y = verificarSaltoPagina(doc, y, 180);
            dibujarPieChart(doc, cx, cy, radio, [si, no], ['#10b981', '#ef4444'], ['Sí', 'No']);
          }

          // Cards debajo del pie
          const cardY = cy + radio + 15;
          const cardW = 100;
          const cardGap = 20;
          const totalW = cardW * 2 + cardGap;
          const cardStartX = MARGIN + (anchoPagina - totalW) / 2;
          doc.rect(cardStartX, cardY, cardW, 45).fillAndStroke('#ecfdf5', '#a7f3d0');
          doc.fillColor('#059669').fontSize(18).text(String(si), cardStartX, cardY + 8, { width: cardW, align: 'center' });
          doc.fillColor('#10b981').fontSize(9).text(`Sí (${Math.round((si / totalSN) * 100)}%)`, cardStartX, cardY + 30, { width: cardW, align: 'center' });

          doc.rect(cardStartX + cardW + cardGap, cardY, cardW, 45).fillAndStroke('#fef2f2', '#fecaca');
          doc.fillColor('#dc2626').fontSize(18).text(String(no), cardStartX + cardW + cardGap, cardY + 8, { width: cardW, align: 'center' });
          doc.fillColor('#ef4444').fontSize(9).text(`No (${Math.round((no / totalSN) * 100)}%)`, cardStartX + cardW + cardGap, cardY + 30, { width: cardW, align: 'center' });

          y = cardY + 55;
        } else if (r.tipo === 'abierta') {
          // Listar todas las respuestas textuales
          const textos = r.respuestas_texto || [];
          if (textos.length === 0) {
            doc.fillColor('#9CA3AF').fontSize(9).text('No hay respuestas textuales.', MARGIN, y);
            y = doc.y + 6;
          } else {
            doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(`Respuestas (${textos.length}):`, MARGIN, y);
            y = doc.y + 4;
            for (let t = 0; t < textos.length; t++) {
              const texto = textos[t];
              const lines = doc.heightOfString(`"${texto}"`, { width: anchoPagina - 20, align: 'left' });
              y = verificarSaltoPagina(doc, y, lines + 10);
              doc.save();
              doc.rect(MARGIN, y, anchoPagina, lines + 6).fillAndStroke('#f8fafc', '#e2e8f0');
              doc.restore();
              doc.fillColor('#374151').fontSize(9).text(`"${texto}"`, MARGIN + 6, y + 3, { width: anchoPagina - 12 });
              y = y + lines + 10;
            }
          }
        }

        y += 6;
      }

      // Pie de página
      doc.moveDown(1.5);
      doc.fillColor(SUBTITLE_COLOR).fontSize(9).text(
        `Documento generado el ${ahora} | SGC-UNT v1.0`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};