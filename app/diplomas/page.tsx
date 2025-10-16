"use client";
import { useEffect, useState, useMemo } from "react";

type ApiResponse = {
  message?: string;
  error?: string;
  // Campos opcionales que tu API podría devolver:
  url?: string;
  pdf_url?: string;
  ruta_pdf?: string;
  cloudinary_url?: string;
};

export default function DiplomaPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Enlace opcional al PDF si la API lo trae con cualquier key conocida
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionUser = sessionStorage.getItem("user");
      const localUser = localStorage.getItem("user");
      const storedUser = sessionUser || localUser;

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserEmail(parsed.email || parsed.correo || null);
          setUserName(parsed.full_name || parsed.nombre || null);
        } catch (e) {
          console.error("Error parseando usuario:", e);
        }
      }
      setIsReady(true);
    }
  }, []);

  const safeName = useMemo(
    () => (userName && String(userName).trim().length > 0 ? userName : "Participante"),
    [userName]
  );

  const notify = (text: string, kind: "success" | "error" | "warning" | "") => {
    setMessage(text);
    setMessageType(kind);
    // autocierre suave
    if (kind !== "") setTimeout(() => setMessage(""), 3500);
  };

  const handleGenerar = async () => {
    if (!userEmail) {
      notify("⚠️ Debes iniciar sesión para generar tu diploma.", "warning");
      return;
    }

    setLoading(true);
    setMessage("");
    setPdfLink(null);

    try {
      const res = await fetch("/api/diplomas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: userEmail }),
      });

      const data: ApiResponse = await res.json();

      // Mensaje: prioridad a error, luego a message, luego default
      if (!res.ok || data?.error) {
        notify(data?.error || "❌ Error al enviar el diploma.", "error");
      } else {
        notify(data?.message || "🎓 Diploma enviado correctamente a tu correo.", "success");
      }

      // Descubrir cualquier posible key con URL para mostrar botón “Ver PDF”
      const discoveredUrl =
        data?.pdf_url || data?.url || data?.ruta_pdf || data?.cloudinary_url || null;
      if (typeof discoveredUrl === "string") {
        setPdfLink(discoveredUrl);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      notify("❌ Error al enviar el diploma.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Mientras carga datos básicos de usuario
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-300">
        Cargando datos del usuario...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-6 py-20 text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">
            Generar mi Diploma
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Recibe tu diploma oficial del Congreso en tu correo electrónico.
          </p>
        </div>

        {/* Card principal */}
        <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

          <div className="relative z-10 p-8">
            {/* Info de usuario */}
            {userEmail ? (
              <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-4">
                <p className="text-lg">
                  Bienvenido <span className="font-semibold">{safeName}</span> 🎓
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Correo registrado: <span className="font-medium">{userEmail}</span>
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  Debes iniciar sesión para generar tu diploma.
                </p>
              </div>
            )}

            {/* Mock de certificado (preview visual) */}
            <div
              aria-hidden
              className="mx-auto mb-6 aspect-[16/11] w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 p-6 shadow-inner"
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Congreso de Tecnología 2025
                </div>
                <div className="mt-2 text-2xl font-bold">Diploma de Participación</div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Otorgado a
                </div>
                <div className="mt-1 text-xl font-semibold text-blue-700 dark:text-blue-400">
                  {safeName}
                </div>
                <div className="mt-4 h-px w-40 bg-gray-200 dark:bg-gray-800" />
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  * Vista previa ilustrativa. El documento real llegará a tu correo.
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerar}
                disabled={loading || !userEmail}
                className={`w-full sm:w-auto flex-1 rounded-xl font-semibold px-5 py-3 shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed
                ${
                  loading || !userEmail
                    ? "bg-blue-300 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"
                }`}
              >
                {loading ? "Enviando..." : "Generar y Enviar Diploma"}
              </button>

              {/* Mostrar botón Ver PDF solo si la API devuelve URL */}
              {pdfLink && (
                <a
                  href={pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 text-center rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Ver PDF
                </a>
              )}
            </div>

            {/* Mensaje */}
            {message && (
              <div
                role="status"
                className={`mt-6 p-4 rounded-lg font-semibold text-center text-sm border transition
                ${
                  messageType === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-500"
                    : messageType === "warning"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-500"
                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-500"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Nota legal/ayuda */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Si no ves el correo, revisa tu carpeta de spam o “Promociones”.
        </p>
      </div>
    </main>
  );
}
