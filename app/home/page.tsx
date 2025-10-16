"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar datos desde API (se conserva la misma lógica)
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

  // ⏳ Skeletons de carga (no cambia la funcionalidad)
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
        <section className="relative overflow-hidden py-24 px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700" />
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="mx-auto h-10 w-48 rounded-full bg-white/20 animate-pulse" />
            <div className="mx-auto mt-6 h-8 w-80 rounded-full bg-white/20 animate-pulse" />
            <div className="mx-auto mt-8 h-12 w-56 rounded-xl bg-white/30 animate-pulse" />
          </div>
        </section>

        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
              >
                <div className="mx-auto h-28 w-28 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="mt-4 h-4 w-40 mx-auto rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="mt-2 h-3 w-32 mx-auto rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        <section className="py-10 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
              >
                <div className="h-5 w-56 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="mt-3 h-4 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="mt-4 flex gap-3">
                  <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 dark:text-red-400 text-lg font-semibold">
        {error}
      </div>
    );
  }

  // 📅 Utilidades visuales mínimas (sin cambiar datos)
  const isEmptyGuests = !guests || guests.length === 0;
  const isEmptyActivities = !activities || activities.length === 0;

  return (
    <main className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 min-h-screen">
      {/* 🟦 HERO “glass + orbes” */}
      <section className="relative overflow-hidden py-24 px-6">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700" />
        {/* Orbes suaves */}
        <div className="pointer-events-none absolute -top-24 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        {/* Patrón sutil */}
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-10" aria-hidden />
        {/* Contenido */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Congreso de Tecnología 2025
            </span>
            <h1 className="mt-5 text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow">
              Innovación, aprendizaje y networking
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/90 leading-relaxed">
              Conéctate con expertos, descubre tendencias y potencia tu carrera.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/inscripciones"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
              >
                🚀 Inscríbete ahora
              </Link>
              <Link
                href="#actividades"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15 hover:-translate-y-0.5"
              >
                Ver actividades
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/90">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-bold">{guests.length || 0}</p>
                <p className="text-sm">Invitados</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-bold">{activities.length || 0}</p>
                <p className="text-sm">Actividades</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm">Diplomas</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-bold">🎟️</p>
                <p className="text-sm">Cupo limitado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧑‍🏫 INVITADOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center" aria-labelledby="invitados-title">
        <h2
          id="invitados-title"
          className="text-3xl md:text-4xl font-bold mb-14 text-blue-700 dark:text-blue-400"
        >
          Nuestros Invitados
        </h2>

        {isEmptyGuests ? (
          <p className="text-gray-600 dark:text-gray-400">
            Aún no hay invitados publicados. Vuelve pronto.
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
              {guests.map((guest, i) => (
                <article
                  key={i}
                  className="group relative w-72 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Anillo/halo */}
                  <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/20 blur-2xl group-hover:bg-indigo-500/25 transition" />
                  <div className="p-6 text-center">
                    <div className="relative mx-auto mb-5 h-28 w-28">
                      <Image
                        src={guest.photo || "/default-avatar.png"}
                        alt={guest.name || "Invitado"}
                        fill
                        className="rounded-full object-cover shadow-lg transition-transform group-hover:scale-105"
                        sizes="112px"
                        priority={i < 4}
                      />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {guest.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {guest.topic}
                    </p>
                    <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {guest.role || "Conferencista invitado"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 🗓️ ACTIVIDADES */}
      <section
        id="actividades"
        className="py-20 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6"
        aria-labelledby="actividades-title"
      >
        <h2
          id="actividades-title"
          className="text-3xl md:text-4xl font-bold text-center mb-14 text-indigo-700 dark:text-indigo-400"
        >
          Actividades del Congreso
        </h2>

        {isEmptyActivities ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Aún no hay actividades publicadas.
          </p>
        ) : (
          <>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {activities.slice(0, 3).map((act, i) => (
                <article
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 shadow-md transition hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/4 translate-x-1/4 rounded-full bg-indigo-500/10 blur-2xl" />
                  <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                    {act.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-3">
                    {act.description}
                  </p>
                  <div className="mt-5 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p>📅 {act.fecha}</p>
                    <p>
                      🕒 {act.hora_inicio} - {act.hora_fin}
                    </p>
                    <p>📍 {act.lugar}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* 🔘 Botón Ver más */}
            {activities.length > 3 && (
              <div className="text-center mt-12">
                <Link
                  href="/inscripciones"
                  className="inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]"
                >
                  Ver más actividades
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* 🌟 CTA FINAL */}
      <section className="relative overflow-hidden bg-indigo-700 dark:bg-indigo-800 text-white text-center py-24 px-6">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-10" aria-hidden />
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">
            ¡Forma parte del futuro tecnológico!
          </h2>
          <p className="text-lg mb-8 leading-relaxed text-white/95">
            Regístrate, participa y vive la experiencia de conectar con expertos,
            aprender nuevas tendencias y obtener tu diploma oficial del Congreso.
          </p>
          <Link
            href="/inscripciones"
            className="rounded-xl bg-white px-8 py-3 font-semibold text-indigo-700 transition hover:bg-gray-100 hover:-translate-y-0.5"
          >
            Participar ahora
          </Link>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p>
          © 2025 Congreso de Tecnología · Desarrollado por{" "}
          <span className="font-semibold text-white">Selvin Arriola</span>
        </p>
      </footer>
    </main>
  );
}
