"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Lock, Globe, RefreshCw, Eye, Sparkles } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
}

export const ProjectSlider: React.FC = () => {
  const projects: ProjectItem[] = [
    {
      id: "flowers-for-you",
      name: "Flowers For You LLC",
      url: "https://flowersforyoullc.com",
      displayUrl: "https://flowersforyoullc.com",
      category: "E-Commerce / Tienda Floral",
      description: "Sitio web de comercio electrónico optimizado para envíos de arreglos florales de lujo con carga ultrarrápida y catálogo interactivo.",
      image: "/images/projects/flowers_for_you.jpg",
      tags: ["Diseño Web", "E-Commerce", "SEO Local", "Velocidad < 1s"],
    },
    {
      id: "gabrielas-flowers",
      name: "Gabriela's Flowers LLC",
      url: "https://gabrielasflowersllc.com",
      displayUrl: "https://gabrielasflowersllc.com",
      category: "Boutique Floral / Servicios",
      description: "Plataforma web con catálogo visual de arreglos florales artesanales, reservas directas por WhatsApp y sistema de agendamiento fácil.",
      image: "/images/projects/gabrielas_flowers.jpg",
      tags: ["Página Corporativa", "WhatsApp Directo", "Diseño Adaptable"],
    },
    {
      id: "bonbon-flowers",
      name: "Bonbon Flowers",
      url: "https://bonbonflowers.com",
      displayUrl: "https://bonbonflowers.com",
      category: "Diseño Floral de Lujo",
      description: "Experiencia web premium con catálogo de regalos gourmet y flores, optimizada para conversión de clientes y máxima legibilidad.",
      image: "/images/projects/bonbon_flowers.jpg",
      tags: ["E-Commerce Premium", "SEO Google", "Alta Conversión"],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"preview" | "iframe">("preview");
  const [iframeError, setIframeError] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
    setIframeError(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
    setIframeError(false);
  };

  const currentProject = projects[currentIndex];

  return (
    <section id="proyectos" className="py-12 md:py-20 bg-[#0a1120] text-white border-b border-[#1e2a42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3.5 py-1 rounded-full text-xs font-bold w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trabajos Recientes • Portafolio de Proyectos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Últimos Proyectos Realizados
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Deslice para explorar las vistas previas interactivas en miniatura de sitios reales entregados.
            </p>
          </div>

          {/* Slide Navigation Buttons & View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="bg-[#121b2d] p-1 rounded-xl border border-[#1e2a42] flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "preview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Vista Captura
              </button>
              <button
                onClick={() => setViewMode("iframe")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "iframe" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Modo En vivo (iFrame)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2.5 bg-[#121b2d] hover:bg-[#1e2a42] border border-[#1e2a42] rounded-xl text-white transition"
                title="Anterior proyecto"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2.5 bg-[#121b2d] hover:bg-[#1e2a42] border border-[#1e2a42] rounded-xl text-white transition"
                title="Siguiente proyecto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Browser Frame Slider Widget */}
        <div className="bg-[#121b2d] rounded-3xl border border-[#1e2a42] shadow-2xl overflow-hidden">
          
          {/* Simulated Browser Bar */}
          <div className="bg-[#080e1e] px-4 sm:px-6 py-3 border-b border-[#1e2a42] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-xl bg-[#121b2d] border border-[#1e2a42] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300 font-mono overflow-hidden">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{currentProject.displayUrl}</span>
            </div>

            {/* Direct Link Button */}
            <a
              href={currentProject.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Visitar Sitio Real</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Canvas Screen */}
          <div className="relative aspect-video w-full bg-[#0a1120] overflow-hidden group">
            {viewMode === "preview" ? (
              <img
                src={currentProject.image}
                alt={currentProject.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full relative">
                {!iframeError ? (
                  <iframe
                    src={currentProject.url}
                    title={currentProject.name}
                    className="w-full h-full border-0"
                    onError={() => setIframeError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0a1120]">
                    <Globe className="w-12 h-12 text-amber-400 mb-3" />
                    <h4 className="text-lg font-bold text-white mb-1">
                      Sitio protegido contra incrustación iFrame externa
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mb-4">
                      Este sitio web restringe la carga dentro de marcos de terceros por seguridad. Puedes ver la captura de pantalla o visitar la web directamente.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setViewMode("preview")}
                        className="bg-[#1e2a42] text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Ver Captura HD
                      </button>
                      <a
                        href={currentProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#fbbf24] text-[#0a1120] text-xs font-black px-4 py-2 rounded-xl"
                      >
                        Abrir {currentProject.name} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overlay Caption Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/90 to-transparent p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  {currentProject.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{currentProject.name}</h3>
                <p className="text-xs text-slate-300 max-w-2xl">{currentProject.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentProject.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#121b2d] border border-[#1e2a42] text-slate-300 text-[11px] px-2.5 py-1 rounded-lg font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator Slider Control */}
          <div className="bg-[#080e1e] py-3 px-6 border-t border-[#1e2a42] flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Proyecto {currentIndex + 1} de {projects.length}
            </span>

            <div className="flex items-center gap-2">
              {projects.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIframeError(false);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    currentIndex === idx ? "w-8 bg-amber-400" : "w-2.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={p.name}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
