'use client';
import { useEffect, useState } from "react";

export default function InscripcionesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");

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
      setActivities(data);
    } catch {
      setMessage("❌ Error al cargar actividades.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInscribir = async (id_activity: number) => {
    if (!user) {
      setMessage("⚠️ Debes iniciar sesión antes de inscribirte.");
      setMessageType("warning");
      return;
    }

    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_user: user.id_user, id_activity }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setMessageType("error");
      } else {
        setMessage("✅ Inscripción completada con éxito.");
        setMessageType("success");
        // 🔄 Actualizar lista con nuevo estado “inscrito”
        fetchActivities(user.id_user);
      }

      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("❌ Error al realizar la inscripción.");
      setMessageType("error");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300">
        Cargando actividades...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-6">
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
            className={`max-w-lg mx-auto mb-8 text-center p-3 rounded-lg text-sm font-medium border ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border-green-400"
                : messageType === "error"
                ? "bg-red-100 text-red-700 border-red-400"
                : "bg-yellow-100 text-yellow-800 border-yellow-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* 🔹 Lista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((a) => {
            const cupo = a.cupo ?? 0;
            const inscritos = a.inscritos ?? 0;
            const porcentaje = cupo > 0 ? Math.min((inscritos / cupo) * 100, 100) : 0;

            let color = "bg-green-500";
            if (porcentaje >= 75) color = "bg-red-500";
            else if (porcentaje >= 50) color = "bg-yellow-500";

            const lleno = inscritos >= cupo;
            const inscrito = a.ya_inscrito === true;

            return (
              <div
                key={a.id_activity}
                className="relative group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    {a.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                    {a.description}
                  </p>

                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                    <p>📅 {a.fecha}</p>
                    <p>🕒 {a.hora_inicio} — {a.hora_fin}</p>
                    <p>📍 {a.lugar}</p>
                  </div>

                  {/* 🧮 Cupos y barra */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Cupos:</span>
                      <span>{inscritos}/{cupo}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 🔘 Botón dinámico */}
                  <button
                    onClick={() => handleInscribir(a.id_activity)}
                    disabled={lleno || inscrito}
                    className={`w-full font-semibold py-2.5 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 ${
                      inscrito
                        ? "bg-green-600 text-white cursor-default"
                        : lleno
                        ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {inscrito
                      ? "✅ Inscrito"
                      : lleno
                      ? "Cupos llenos"
                      : "Inscribirme"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
