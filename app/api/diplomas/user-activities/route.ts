import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    if (!correo) {
      return NextResponse.json(
        { error: "Falta el correo del usuario" },
        { status: 400 }
      );
    }

    // 🔹 Obtener actividades donde el usuario esté inscrito
    const { rows } = await pool.query(
      `
      SELECT 
        a.id_activity,
        a.title
      FROM inscriptions i
      JOIN users u ON u.id_user = i.id_user
      JOIN login l ON l.id_login = u.id_login
      JOIN activities a ON a.id_activity = i.id_activity
      WHERE l.email = $1 
        AND i.estado IN ('inscrito', 'asistió', 'confirmado', 'completado', 'aprobado')
      ORDER BY a.fecha, a.hora_inicio
      `,
      [correo]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron actividades inscritas para este usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo actividades del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}
