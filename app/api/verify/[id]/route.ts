import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 importante: params es Promise
) {
  try {
    const { id } = await context.params; // 👈 hay que esperarlo
    const id_inscription = parseInt(id);

    if (isNaN(id_inscription))
      return NextResponse.json({ status: "error", message: "Código inválido" }, { status: 400 });

    const result = await pool.query(`
      SELECT 
        i.id_inscription,
        i.estado,
        u.full_name,
        l.email,
        a.title AS actividad,
        a.fecha,
        a.hora_inicio,
        a.hora_fin,
        a.lugar
      FROM inscriptions i
      JOIN users u ON i.id_user = u.id_user
      JOIN login l ON u.id_login = l.id_login
      JOIN activities a ON i.id_activity = a.id_activity
      WHERE i.id_inscription = $1
    `, [id_inscription]);

    if (result.rowCount === 0) {
      return NextResponse.json({
        status: "error",
        message: "Código no encontrado ❌",
      }, { status: 404 });
    }

    const inscripcion = result.rows[0];

    if (inscripcion.estado === "asistió") {
      return NextResponse.json({
        status: "warning",
        message: "⚠️ Código ya escaneado. La asistencia ya fue confirmada.",
        data: inscripcion,
      });
    }

    await pool.query(
      "UPDATE inscriptions SET estado = 'asistió' WHERE id_inscription = $1",
      [id_inscription]
    );

    return NextResponse.json({
      status: "success",
      message: `✅ Asistencia confirmada para ${inscripcion.full_name}`,
      data: inscripcion,
    });
  } catch (error) {
    console.error("❌ Error verificando QR:", error);
    return NextResponse.json({
      status: "error",
      message: "Error interno del servidor",
    }, { status: 500 });
  }
}
