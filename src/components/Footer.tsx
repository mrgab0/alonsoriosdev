"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, GitBranch } from "lucide-react";

interface LatestWork {
  cleanRepoName: string;
  message: string;
  branch?: string;
  url?: string;
}

export const Footer: React.FC = () => {
  const [latestWork, setLatestWork] = useState<LatestWork>({
    cleanRepoName: "alonsorios.dev",
    message: "Roadmap, Mirror GitHub & Rediseño de Alto Contraste",
  });

  useEffect(() => {
    fetch("/api/developer/activity")
      .then((res) => res.json())
      .then((data) => {
        if (data?.latestActivity) {
          setLatestWork(data.latestActivity);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#050914] text-white border-t border-[#1e2a42]">
      {/* Franja Modesta: En qué está trabajando hoy el developer */}
      <div className="bg-[#02050e] border-b border-slate-800/80 py-3 px-4 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#67dba9]"></span>
            </span>
            <span className="text-emerald-400 font-black uppercase tracking-wider text-[11px] shrink-0">
              Trabajando hoy:
            </span>
            <span className="text-white font-bold truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
              <strong className="text-amber-300 font-black">{latestWork.cleanRepoName}</strong> · {latestWork.message}
            </span>
          </div>

          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold text-xs group transition shrink-0 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20"
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver Roadmap & Walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Footer Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white font-bold">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-[#0f172a] border border-slate-700/80 flex items-center justify-center text-amber-400 font-black text-xs overflow-hidden shadow-inner shrink-0">
            <img
              src="https://github.com/mrgab0.png"
              alt="Alonso Ríos"
              className="w-full h-full object-cover rounded-xl relative z-10"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="absolute text-amber-400 font-black text-xs z-0">AR</span>
          </div>
          <div>
            <span className="font-editorial text-sm text-white font-bold block leading-tight">Alonso Ríos</span>
            <span className="text-[11px] text-amber-300 font-mono font-bold">Sitios Web · Apps · SEO · Cursos</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-white font-bold">
          <Link href="/#inicio" className="hover:text-amber-400 transition">Inicio</Link>
          <Link href="/#servicios" className="hover:text-amber-400 transition">Servicios</Link>
          <Link href="/#libros-cursos" className="hover:text-amber-400 transition">Cursos</Link>
          <Link href="/blog" className="hover:text-amber-400 transition">Blog</Link>
          <Link href="/roadmap" className="hover:text-amber-400 transition text-amber-300 flex items-center gap-1">
            <span>Roadmap</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </Link>
          <Link href="/herramientas/creador-qr-dinamico" className="hover:text-amber-400 transition">Herramientas</Link>
          <Link href="/#contacto" className="hover:text-amber-400 transition">Contacto</Link>
        </div>

        <div className="flex items-center gap-2 font-black text-white">
          <span>© {new Date().getFullYear()} Alonso Ríos (alonsorios.dev)</span>
          {/* Subtle discreet admin access */}
          <Link
            href="/admin"
            className="text-slate-500 hover:text-amber-400 transition p-1"
            title="Acceso Privado"
          >
            <Lock className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
