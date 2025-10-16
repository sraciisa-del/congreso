'use client';
import { useEffect, useMemo, useState } from "react";

type MessageKind = "success" | "error" | "warning" | "";
type Activity = {
  id_activity: number;
  title: string;
  description: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  cupo?: number;
  inscritos?: number;
  ya_inscrito?: boolean;
};

export default function InscripcionesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageKind>("");
  const [showMine, setShowMine] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchActivities(u.id_user);
    } else {
      fetchActivities();
    }
  }, []);

  const fetchActivities = async (id_user?: number) => {
    try {
      const res = await fetch("/api/activities", {
        method: id_user ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: id_user ? JSON.stringify({ id_user }) : undefined,
      });
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      setMessage("❌ Error al cargar actividades.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text: string, type: MessageKind) => {
    setMessage(text);
    setMessageType(type);
    // ⏱️ autocierre suave
    setTimeout(() => setMessage(""), 3000);
  };

  const handleInscribir = async (id_activity: number) => {
    if (!user) {
      notify("⚠️ Debes iniciar sesión antes de inscribirte.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_user: user.id_user, id_activity }),
      });
      const data = await res.json();

      if (data?.error) {
        notify(data.error, "error");
      } else {
        notify("✅ Inscripción completada con éxito.", "success");
        // 🔄 Actualizar lista con nuevo estado “inscrito”
        fetchActivities(user.id_user);
      }
    } catch {
      notify("❌ Error al realizar la inscripción.", "error");
    }
  };

  // 🔎 Filtro local (no afecta endpoints)
  const filtered = useMemo(() => {
    const base = activities.filter((a) => {
      if (showMine && !a.ya_inscrito) return false;
      if (query.trim().length > 0) {
        const q = query.toLowerCase();
        return (
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.lugar?.toLowerCase().includes(q)
        );
      }
      return true;
    });
    // Orden sugerido: por fecha y hora asc
    return base.sort((x, y) => {
      const fx = `${x.fecha ?? ""} ${x.hora_inicio ?? ""}`;
      const fy = `${y.fecha ?? ""} ${y.hora_inicio ?? ""}`;
      return fx.localeCompare(fy);
    });
  }, [activities, showMine, query]);

  // ⏳ Skeleton de carga
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto h-8 w-80 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-10 w-full sm:w-72 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-10 w-44 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="h-5 w-56 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="mt-4 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="mt-5 h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-6 text-gray-800 dark:text-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* 🔹 Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-3">
            Inscripción de Actividades
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Elige las actividades del Congreso a las que deseas inscribirte.
          </p>
        </div>

        {/* 🔔 Mensaje */}
        {message && (
          <div
            role="status"
            className={`max-w-lg mx-auto mb-8 text-center p-3 rounded-lg text-sm font-medium border transition ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
                : messageType === "error"
                ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700"
                : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* 🔍 Controles (locales) */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative w-full sm:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, lugar o descripción…"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Buscar actividades"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </label>

          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={showMine}
              onChange={(e) => setShowMine(e.target.checked)}
            />
            <span className="text-sm">Mostrar solo mis inscripciones</span>
          </label>
        </div>

        {/* 🗂️ Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron actividades con el filtro actual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((a) => {
              const cupo = a.cupo ?? 0;
              const inscritos = a.inscritos ?? 0;
              const porcentaje = cupo > 0 ? Math.min((inscritos / cupo) * 100, 100) : 0;

              let color = "bg-green-500";
              if (porcentaje >= 75) color = "bg-red-500";
              else if (porcentaje >= 50) color = "bg-yellow-500";

              const lleno = cupo > 0 && inscritos >= cupo;
              const inscrito = a.ya_inscrito === true;

              return (
                <article
                  key={a.id_activity}
                  className="relative group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* halo */}
                  <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-indigo-500/20 transition" />
                  <div className="relative z-10 p-6">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 leading-tight">
                        {a.title}
                      </h2>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {inscrito && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 px-2 py-0.5 text-xs font-semibold"
                            title="Ya estás inscrito en esta actividad"
                          >
                            ✅ Inscrito
                          </span>
                        )}
                        {lleno && !inscrito && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200 px-2 py-0.5 text-xs font-semibold"
                            title="Cupos llenos"
                          >
                            ⛔ Lleno
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                      {a.description}
                    </p>

                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                      <p>📅 {a.fecha || "Por confirmar"}</p>
                      <p>🕒 {a.hora_inicio || "--:--"} — {a.hora_fin || "--:--"}</p>
                      <p>📍 {a.lugar || "Por definir"}</p>
                    </div>

                    {/* 🧮 Cupos y barra */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Cupos</span>
                        <span className="tabular-nums">
                          {inscritos}/{cupo || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${porcentaje}%` }}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(porcentaje)}
                          role="progressbar"
                        />
                      </div>
                      {/* Etiquetas de ocupación */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{porcentaje < 50 ? "Alta disponibilidad" : porcentaje < 75 ? "Quedan pocos cupos" : "Casi lleno"}</span>
                        <span>{Math.round(porcentaje)}%</span>
                      </div>
                    </div>

                    {/* 🔘 Botón dinámico */}
                    <button
                      onClick={() => handleInscribir(a.id_activity)}
                      disabled={lleno || inscrito}
                      className={`w-full font-semibold py-2.5 rounded-lg transition-transform duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${
                        inscrito
                          ? "bg-emerald-600 text-white cursor-default"
                          : lleno
                          ? "bg-gray-400 text-gray-100"
                          : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"
                      }`}
                      aria-disabled={lleno || inscrito}
                    >
                      {inscrito ? "✅ Inscrito" : lleno ? "Cupos llenos" : "Inscribirme"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
