'use client';

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";

export default function EscanearPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<"green" | "yellow" | "red">("green");
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // 🔹 Detener escáner al desmontar
  useEffect(() => {
    return () => {
      try {
        controlsRef.current?.stop();
      } catch {}
    };
  }, []);

  // 🔹 Iniciar escáner
  const startScanner = async () => {
    try {
      setMessage(null);
      setScanning(true);

      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;

      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      if (devices.length === 0) {
        setMessage("❌ No se detectó cámara en este dispositivo.");
        setMessageColor("red");
        setScanning(false);
        return;
      }

      const deviceId = devices[0].deviceId;

      controlsRef.current = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (res, err) => {
          if (res) {
            const text = res.getText();
            stopScanner();
            verifyInscription(text);
          }
        }
      );
    } catch (err) {
      console.error("❌ Error iniciando cámara:", err);
      setMessage("❌ No se pudo acceder a la cámara. Verifica permisos.");
      setMessageColor("red");
      setScanning(false);
    }
  };

  // 🔹 Detener escáner
  const stopScanner = () => {
    try {
      controlsRef.current?.stop();
      setScanning(false);
    } catch {}
  };

  // 🔹 Verificar inscripción
  const verifyInscription = async (text: string) => {
    try {
      const idPart = text.split("-")[1];
      if (!idPart) {
        setMessage("❌ Código QR inválido.");
        setMessageColor("red");
        return;
      }

      const res = await fetch(`/api/verify/${idPart}`);
      const data = await res.json();

      if (data.status === "success") {
        setMessage("✅ Asistencia confirmada correctamente.");
        setMessageColor("green");
      } else if (data.status === "warning") {
        setMessage("⚠️ Este código QR ya fue escaneado anteriormente.");
        setMessageColor("yellow");
      } else {
        setMessage("❌ Código no encontrado o inválido.");
        setMessageColor("red");
      }

      // 🔁 Reiniciar escáner automáticamente después de unos segundos
      setTimeout(() => {
        setMessage(null);
        startScanner();
      }, 3000);
    } catch {
      setMessage("❌ Error procesando el código QR.");
      setMessageColor("red");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Escanear Código QR 🎯
      </h1>

      {!scanning ? (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Iniciar Escáner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Detener Escáner
        </button>
      )}

      <video
        ref={videoRef}
        className="mt-6 w-[300px] h-[300px] bg-black rounded-lg shadow-lg object-cover border border-gray-400"
        muted
        autoPlay
      ></video>

      {/* 🔔 Mensaje dinámico */}
      {message && (
        <div
          className={`mt-6 px-6 py-4 rounded-xl text-center text-lg font-semibold shadow-lg max-w-md w-full transition-all duration-500
            ${
              messageColor === "green"
                ? "bg-green-100 border border-green-500 text-green-800"
                : messageColor === "yellow"
                ? "bg-yellow-100 border border-yellow-500 text-yellow-800"
                : "bg-red-100 border border-red-500 text-red-800"
            }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}
