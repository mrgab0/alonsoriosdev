"use client";

import React from "react";
import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Award,
  Code2,
  Smartphone,
  Search,
  BookOpen,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export const Hero: React.FC = () => {
  const { config } = useConfig();
  const heroData = config?.sections?.hero || {};

  const whatsappNum =
    config?.sections?.contact?.whatsappNumber?.replace(/\+/g, "") || "584129912840";
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=Hola%20Alonso,%20necesito%20ayuda%20con%20un%20proyecto`;

  return (
    <section id="inicio" className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-[#070d19] text-white overflow-hidden">
      {/* Ambient Cinematic Radiance Gradients (Stitch Obsidian Style) */}
      <div className="pointer-events-none absolute top-10 left-1/4 -translate-x-1/2 w-[580px] h-[480px] bg-orange-500/10 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none absolute top-32 right-10 w-[460px] h-[460px] bg-amber-400/8 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Content & Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6 items-start">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0f172a] border border-slate-700/80 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#67dba9]"></span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {heroData.statusBadge || "Cupos Disponibles · Q2 2026"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs font-mono font-bold text-slate-300">
                Caracas & Global Remoto
              </span>
            </div>

            {/* Main Headline (Monumental Newsreader Serif) */}
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-mono tracking-widest text-slate-400 uppercase font-bold">
                {heroData.title || "Páginas Web, Apps Android y SEO"}
              </span>
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white font-normal leading-[0.98] tracking-tight">
                PROFESIONALES
                <span className="text-amber-400 drop-shadow-[0_2px_24px_rgba(251,191,36,0.35)]">.</span>
              </h1>
            </div>

            {/* Body Pitch */}
            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed max-w-xl">
              {heroData.subtitle || (
                <>
                  Hola, soy <strong className="text-white font-black">Alonso Ríos</strong>. Ayudo a
                  personas y negocios a crear sitios web profesionales{" "}
                  <span className="text-amber-400 font-bold font-mono">($760 USD)</span>, recuperar
                  páginas caídas{" "}
                  <span className="text-amber-400 font-bold font-mono">($190 USD)</span>, desarrollar
                  aplicaciones Android{" "}
                  <span className="text-amber-400 font-bold font-mono">($1,140 USD)</span> y aprender
                  programación de forma transparente y sin enredos.
                </>
              )}
            </p>

            {/* Quick Scope Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Sitios Web</span>
              </a>
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Apps Android</span>
              </a>
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>SEO & Arreglos</span>
              </a>
              <a
                href="#libros-cursos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Cursos & Libros</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <a
                href={heroData.primaryCtaUrl || "#servicios"}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 text-sm font-black uppercase tracking-wider shadow-xl shadow-amber-400/20 transition transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{heroData.primaryCtaText || "Ver Servicios y Precios"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white border border-slate-700/80 text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{heroData.secondaryCtaText || "Hablar por WhatsApp"}</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-white font-bold">5.0 / 5.0 (Reseñas Reales)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Atención Directa y Personal</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-400">Respuesta &lt; 15 min</span>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Card (Stitch Screen 4) */}
          <div className="lg:col-span-5">
            <div className="bg-[#090f1d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
              {/* Profile Bar */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-[#090f1d] rounded-[14px] flex items-center justify-center text-amber-400 font-black text-2xl font-editorial">
                    {heroData.avatarUrl ? (
                      <img
                        src={heroData.avatarUrl}
                        alt="Alonso Ríos"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      "AR"
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090f1d] shadow-[0_0_8px_#67dba9]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-editorial text-2xl text-white font-normal">Alonso Ríos</h3>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs font-mono font-bold text-amber-400">
                    Especialista Sénior Full-Stack & Creador
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Caracas, Venezuela · Proyectos Internacionales
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    Proyectos Exitosos
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-400">+100</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">100% Entregados</span>
                </div>

                <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    Satisfacción
                  </span>
                  <span className="text-2xl font-mono font-black text-emerald-400">99.4%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Soporte Continuo</span>
                </div>
              </div>

              {/* Stack Telemetry Progress Bars */}
              <div className="space-y-3 bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Especialidad & Rendimiento
                </span>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Sitios Web & Next.js (Core Web Vitals)</span>
                    <span className="text-emerald-400 font-bold">100/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[98%] rounded-full shadow-[0_0_8px_#67dba9]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Apps Android Nativas (Kotlin)</span>
                    <span className="text-amber-400 font-bold">Alta Gama</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 w-[94%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Recuperación de Sitios & Seguridad</span>
                    <span className="text-blue-400 font-bold">Rescate 24h</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[96%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Direct Quick WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar Directamente por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
