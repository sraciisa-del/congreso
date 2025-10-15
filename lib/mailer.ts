import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Generar QR como imagen en base64 y devolver Buffer
export async function generateQRBuffer(text: string) {
  try {
    const qr = await QRCode.toBuffer(text);
    return qr;
  } catch (error) {
    console.error("❌ Error generando QR:", error);
    throw new Error("Error generando QR");
  }
}

// 🔹 Enviar correo con adjuntos opcionales
export async function sendMailWithAttachment({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  try {
    await transporter.sendMail({
      from: `"Congreso de Tecnología" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log("📨 Correo enviado a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw new Error("Error enviando correo");
  }
}
