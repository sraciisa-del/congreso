"use client";
import { useEffect, useState } from "react";

export default function DiplomaPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ✅ Cargar usuario desde sessionStorage o localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionUser = sessionStorage.getItem("user");
      const localUser = localStorage.getItem("user");
      const storedUser = sessionUser || localUser;

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log("👤 Usuario detectado:", parsed);

          // soportar ambos nombres posibles
          setUserEmail(parsed.email || parsed.correo);
          setUserName(parsed.full_name || parsed.nombre);
        } catch (e) {
          console.error("Error parseando usuario:", e);
        }
      }

      setIsReady(true);
    }
  }, []);

  const handleGenerar = async () => {
    if (!userEmail) {
      setMessage("⚠️ Debes iniciar sesión para generar tu diploma.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/diplomas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: userEmail }),
      });

      const data = await res.json();
      setMessage(data.message || "🎓 Diploma enviado correctamente a tu correo.");
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("❌ Error al enviar el diploma.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Mientras carga
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-300">
        Cargando datos del usuario...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-6">
            Generar mi Diploma
          </h1>

          {userEmail ? (
            <>
              <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg">
                Bienvenido <span className="font-semibold">{userName}</span> 🎓 <br />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Correo registrado: <b>{userEmail}</b>
                </span>
              </p>

              <button
                onClick={handleGenerar}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-md ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                }`}
              >
                {loading ? "Enviando..." : "Generar y Enviar Diploma"}
              </button>
            </>
          ) : (
            <p className="text-red-600 dark:text-red-400 font-medium mt-4">
              Debes iniciar sesión para generar tu diploma.
            </p>
          )}

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg font-semibold text-center text-sm transition-all duration-300 ${
                message.includes("🎓")
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-500"
                  : message.includes("⚠️")
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-500"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-500"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
