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
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-bold text-white">
                Caracas & Global Remoto
              </span>
            </div>

            {/* Main Headline (Harmonious & Proportional Editorial Balance - Zero Disproportion) */}
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-widest uppercase font-black text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#ffd462]" />
                <span>Ingeniería Digital & Posicionamiento Orgánico</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl lg:text-[54px] text-white font-extrabold leading-[1.08] tracking-tight">
                Páginas Web, Apps Android <br className="hidden md:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-amber-200 font-black">
                  y SEO Profesionales.
                </span>
              </h1>
            </div>

            {/* Body Pitch - High Contrast White Bold (Zero Grey) */}
            <p className="text-base sm:text-lg text-white font-semibold leading-relaxed max-w-xl">
              {heroData.subtitle || (
                <>
                  Hola, soy <strong className="text-white font-black underline decoration-2 decoration-orange-500">Alonso Ríos</strong>. Ayudo a
                  empresas, marcas y emprendedores a crear plataformas web profesionales{" "}
                  <span className="text-amber-300 font-black font-mono px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">($760 USD)</span>, recuperar
                  páginas caídas o hackeadas{" "}
                  <span className="text-amber-300 font-black font-mono px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">($190 USD)</span>, desarrollar
                  aplicaciones nativas Android{" "}
                  <span className="text-amber-300 font-black font-mono px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">($1,140 USD)</span> y aprender
                  programación de forma transparente y sin enredos.
                </>
              )}
            </p>

            {/* Quick Scope Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/60 text-white text-xs font-bold transition shadow-sm"
              >
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Sitios Web</span>
              </a>
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/60 text-white text-xs font-bold transition shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Apps Android</span>
              </a>
              <a
                href="#servicios"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/60 text-white text-xs font-bold transition shadow-sm"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>SEO & Arreglos</span>
              </a>
              <a
                href="#libros-cursos"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 hover:border-purple-400/60 text-white text-xs font-bold transition shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Cursos & Libros</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <a
                href={heroData.primaryCtaUrl || "#servicios"}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 text-sm font-black uppercase tracking-wider shadow-xl shadow-amber-400/20 transition transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer border border-[#ffd462]/40"
              >
                <span>{heroData.primaryCtaText || "Ver Servicios y Precios"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white border-2 border-white/80 hover:border-emerald-400 text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{heroData.secondaryCtaText || "Hablar por WhatsApp"}</span>
              </a>
            </div>

            {/* Trust Markers - High Contrast Crisp White and Amber */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#0f172a] px-3 py-1.5 rounded-lg border border-slate-700/80">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-white font-black">5.0 / 5.0</span>
                <span className="text-amber-300 font-bold">(Reseñas Reales)</span>
              </div>
              <div className="flex items-center gap-1.5 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Atención Directa y Personal</span>
              </div>
              <span className="text-amber-400 font-bold hidden sm:inline">·</span>
              <span className="text-white font-bold">Respuesta &lt; 15 min</span>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Card (High-Contrast Obsidian & Crisp White) */}
          <div className="lg:col-span-5">
            <div className="bg-[#090f1d] border-2 border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
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
                    <h3 className="font-editorial text-2xl text-white font-bold">Alonso Ríos</h3>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    Especialista Sénior Full-Stack & Creador
                  </p>
                  <p className="text-xs text-white font-bold mt-0.5">
                    Caracas, Venezuela · Proyectos Internacionales
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-700/80">
                  <span className="text-[11px] font-mono text-amber-300 font-bold uppercase block">
                    Proyectos
                  </span>
                  <span className="text-3xl font-mono font-black text-white">+100</span>
                  <span className="text-xs text-amber-400 font-bold block mt-0.5">100% Entregados</span>
                </div>

                <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-700/80">
                  <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase block">
                    Satisfacción
                  </span>
                  <span className="text-3xl font-mono font-black text-white">99.4%</span>
                  <span className="text-xs text-emerald-400 font-bold block mt-0.5">Soporte Continuo</span>
                </div>
              </div>

              {/* Stack Telemetry Progress Bars */}
              <div className="space-y-3 bg-[#0f172a] p-4 rounded-2xl border border-slate-700/80">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-white block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Especialidad & Rendimiento
                </span>

                <div>
                  <div className="flex justify-between text-xs font-mono text-white font-bold mb-1">
                    <span>Sitios Web & Next.js (Core Web Vitals)</span>
                    <span className="text-emerald-400 font-black">100/100</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[98%] rounded-full shadow-[0_0_8px_#67dba9]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-white font-bold mb-1">
                    <span>Apps Android Nativas (Kotlin)</span>
                    <span className="text-amber-300 font-black">Alta Gama</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 w-[94%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-white font-bold mb-1">
                    <span>Recuperación de Sitios & Seguridad</span>
                    <span className="text-blue-400 font-black">Rescate 24h</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[96%] rounded-full" />
                  </div>
                </div>

                {/* Real-time Latency Ticker */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-white flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    TTFB &lt; 0.18s
                  </span>
                  <span className="text-emerald-400">100% Uptime Garantizado</span>
                </div>
              </div>

              {/* Direct Quick WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
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
