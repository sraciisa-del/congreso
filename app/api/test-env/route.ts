import { NextResponse } from "next/server";

export async function GET() {
  const dbVar = process.env.DATABASE_URL;
  return NextResponse.json({
    database_url: dbVar ?? "❌ No está definida",
    length: dbVar ? dbVar.length : 0,
  });
}
