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