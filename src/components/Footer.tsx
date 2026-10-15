"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050914] text-white border-t border-[#1e2a42] py-10 font-bold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-slate-700/80 flex items-center justify-center text-amber-400 font-black text-xs">
            AR
          </div>
          <div>
            <span className="font-editorial text-sm text-white font-normal block leading-tight">Alonso Ríos</span>
            <span className="text-[11px] text-slate-400 font-mono">Sitios Web · Apps · SEO · Cursos</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-slate-300">
          <Link href="/#inicio" className="hover:text-amber-400 transition">Inicio</Link>
          <Link href="/#servicios" className="hover:text-amber-400 transition">Servicios</Link>
          <Link href="/#libros-cursos" className="hover:text-amber-400 transition">Cursos</Link>
          <Link href="/blog" className="hover:text-amber-400 transition">Blog</Link>
          <Link href="/herramientas/creador-qr-dinamico" className="hover:text-amber-400 transition">Herramientas</Link>
          <Link href="/#contacto" className="hover:text-amber-400 transition">Contacto</Link>
        </div>

        <div className="flex items-center gap-2 font-black text-white">
          <span>© {new Date().getFullYear()} Alonso Ríos (alonsorios.dev)</span>
          {/* Subtle discreet admin access */}
          <Link
            href="/admin"
            className="text-slate-600 hover:text-amber-400 transition p-1"
            title="Acceso Privado"
          >
            <Lock className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
          </Link>
        </div>

      </div>
    </footer>
  );
};
