'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

type FormType = {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  tipo: 'interno' | 'externo';
  colegio: string;
  carne: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormType>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    tipo: 'externo',
    colegio: '',
    carne: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/[^\d+]/g, '') : value, // limpia teléfono
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(data.message || data.error || '✅ Registrado correctamente.');
      // Si quieres redirigir al login tras éxito:
      // if (res.ok) setTimeout(() => (window.location.href = '/login'), 1200);
    } catch {
      setMessage('❌ Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Validaciones suaves (solo UI, no cambian tu API)
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || ''),
    [form.email]
  );

  const phoneValid = useMemo(() => {
    const digits = (form.phone || '').replace(/\D/g, '');
    return digits.length >= 8; // regla simple
  }, [form.phone]);

  const passwordScore = useMemo(() => {
    // puntuación simple: longitud + clases de caracteres
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[a-z]/.test(form.password)) s++;
    if (/\d/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s; // 0-5
  }, [form.password]);

  const passwordHint =
    passwordScore <= 2 ? 'Débil' : passwordScore === 3 ? 'Media' : 'Fuerte';

  const canSubmit =
    !loading &&
    form.full_name.trim().length > 2 &&
    emailValid &&
    phoneValid &&
    form.password.length >= 8 &&
    (form.tipo === 'interno' ? form.carne.trim().length > 0 : form.colegio.trim().length > 0) &&
    acceptTerms;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {/* Título */}
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
              Registro de Alumnos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Crea tu cuenta para participar en el Congreso
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo
            </label>
            <input
              name="full_name"
              placeholder="Nombre completo"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              required
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 outline-none text-gray-900 dark:text-gray-100 focus:ring-2 ${
                form.email.length > 0 && !emailValid
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
              aria-invalid={form.email.length > 0 && !emailValid}
              aria-describedby="email-help"
            />
            <div id="email-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Usa un correo válido (ej. nombre@dominio.com)
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 8 caracteres"
                required
                value={form.password}
                onChange={handleChange}
                onKeyUp={(e) => setCapsLockOn((e as any).getModifierState?.('CapsLock'))}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  // eye-off
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M9.88 5.1A10.94 10.94 0 0112 5c7 0 10 7 10 7a17.7 17.7 0 01-3.17 4.33M6.12 6.12A17.7 17.7 0 002 12s3 7 10 7a10.94 10.94 0 004.9-1.12" />
                  </svg>
                ) : (
                  // eye
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Indicador de fuerza */}
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    passwordScore <= 2
                      ? 'bg-red-500 w-1/4'
                      : passwordScore === 3
                      ? 'bg-yellow-500 w-2/4'
                      : 'bg-green-500 w-4/5'
                  }`}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Fuerza: <span className="font-medium">{passwordHint}</span>
              </div>
              {capsLockOn && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                  ⚠️ Bloq Mayús está activado
                </p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <input
              name="phone"
              placeholder="Ej. 50212345678"
              required
              value={form.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 outline-none text-gray-900 dark:text-gray-100 focus:ring-2 ${
                form.phone.length > 0 && !phoneValid
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
              aria-invalid={form.phone.length > 0 && !phoneValid}
              inputMode="tel"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de alumno
            </label>
            <select
              name="tipo"
              onChange={handleChange}
              value={form.tipo}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="interno">Alumno Interno (UMG)</option>
              <option value="externo">Alumno Externo</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {form.tipo === 'interno'
                ? 'Para alumnos UMG, ingresa tu número de carné.'
                : 'Para externos, indica la institución o colegio.'}
            </p>
          </div>

          {/* Campo condicional */}
          {form.tipo === 'interno' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carné universitario
              </label>
              <input
                name="carne"
                placeholder="Carné universitario"
                onChange={handleChange}
                value={form.carne}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institución o Colegio
              </label>
              <input
                name="colegio"
                placeholder="Institución o Colegio"
                onChange={handleChange}
                value={form.colegio}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {/* Aceptar términos */}
          <label className="mt-2 inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Acepto los términos y condiciones del Congreso.
            </span>
          </label>

          {/* Botón */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
              loading
                ? 'bg-blue-300'
                : canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                : 'bg-blue-300'
            }`}
            aria-busy={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          {/* Mensaje */}
          {message && (
            <div
              role="status"
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium border ${
                message.includes('Error') || message.includes('❌')
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-400'
              }`}
            >
              {message}
            </div>
          )}

          {/* Volver al login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
