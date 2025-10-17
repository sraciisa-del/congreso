"use client";

import { useEffect, useState } from "react";

type Activity = {
  id_activity: number;
  title: string;
};

type ApiResponse = {
  message?: string;
  error?: string;
};

export default function DiplomaPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");

  // ✅ Cargar usuario y actividades al montar
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const email = parsed.email || parsed.correo;
      const name = parsed.full_name || parsed.nombre;

      setUserEmail(email);
      setUserName(name);
      fetchActivities(email);
    }
  }, []);

  // ✅ Obtener actividades del usuario
  const fetchActivities = async (correo: string) => {
    try {
      const res = await fetch("/api/diplomas/user-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        setMessage("⚠️ No se pudieron cargar tus actividades.");
        setMessageType("warning");
      }
    } catch (error) {
      console.error("❌ Error al cargar actividades:", error);
      setMessage("❌ Error al obtener tus actividades.");
      setMessageType("error");
    }
  };

  // ✅ Enviar diploma
  const handleGenerar = async () => {
    if (!userEmail) {
      setMessage("⚠️ Debes iniciar sesión para generar tu diploma.");
      setMessageType("warning");
      return;
    }
    if (!selectedActivity) {
      setMessage("⚠️ Selecciona una actividad para continuar.");
      setMessageType("warning");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/diplomas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: userEmail, id_activity: selectedActivity }),
      });

      const data: ApiResponse = await res.json();
      if (!res.ok || data.error) {
        setMessage(data.error || "❌ Error al enviar el diploma.");
        setMessageType("error");
      } else {
        setMessage(data.message || "🎓 Diploma enviado correctamente a tu correo.");
        setMessageType("success");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("❌ Error al enviar el diploma.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // 🕐 Pantalla de carga inicial
  if (!userEmail) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-300">
        Cargando información del usuario...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Encabezado */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 text-center">
            Generar Diploma
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Bienvenido <span className="font-semibold">{userName}</span> 🎓 <br />
            Selecciona la actividad del congreso para generar tu diploma.
          </p>

          {/* Select de actividades */}
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actividad:
          </label>
          <select
            value={selectedActivity ?? ""}
            onChange={(e) => setSelectedActivity(Number(e.target.value))}
            className="w-full mb-6 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
          >
            <option value="">-- Selecciona una actividad --</option>
            {activities.map((a) => (
              <option key={a.id_activity} value={a.id_activity}>
                {a.title}
              </option>
            ))}
          </select>

          {/* Botón */}
          <button
            onClick={handleGenerar}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${
              loading
                ? "bg-blue-300 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"
            }`}
          >
            {loading ? "Enviando..." : "Generar y Enviar Diploma"}
          </button>

          {/* Mensaje */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg text-center font-semibold text-sm border transition-all duration-300 ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-300"
                  : messageType === "warning"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-300"
                  : "bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Pie de ayuda */}
      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Si no ves el correo, revisa tu carpeta de spam o “Promociones”.
      </p>
    </main>
  );
}
