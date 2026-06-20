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