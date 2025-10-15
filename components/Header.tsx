'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Detectar sesión con "user" en sessionStorage o localStorage
  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    const localUser = localStorage.getItem("user");
    setIsLoggedIn(!!(sessionUser || localUser));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const navLinks = [
    { name: "Inicio", href: "/home" },
    { name: "Actividades", href: "/inscripciones" },
    { name: "Asistencia", href: "/escanear" },
    { name: "Diplomas", href: "/diplomas" },
  ];

  // ✅ Ocultar header en login/register
  const hideHeader = pathname === "/login" || pathname === "/register";

  if (hideHeader) return <div style={{ display: "none" }} />;

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* 🔹 Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logoumg.jpg"
            alt="Logo Congreso"
            width={60}
            height={60}
            className="rounded-lg"
          />
          <span className="font-semibold text-xl text-gray-900 dark:text-white tracking-wide">
            Congreso de Tecnología
          </span>
        </Link>

        {/* 🔹 Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-1"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* 🔹 Botón Cerrar Sesión */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all duration-200 shadow-md"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          )}
        </nav>

        {/* 🔹 Menú móvil */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* 🔹 Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
          <nav className="flex flex-col px-6 py-3 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-base font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-base font-semibold hover:bg-red-600 transition-all duration-200 shadow-md"
              >
                <LogOut size={20} />
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
