'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
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

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
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
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('❌ Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-600/10 to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {/* 🔹 Título */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
              Registro de Alumnos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Crea tu cuenta para participar en el Congreso
            </p>
          </div>

          {/* 🧾 Campos */}
          <input
            name="full_name"
            placeholder="Nombre completo"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="phone"
            placeholder="Teléfono"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            name="tipo"
            onChange={handleChange}
            value={form.tipo}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="interno">Alumno Interno (UMG)</option>
            <option value="externo">Alumno Externo</option>
          </select>

          {form.tipo === 'interno' ? (
            <input
              name="carne"
              placeholder="Carné universitario"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <input
              name="colegio"
              placeholder="Institución o Colegio"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}

          {/* 🔘 Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          {/* 🔔 Mensaje */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
                message.includes('Error') || message.includes('❌')
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              }`}
            >
              {message}
            </div>
          )}

          {/* 🧭 Volver al login */}
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
