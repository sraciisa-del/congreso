import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ GET: usado por Home
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        id_activity,
        title,
        description,
        fecha,
        hora_inicio,
        hora_fin,
        lugar,
        cupo
      FROM activities
      ORDER BY fecha, hora_inicio;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener actividades (GET):", error);
    return NextResponse.json(
      { error: "Error al cargar actividades" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { id_user } = await req.json();

    const result = await pool.query(
      `
      SELECT 
        a.id_activity,
        a.title,
        a.description,
        a.fecha,
        a.hora_inicio,
        a.hora_fin,
        a.lugar,
        a.cupo,
        COUNT(i.id_inscription) AS inscritos,
        -- 👇 Si el usuario está inscrito en esta actividad, devuelve TRUE
        CASE WHEN EXISTS (
          SELECT 1 
          FROM inscriptions ins
          WHERE ins.id_activity = a.id_activity AND ins.id_user = $1
        ) THEN TRUE ELSE FALSE END AS ya_inscrito
      FROM activities a
      LEFT JOIN inscriptions i ON i.id_activity = a.id_activity
      GROUP BY a.id_activity
      ORDER BY a.fecha, a.hora_inicio;
      `,
      [id_user]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener actividades:", error);
    return NextResponse.json({ error: "Error al cargar actividades" }, { status: 500 });
  }
}
