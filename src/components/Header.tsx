"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X, ShieldCheck, ChevronDown, QrCode, Sparkles, FileText } from "lucide-react";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#080e1e] border-b border-slate-800 shadow-md">
      {/* Top Banner for non-tech clients */}
      <div className="bg-[#050914] text-white text-xs sm:text-sm py-1.5 px-4 text-center border-b border-slate-800/60 font-bold">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center font-extrabold text-white text-center">
          <div className="flex items-center gap-2 font-extrabold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Atención personal en español claro | Sin términos técnicos confusos</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            AR
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
              Alonso Ríos
            </span>
            <span className="text-xs text-white font-extrabold">
              Sitios Web • Apps • SEO • Cursos
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
                    <div className="text-xs text-slate-400 font-normal">
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
                    <div className="text-xs text-slate-400 font-normal">
                      Cambia el destino después de imprimir
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
                    <div className="text-xs text-slate-400 font-normal">
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

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20consultar%20sobre%20tus%20servicios"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition transform hover:scale-105 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Directo</span>
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
