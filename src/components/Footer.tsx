"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050914] text-white border-t border-[#1e2a42] py-10 font-bold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            AR
          </div>
          <div>
            <span className="font-black text-white text-sm block">Alonso Ríos</span>
            <span className="text-white font-extrabold">Sitios Web • Apps Android • SEO • Cursos</span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-black text-white">
          <a href="#inicio" className="hover:text-amber-400 transition">Inicio</a>
          <a href="#servicios" className="hover:text-amber-400 transition">Servicios</a>
          <a href="#libros-cursos" className="hover:text-amber-400 transition">Cursos y Libros</a>
          <a href="#contacto" className="hover:text-amber-400 transition">Contacto</a>
        </div>

        <div className="flex items-center gap-1 font-black text-white">
          <span>© {new Date().getFullYear()} Alonso Ríos (alonsorios.dev)</span>
        </div>

      </div>
    </footer>
  );
};
