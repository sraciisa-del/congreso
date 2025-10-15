import { NextResponse } from "next/server";

export async function GET() {
  // 🔹 Datos temporales de invitados
  const invitados = [
    {
      name: "Ing. Carlos Méndez",
      topic: "Inteligencia Artificial Aplicada",
      photo: "/1.jpg",
    },
    {
      name: "Dra. Lucía Fernández",
      topic: "Ciberseguridad en el Mundo Actual",
      photo: "/2.jpg",
    },
    {
      name: "Lic. Pablo García",
      topic: "Transformación Digital en Educación",
      photo: "/3.jpg",
    },
     {
      name: "Lic. Pablo García",
      topic: "Transformación Digital en Educación",
      photo: "/4.jpg",
    },
  ];

  return NextResponse.json(invitados);
}
