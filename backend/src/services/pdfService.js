import puppeteer from 'puppeteer';

export const generarPDF = async (htmlContent, opciones = {}) => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    ...opciones,
  });
  await browser.close();
  return pdf;
};

export const plantillaReporte = (titulo, contenido, institucion = 'Universidad Nacional de Trujillo') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 10px; margin-bottom: 20px; }
    .header h1 { color: #003366; margin: 0; font-size: 18px; }
    .header h2 { color: #666; margin: 5px 0; font-size: 14px; }
    .content { font-size: 12px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
    th { background-color: #003366; color: white; }
    .footer { margin-top: 30px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${institucion}</h1>
    <h2>Sistema de Gestión de la Calidad</h2>
    <h2>${titulo}</h2>
  </div>
  <div class="content">${contenido}</div>
  <div class="footer">
    Documento generado el ${new Date().toLocaleString('es-PE')} | SGC-UNT v1.0
  </div>
</body>
</html>
`;
