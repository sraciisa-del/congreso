'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type MsgKind = 'success' | 'error' | '';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MsgKind>('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validación suave del correo
  const emailValid = useMemo(() => {
    if (email.trim() === '') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const canSubmit = emailValid && password.length >= 1 && !loading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (data?.error) {
        setMessage(data.error);
        setMessageType('error');
      } else {
        setMessage(`✅ Bienvenido, ${data.user?.full_name ?? 'usuario'}`);
        setMessageType('success');

        // Guardado de sesión: sessionStorage por defecto, localStorage si activan "Recordarme"
        try {
          const payload = JSON.stringify(data.user);
          if (rememberMe) {
            localStorage.setItem('user', payload);
          }
          sessionStorage.setItem('user', payload);
        } catch {
          /* no-op */
        }

        // Pequeño delay para mostrar el mensaje
        setTimeout(() => {
          window.location.href = '/home';
        }, 1100);
      }
    } catch {
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
        {/* Halo/gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              src="/logoumg.jpg"
              alt="Logo Congreso"
              width={90}
              height={90}
              className="rounded-xl shadow-md"
              priority
            />
          </div>

          {/* Título */}
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="correo@ejemplo.com"
              type="email"
              required
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 outline-none text-gray-900 dark:text-gray-100 focus:ring-2 ${
                email.length > 0 && !emailValid
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
              aria-invalid={email.length > 0 && !emailValid}
              aria-describedby="email-help"
            />
            <div id="email-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Usa un correo válido (ej. nombre@dominio.com)
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
              />
              {/* Toggle show/hide (SVG inline, sin dependencias) */}
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  // Eye-off
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42M9.88 5.1A10.94 10.94 0 0112 5c7 0 10 7 10 7a17.7 17.7 0 01-3.17 4.33M6.12 6.12A17.7 17.7 0 002 12s3 7 10 7a10.94 10.94 0 004.9-1.12" />
                  </svg>
                ) : (
                  // Eye
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {capsLockOn && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
                ⚠️ Bloq Mayús está activado
              </p>
            )}
          </div>

          {/* Recordarme */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Recordarme en este equipo</span>
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">¿Olvidaste tu contraseña?</span>
          </div>

          {/* Botón de ingreso */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
              loading
                ? 'bg-blue-300'
                : canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                : 'bg-blue-300'
            }`}
            aria-busy={loading}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>

          {/* Mensaje visual */}
          {message && (
            <div
              role="status"
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 border ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-400'
              }`}
            >
              {message}
            </div>
          )}

          {/* Link para registrarse */}
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
