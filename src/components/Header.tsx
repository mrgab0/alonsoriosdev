"use client";

import React, { useState } from "react";
import { MessageCircle, Menu, X, Type, ShieldCheck } from "lucide-react";
import { useAccessibility } from "./AccessibilityContext";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { textSize, setTextSize, isHighContrast, toggleHighContrast } = useAccessibility();

  return (
    <header className="sticky top-0 z-50 bg-[#080e1e] border-b border-slate-800 shadow-md">
      {/* Top Banner for non-tech clients */}
      <div className="bg-[#050914] text-white text-xs sm:text-sm py-1.5 px-4 text-center border-b border-slate-800/60 font-bold">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 mx-auto sm:mx-0 font-extrabold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Atención personal en español claro | Sin términos técnicos confusos</span>
          </div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            {/* Font Size Accessibility Scaler */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-xs border border-slate-700">
              <Type className="w-3.5 h-3.5 text-white mr-1" />
              <span className="text-white font-bold mr-1 hidden sm:inline text-[11px]">Tamaño de letra:</span>
              <button
                onClick={() => setTextSize("normal")}
                className={`px-1.5 py-0.5 rounded font-black transition text-xs ${
                  textSize === "normal" ? "bg-blue-600 text-white" : "text-white hover:text-amber-400"
                }`}
                title="Tamaño Normal"
              >
                A
              </button>
              <button
                onClick={() => setTextSize("large")}
                className={`px-1.5 py-0.5 rounded font-black transition text-xs ${
                  textSize === "large" ? "bg-blue-600 text-white" : "text-white hover:text-amber-400"
                }`}
                title="Tamaño Grande"
              >
                A+
              </button>
              <button
                onClick={() => setTextSize("xlarge")}
                className={`px-1.5 py-0.5 rounded font-black transition text-xs ${
                  textSize === "xlarge" ? "bg-blue-600 text-white" : "text-white hover:text-amber-400"
                }`}
                title="Tamaño Extra Grande"
              >
                A++
              </button>
            </div>

            {/* High Contrast Switch */}
            <button
              onClick={toggleHighContrast}
              className={`px-2.5 py-0.5 text-xs rounded transition border font-bold ${
                isHighContrast
                  ? "bg-amber-400 text-[#0a1120] border-amber-300 font-black"
                  : "border-slate-700 text-white hover:text-amber-400 bg-slate-800/60"
              }`}
            >
              {isHighContrast ? "Alto Contraste ON" : "Alto Contraste"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
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
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-extrabold text-white text-sm">
          <a href="#inicio" className="hover:text-amber-400 transition-colors">
            Inicio
          </a>
          <a href="#servicios" className="hover:text-amber-400 transition-colors">
            Servicios
          </a>
          <a href="#libros-cursos" className="hover:text-amber-400 transition-colors">
            Cursos y Libros
          </a>
          <a href="#contacto" className="hover:text-amber-400 transition-colors">
            Contacto
          </a>
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
            className="p-2 rounded-lg border border-slate-700 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080e1e] border-b border-slate-800 px-6 py-5 flex flex-col gap-4 font-black text-base text-white">
          <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Inicio
          </a>
          <a href="#servicios" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Servicios (Páginas, Apps, SEO)
          </a>
          <a href="#libros-cursos" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Cursos y Libros
          </a>
          <a href="#contacto" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
            Contacto Directo
          </a>

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
