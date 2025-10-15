import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generarDiploma } from "@/lib/diploma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    if (!correo) {
      return NextResponse.json(
        { error: "Falta el correo del usuario" },
        { status: 400 }
      );
    }

    // ✅ 1️⃣ Buscar la inscripción del usuario con estado válido
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
  `,
  [correo]
);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No se encontró ninguna inscripción válida para generar diploma." },
        { status: 404 }
      );
    }

    const inscripcion = rows[0];

    // ✅ 2️⃣ Generar PDF del diploma
    const pdfBuffer = await generarDiploma(
      inscripcion.full_name,
      inscripcion.activity
    );

    // ✅ 3️⃣ Configurar envío de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ 4️⃣ Enviar diploma al correo
    await transporter.sendMail({
      from: `"Congreso de Tecnología" <${process.env.EMAIL_USER}>`,
      to: inscripcion.email,
      subject: `🎓 Diploma - ${inscripcion.activity}`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align:center;">
          <h2>¡Felicidades ${inscripcion.full_name}!</h2>
          <p>Has completado exitosamente la actividad:</p>
          <h3>${inscripcion.activity}</h3>
          <p>Adjunto encontrarás tu diploma en formato PDF.</p>
          <p style="color:#888;">Atentamente,<br>Equipo del Congreso de Tecnología</p>
        </div>
      `,
      attachments: [
        {
          filename: `Diploma_${inscripcion.full_name}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // ✅ 5️⃣ Guardar registro en la tabla diplomas
    await pool.query(
      `
      INSERT INTO diplomas (id_inscription, enviado, ruta_pdf)
      VALUES ($1, true, $2)
      ON CONFLICT (id_inscription) DO UPDATE SET enviado = true
      `,
      [inscripcion.id_inscription, "enviado_por_correo"]
    );

    // ✅ 6️⃣ Actualizar estado de la inscripción


    return NextResponse.json({
      message: `🎓 Diploma enviado correctamente a ${inscripcion.email}`,
    });
  } catch (error: any) {
    console.error("❌ Error enviando diploma:", error);
    return NextResponse.json(
      { error: "Error al enviar el diploma", details: error.message },
      { status: 500 }
    );
  }
}
