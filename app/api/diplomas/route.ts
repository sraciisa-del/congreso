import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generarDiploma } from "@/lib/diploma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { correo, id_activity } = await req.json();

    if (!correo) {
      return NextResponse.json(
        { error: "Falta el correo del usuario" },
        { status: 400 }
      );
    }

    // ✅ 1️⃣ Buscar la inscripción del usuario con la actividad seleccionada
    const { rows } = await pool.query(
      `
      SELECT 
        i.id_inscription, 
        u.full_name, 
        l.email, 
        a.title AS activity
      FROM inscriptions i
      JOIN users u ON u.id_user = i.id_user
      JOIN login l ON l.id_login = u.id_login
      JOIN activities a ON a.id_activity = i.id_activity
      WHERE l.email = $1 
        AND i.estado IN ('inscrito', 'asistió', 'confirmado', 'completado', 'aprobado')
        ${id_activity ? "AND a.id_activity = $2" : ""}
      `,
      id_activity ? [correo, id_activity] : [correo]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró una inscripción válida para generar diploma." },
        { status: 404 }
      );
    }

    const inscripcion = rows[0];

    // ✅ 2️⃣ Generar PDF del diploma personalizado
    const pdfBuffer = await generarDiploma(
      inscripcion.full_name,
      inscripcion.activity
    );

    // ✅ 3️⃣ Configurar envío de correo con plantilla más profesional
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlEmail = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; background: #fff; border-radius: 12px; margin: auto; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo-umg.png" alt="Congreso de Tecnología" width="120" style="margin-bottom: 20px;" />
          <h2 style="color: #2a4d9b; font-size: 22px; margin-bottom: 10px;">¡Felicidades, ${inscripcion.full_name}! 🎓</h2>
          <p style="color: #333; font-size: 16px;">Has completado exitosamente la siguiente actividad del <strong>Congreso de Tecnología 2025</strong>:</p>
          <h3 style="color: #2a4d9b; margin: 20px 0;">${inscripcion.activity}</h3>
          <p style="font-size: 15px; color: #555;">Adjunto encontrarás tu diploma oficial en formato PDF.</p>
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #777; font-size: 13px;">
            Atentamente,<br>
            <strong>Equipo del Congreso de Tecnología</strong><br>
            Universidad Mariano Gálvez de Guatemala
          </p>
        </div>
      </div>
    `;

    // ✅ 4️⃣ Enviar correo con diploma adjunto
    await transporter.sendMail({
      from: `"Congreso de Tecnología" <${process.env.EMAIL_USER}>`,
      to: inscripcion.email,
      subject: `🎓 Diploma - ${inscripcion.activity}`,
      html: htmlEmail,
      attachments: [
        {
          filename: `Diploma_${inscripcion.full_name}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // ✅ 5️⃣ Registrar el diploma enviado en BD
    await pool.query(
      `
      INSERT INTO diplomas (id_inscription, enviado, ruta_pdf)
      VALUES ($1, true, $2)
      ON CONFLICT (id_inscription) DO UPDATE SET enviado = true
      `,
      [inscripcion.id_inscription, "enviado_por_correo"]
    );

    return NextResponse.json({
      message: `🎓 Diploma de "${inscripcion.activity}" enviado correctamente a ${inscripcion.email}`,
    });
  } catch (error: any) {
    console.error("❌ Error enviando diploma:", error);
    return NextResponse.json(
      { error: "Error al enviar el diploma", details: error.message },
      { status: 500 }
    );
  }
}
