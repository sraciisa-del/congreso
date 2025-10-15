import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header"; // 👈 importamos el header

export const metadata: Metadata = {
  title: "Congreso de Tecnología",
  description: "Plataforma de inscripciones y diplomas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 antialiased">
        {/* 🔹 Header visible en todas las páginas */}
        <Header />

        {/* 🔹 Contenido de la página */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
