import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { generateQRBuffer, sendMailWithAttachment } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { id_user, id_activity } = await req.json();
    if (!id_user || !id_activity)
      return NextResponse.json({ error: "Faltan datos de inscripción" }, { status: 400 });

    const exist = await pool.query(
      "SELECT 1 FROM inscriptions WHERE id_user = $1 AND id_activity = $2",
      [id_user, id_activity]
    );
    if ((exist?.rowCount ?? 0) > 0)
      return NextResponse.json({ error: "Ya estás inscrito en esta actividad" }, { status: 409 });

    const inscripcion = await pool.query(
      `INSERT INTO inscriptions (id_user, id_activity)
       VALUES ($1, $2)
       RETURNING id_inscription`,
      [id_user, id_activity]
    );

    const id_inscription = inscripcion.rows[0].id_inscription;

    // Datos de usuario y actividad
    const userResult = await pool.query(`
      SELECT u.full_name, l.email
      FROM users u
      JOIN login l ON u.id_login = l.id_login
      WHERE u.id_user = $1
    `, [id_user]);

    const activityResult = await pool.query(`
      SELECT title, fecha, hora_inicio, hora_fin, lugar
      FROM activities
      WHERE id_activity = $1
    `, [id_activity]);

    const user = userResult.rows[0];
    const activity = activityResult.rows[0];
    if (!user || !activity)
      return NextResponse.json({ error: "Datos incompletos" }, { status: 404 });

    // 🔹 Generar QR como imagen adjunta
    const qrText = `INSCRIPCION-${id_inscription}-${user.full_name}-${activity.title}`;
    const qrBuffer = await generateQRBuffer(qrText);

    // Generar un ID único para referenciar la imagen
    const qrCid = `qr-${id_inscription}@congreso`;

    // 🔹 HTML del correo con referencia al QR adjunto
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #007bff;">🎟️ Confirmación de Inscripción</h2>
        <p>Hola <b>${user.full_name}</b>,</p>
        <p>Tu inscripción a la siguiente actividad ha sido confirmada:</p>

        <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <tr><td><b>Actividad:</b></td><td>${activity.title}</td></tr>
          <tr><td><b>Fecha:</b></td><td>${activity.fecha}</td></tr>
          <tr><td><b>Horario:</b></td><td>${activity.hora_inicio} - ${activity.hora_fin}</td></tr>
          <tr><td><b>Lugar:</b></td><td>${activity.lugar}</td></tr>
        </table>

        <p style="margin-top: 20px;">Presenta este código QR al ingresar:</p>

        <div style="text-align: center; margin: 20px 0;">
          <img src="cid:${qrCid}" alt="Código QR" width="200" height="200" />
        </div>

        <p style="font-size: 14px; color: #555;">Nos vemos pronto 👋<br><b>Congreso de Tecnología</b></p>
      </div>
    `;

    // Enviar correo con el QR adjunto
    await sendMailWithAttachment({
      to: user.email,
      subject: `Confirmación de inscripción: ${activity.title}`,
      html,
      attachments: [
        {
          filename: "qr.png",
          content: qrBuffer,
          cid: qrCid, // para <img src="cid:...">
        },
      ],
    });

    return NextResponse.json({ message: "Inscripción completada y correo con QR enviado ✅" });
  } catch (error) {
    console.error("❌ Error al inscribirse:", error);
    return NextResponse.json({ error: "Error al registrar la inscripción o enviar el correo" }, { status: 500 });
  }
}
