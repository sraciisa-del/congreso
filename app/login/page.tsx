'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        setMessageType('error');
      } else {
        setMessage(`✅ Bienvenido, ${data.user.full_name}`);
        setMessageType('success');
        sessionStorage.setItem('user', JSON.stringify(data.user));

        // Redirección con pequeño delay para mostrar mensaje
        setTimeout(() => {
          window.location.href = '/home';
        }, 1200);
      }
    } catch (err) {
      setMessage('❌ Error al iniciar sesión. Intenta nuevamente.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {/* 🔷 Logo */}
          <div className="flex justify-center mb-2">
            <Image
              src="/logoumg.jpg"
              alt="Logo Congreso"
              width={90}
              height={90}
              className="rounded-xl shadow-md"
            />
          </div>

          {/* 🔹 Título */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* 📧 Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* 🔒 Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
            />
            {capsLockOn && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
                ⚠️ Bloq Mayús está activado
              </p>
            )}
          </div>

          {/* 🔘 Botón de ingreso */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>

          {/* 🔔 Mensaje visual */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-400'
              }`}
            >
              {message}
            </div>
          )}

          {/* 🧭 Link para registrarse */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
