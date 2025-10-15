import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Verificar existencia del usuario
    const result = await pool.query("SELECT * FROM login WHERE email = $1", [email]);
    if (result.rowCount === 0)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const user = result.rows[0];

    // Validar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });

    // Obtener datos personales
    const datos = await pool.query("SELECT * FROM users WHERE id_login = $1", [user.id_login]);
    const perfil = datos.rows[0];

    if (!perfil)
      return NextResponse.json({ error: "No se encontraron datos personales del usuario" }, { status: 404 });

    // Unir login + perfil en un solo objeto plano
    const userData = {
      id_login: user.id_login,
      id_user: perfil.id_user,
      full_name: perfil.full_name,
      email: user.email,
      tipo: user.tipo,
      phone: perfil.phone,
      colegio: perfil.colegio,
      carne: perfil.carne,
    };

    return NextResponse.json({
      message: "Login exitoso ✅",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
