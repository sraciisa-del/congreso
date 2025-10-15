import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { full_name, email, password, phone, tipo, colegio, carne } = await req.json();

    if (!full_name || !email || !password || !tipo)
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });

    // Verificar si el correo ya existe
  const exist = await pool.query("SELECT 1 FROM login WHERE email = $1", [email]);
if (exist && exist.rowCount && exist.rowCount > 0) {
  return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
}


    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar login
    const loginResult = await pool.query(
      `INSERT INTO login (email, password, tipo)
       VALUES ($1, $2, $3)
       RETURNING id_login`,
      [email, hashedPassword, tipo]
    );

    const id_login = loginResult.rows[0].id_login;

    // Guardar datos personales
    await pool.query(
      `INSERT INTO users (id_login, full_name, phone, colegio, carne)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_login, full_name, phone, colegio, carne]
    );

    return NextResponse.json({ message: "Usuario registrado correctamente ✅" });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
