import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generarDiploma(nombre: string, actividad: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]); // A4 apaisado
  const { width, height } = page.getSize();

  // 🧠 Fuentes estándar
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // 🎨 Fondo suave con marco
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.97, 0.98, 1),
  });

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderWidth: 4,
    borderColor: rgb(0.15, 0.35, 0.75),
  });

  // 🖋️ Logo (si existe en /public/logo.png)
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.3);
    page.drawImage(logoImage, {
      x: width / 2 - logoDims.width / 2,
      y: height - 140,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  // 🎓 Título
  const title = "CONGRESO DE TECNOLOGÍA 2025";
  page.drawText(title, {
    x: width / 2 - fontBold.widthOfTextAtSize(title, 26) / 2,
    y: height - 180,
    size: 26,
    font: fontBold,
    color: rgb(0.05, 0.25, 0.6),
  });

  // Subtítulo
  const subtitulo = "Otorga el presente diploma a";
  page.drawText(subtitulo, {
    x: width / 2 - fontNormal.widthOfTextAtSize(subtitulo, 16) / 2,
    y: height - 230,
    size: 16,
    font: fontNormal,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Nombre destacado
  page.drawText(nombre, {
    x: width / 2 - fontBold.widthOfTextAtSize(nombre, 30) / 2,
    y: height - 270,
    size: 30,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.3),
  });

  // Actividad
  const textoActividad = `Por su destacada participación en la actividad:`;
  page.drawText(textoActividad, {
    x: width / 2 - fontItalic.widthOfTextAtSize(textoActividad, 14) / 2,
    y: height - 320,
    size: 14,
    font: fontItalic,
    color: rgb(0.3, 0.3, 0.3),
  });

  const actividadText = `"${actividad}"`;
  page.drawText(actividadText, {
    x: width / 2 - fontBold.widthOfTextAtSize(actividadText, 16) / 2,
    y: height - 340,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.28, 0.63),
  });

  // 📅 Fecha
  const fecha = new Date().toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const fechaText = `Emitido el ${fecha}`;
  page.drawText(fechaText, {
    x: width / 2 - fontNormal.widthOfTextAtSize(fechaText, 12) / 2,
    y: 70,
    size: 12,
    font: fontNormal,
    color: rgb(0.3, 0.3, 0.3),
  });

  // ✍️ Firma (opcional)
  const firmaPath = path.join(process.cwd(), "public", "firma.png");
  if (fs.existsSync(firmaPath)) {
    const firmaBytes = fs.readFileSync(firmaPath);
    const firmaImage = await pdfDoc.embedPng(firmaBytes);
    const firmaDims = firmaImage.scale(0.4);
    page.drawImage(firmaImage, {
      x: width / 2 - firmaDims.width / 2,
      y: 110,
      width: firmaDims.width,
      height: firmaDims.height,
    });
  }

  // 🖊️ Línea de firma
  const textoFirma = "Coordinador General - Congreso de Tecnología";
  page.drawLine({
    start: { x: width / 2 - 150, y: 100 },
    end: { x: width / 2 + 150, y: 100 },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(textoFirma, {
    x: width / 2 - fontItalic.widthOfTextAtSize(textoFirma, 12) / 2,
    y: 85,
    size: 12,
    font: fontItalic,
    color: rgb(0.2, 0.2, 0.2),
  });

  // 🌟 Marca de agua (opcional, si existe logo)
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const marca = await pdfDoc.embedPng(logoBytes);
    const scale = 0.5;
    page.drawImage(marca, {
      x: width / 2 - (marca.width * scale) / 2,
      y: height / 2 - (marca.height * scale) / 2,
      width: marca.width * scale,
      height: marca.height * scale,
      opacity: 0.1, // 👈 Sutil
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
