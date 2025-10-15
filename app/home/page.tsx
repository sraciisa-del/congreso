"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar datos desde API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, guestRes] = await Promise.all([
          fetch("/api/activities"),
          fetch("/api/guests"),
        ]);

        if (!actRes.ok || !guestRes.ok) {
          throw new Error("Error al obtener datos del servidor");
        }

        const actText = await actRes.text();
        const guestText = await guestRes.text();

        const acts = actText ? JSON.parse(actText) : [];
        const gsts = guestText ? JSON.parse(guestText) : [];

        setActivities(acts);
        setGuests(gsts);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        setError("No se pudieron cargar las actividades o los invitados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-medium">
        Cargando contenido del congreso...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 dark:text-red-400 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <main className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 min-h-screen">
      {/* 🟦 HERO */}
      <section className="relative overflow-hidden text-center py-24 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('/tech-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Congreso de Tecnología 2025
          </h1>
          <p className="text-lg md:text-xl mb-10 leading-relaxed">
            Innovación, aprendizaje y networking con los líderes tecnológicos del futuro.
          </p>
          <Link
            href="/inscripciones"
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-200 transition transform hover:scale-105"
          >
            🚀 Inscríbete ahora
          </Link>
        </div>
      </section>

      {/* 🧑‍🏫 INVITADOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-14 text-blue-700 dark:text-blue-400">
          Nuestros Invitados
        </h2>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
            {guests.map((guest, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-2 p-6 text-center border border-gray-100 dark:border-gray-700 w-72"
              >
                <div className="relative w-28 h-28 mx-auto mb-5">
                  <Image
                    src={guest.photo || "/default-avatar.png"}
                    alt={guest.name}
                    fill
                    className="rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">{guest.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {guest.topic}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {guest.role || "Conferencista invitado"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🗓️ ACTIVIDADES */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-indigo-700 dark:text-indigo-400">
          Actividades del Congreso
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {activities.slice(0, 3).map((act, i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                {act.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {act.description}
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>📅 {act.fecha}</p>
                <p>🕒 {act.hora_inicio} - {act.hora_fin}</p>
                <p>📍 {act.lugar}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔘 Botón Ver más */}
        {activities.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/inscripciones"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-transform hover:scale-105 shadow-md"
            >
              Ver más actividades
            </Link>
          </div>
        )}
      </section>

      {/* 🌟 CTA FINAL */}
      <section className="relative bg-indigo-700 dark:bg-indigo-800 text-white text-center py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-10" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">
            ¡Forma parte del futuro tecnológico!
          </h2>
          <p className="text-lg mb-8 leading-relaxed">
            Regístrate, participa y vive la experiencia de conectar con expertos,
            aprender nuevas tendencias y obtener tu diploma oficial del Congreso.
          </p>
          <Link
            href="/inscripciones"
            className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition transform hover:scale-105"
          >
            Participar ahora
          </Link>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p>
          © 2025 Congreso de Tecnología · Desarrollado por{" "}
          <span className="font-semibold text-white">Selvin Arriola 🚀</span>
        </p>
      </footer>
    </main>
  );
}
