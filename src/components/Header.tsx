"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X, ShieldCheck, ChevronDown, QrCode, Sparkles, FileText, CreditCard, GitBranch } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const { config } = useConfig();
  const avatarUrl = config?.sections?.hero?.avatarUrl || "https://github.com/mrgab0.png";

  return (
    <header className="sticky top-0 z-50 bg-[#080e1e] border-b border-slate-800 shadow-md">
      {/* Top Banner for non-tech clients */}
      <div className="bg-[#050914] text-white text-xs py-2 px-4 border-b border-slate-800/80 font-mono">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#67dba9] animate-pulse" />
            <span className="text-white font-medium">Disponible para Sitios Web, Apps Android y Cursos</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Atención personal en español claro | Sin términos confusos</span>
            </div>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-mono font-bold">Tarifa $19 USD/h</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo with Profile Picture */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-700/80 flex items-center justify-center text-amber-400 font-black text-lg shadow-inner group-hover:border-amber-400/50 transition overflow-hidden">
            <img
              src={avatarUrl}
              alt="Alonso Ríos"
              className="w-full h-full object-cover rounded-xl relative z-10"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="absolute text-amber-400 font-black text-sm z-0">AR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors leading-tight font-bold">
              Alonso Ríos
            </span>
            <span className="text-[11px] text-amber-300 font-mono font-bold uppercase tracking-wider">
              Sitios Web · Apps · SEO · Cursos
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-extrabold text-white text-sm">
          <Link href="/#inicio" className="hover:text-amber-400 transition-colors">
            Inicio
          </Link>
          <Link href="/#servicios" className="hover:text-amber-400 transition-colors">
            Servicios
          </Link>
          <Link href="/#libros-cursos" className="hover:text-amber-400 transition-colors">
            Cursos y Libros
          </Link>
          <Link href="/blog" className="hover:text-amber-400 transition-colors">
            Blog
          </Link>
          <Link href="/roadmap" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span>Roadmap</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#67dba9]" />
          </Link>

          {/* Dropdown Herramientas on Hover */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer font-extrabold">
              <span>Herramientas</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 text-amber-400" />
            </button>

            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-[#0c1527] border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex flex-col gap-1">
                <Link
                  href="/herramientas/creador-qr-estatico"
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-3 group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm group-hover/item:text-amber-400 transition-colors">
                      QR Estático
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      Gratis, WiFi, URLs, descarga SVG/PNG
                    </div>
                  </div>
                </Link>

                <Link
                  href="/herramientas/creador-qr-dinamico"
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-3 group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm group-hover/item:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>QR Dinámico</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">Pro</span>
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      Cambia el destino después de imprimir
                    </div>
                  </div>
                </Link>

                <Link
                  href="/herramientas/creador-qr-pago-movil"
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-3 group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm group-hover/item:text-yellow-400 transition-colors flex items-center gap-1.5">
                      <span>🇻🇪 Pago Móvil QR</span>
                      <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded font-black">Comercios</span>
                    </div>
                    <div className="text-xs text-white/90 font-medium">
                      Diseña tu cartel de mostrador en acrílico
                    </div>
                  </div>
                </Link>

                <div className="p-2.5 rounded-xl opacity-60 flex items-start gap-3 cursor-not-allowed">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm flex items-center gap-1.5">
                      <span>Unir PDFs</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">Pronto</span>
                    </div>
                    <div className="text-xs text-white/80 font-medium">
                      Fusionar documentos en navegador
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link href="/#contacto" className="hover:text-amber-400 transition-colors">
            Contacto
          </Link>
        </nav>

        {/* Action Button: Live Telemetry Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20consultar%20sobre%20tus%20servicios"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 transition shadow-lg text-left"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#67dba9]"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold leading-none">
                Disponible
              </span>
              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                +58 412 991 2840
              </span>
            </div>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-700 text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080e1e] border-b border-slate-800 px-6 py-5 flex flex-col gap-3 font-black text-base text-white">
          <Link href="/#inicio" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Inicio
          </Link>
          <Link href="/#servicios" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Servicios (Páginas, Apps, SEO)
          </Link>
          <Link href="/#libros-cursos" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Cursos y Libros
          </Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Blog
          </Link>
          <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1 flex items-center justify-between">
            <span>Roadmap & Actividad GitHub</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">En Vivo</span>
          </Link>

          {/* Herramientas Móvil */}
          <div className="py-1">
            <button
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
              className="w-full flex items-center justify-between text-amber-400 hover:text-amber-300 font-black py-1 cursor-pointer"
            >
              <span>🛠️ Herramientas Gratuitas</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${mobileToolsOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileToolsOpen && (
              <div className="pl-4 pt-2 flex flex-col gap-2 font-bold text-sm text-slate-300">
                <Link
                  href="/herramientas/creador-qr-estatico"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 hover:text-white"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Creador QR Estático</span>
                </Link>
                <Link
                  href="/herramientas/creador-qr-dinamico"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 hover:text-white"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Creador QR Dinámico (Editable)</span>
                </Link>
                <Link
                  href="/herramientas/creador-qr-pago-movil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-yellow-300 hover:text-white"
                >
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <span>🇻🇪 QR Pago Móvil & Acrílicos</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/#contacto" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Contacto Directo
          </Link>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <a
              href="https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20información"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hablar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
