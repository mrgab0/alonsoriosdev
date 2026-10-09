"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  BarChart3,
  Mail,
  MessageSquare,
  Send,
  ArrowLeft,
  LogOut,
  Type,
  QrCode,
} from "lucide-react";
import { useAccessibility } from "@/components/AccessibilityContext";

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { textSize, setTextSize, isHighContrast, toggleHighContrast } = useAccessibility();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-[#070d19] text-white flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#0b1324] border-b border-[#1e2a42] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-white font-bold hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Web</span>
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>Panel de Administración</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-bold uppercase">
              alonsorios.dev
            </span>
          </h1>
        </div>

        {/* Accessibility Scaler & Contrast Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#121b2d] px-2 py-1 rounded-xl text-sm border border-[#1e2a42]">
            <Type className="w-4 h-4 text-amber-400 mr-1" />
            <span className="text-white font-bold font-bold mr-1 hidden sm:inline text-sm">Tamaño de letra:</span>
            <button
              onClick={() => setTextSize("normal")}
              className={`px-2 py-0.5 rounded-lg font-black transition text-sm ${
                textSize === "normal" ? "bg-amber-400 text-[#070d19]" : "text-white font-bold hover:text-white"
              }`}
              title="Tamaño Normal"
            >
              A
            </button>
            <button
              onClick={() => setTextSize("large")}
              className={`px-2 py-0.5 rounded-lg font-black transition text-sm ${
                textSize === "large" ? "bg-amber-400 text-[#070d19]" : "text-white font-bold hover:text-white"
              }`}
              title="Tamaño Grande"
            >
              A+
            </button>
            <button
              onClick={() => setTextSize("xlarge")}
              className={`px-2 py-0.5 rounded-lg font-black transition text-sm ${
                textSize === "xlarge" ? "bg-amber-400 text-[#070d19]" : "text-white font-bold hover:text-white"
              }`}
              title="Tamaño Extra Grande"
            >
              A++
            </button>
          </div>

          <button
            onClick={toggleHighContrast}
            className={`px-2.5 py-1 text-sm rounded-xl transition border font-bold ${
              isHighContrast
                ? "bg-amber-400 text-[#0a1120] border-amber-300 font-black"
                : "border-[#1e2a42] text-white font-bold hover:text-white bg-[#121b2d]"
            }`}
          >
            {isHighContrast ? "Alto Contraste ON" : "Alto Contraste"}
          </button>
        </div>

        {/* Admin Navigation Tabs & Actions */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-3 text-sm font-bold">
            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin"
                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Resumen</span>
            </Link>
            <Link
              href="/admin/editor"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/editor"
                  ? "bg-blue-400/10 text-blue-400 border-blue-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Editor Home & Tema</span>
            </Link>
            <Link
              href="/admin/analytics"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/analytics"
                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Estadísticas</span>
            </Link>
            <Link
              href="/admin/contacts"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/contacts"
                  ? "bg-purple-400/10 text-purple-400 border-purple-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Contactos Reales</span>
            </Link>
            <Link
              href="/admin/campaigns"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/campaigns"
                  ? "bg-rose-400/10 text-rose-400 border-rose-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <Send className="w-4 h-4 text-rose-400" />
              <span>Email Marketing</span>
            </Link>
            <Link
              href="/admin/chat"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/chat"
                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Logs Chatbot</span>
            </Link>
            <Link
              href="/admin/blog"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/blog"
                  ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Blog Editor</span>
            </Link>
            <Link
              href="/admin/qr"
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 border border-[#1e2a42] transition ${
                pathname === "/admin/qr"
                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                  : "bg-[#121b2d] hover:bg-[#1e2a42] text-white font-bold"
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Gestor QR</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-2 text-sm font-bold transition"
            title="Cerrar Sesión de Administrador"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
