"use client";

import React from "react";
import { MessageCircle, ArrowRight, ShieldCheck, Star, Award, Code2, Smartphone, Search, BookOpen } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export const Hero: React.FC = () => {
  const { config } = useConfig();
  const heroData = config?.sections?.hero || {};

  const whatsappNum = config?.sections?.contact?.whatsappNumber?.replace(/\+/g, "") || "584129912840";
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=Hola%20Alonso,%20necesito%20ayuda%20con%20un%20proyecto`;

  return (
    <section id="inicio" className="relative pt-10 pb-16 md:pt-16 md:pb-24 bg-[#0a1120] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Content & Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-full text-sm font-extrabold w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 status-pulse" />
              <span>{heroData.statusBadge || "Disponible para Sitios Web, Apps Android y Cursos"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {heroData.title || "Páginas Web, Apps Android y SEO"}{" "}
              <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-8">
                {heroData.titleHighlight || "sin complicaciones"}
              </span>
            </h1>

            {/* Clear Subtitle - BOLD WHITE */}
            <p className="text-lg sm:text-xl text-white font-extrabold leading-relaxed">
              {heroData.subtitle || (
                <>
                  Hola, soy <strong className="text-amber-400 font-black">Alonso Ríos</strong>. Ayudo a personas y negocios a crear sitios web profesionales, recuperar páginas caídas o con fallas, desarrollar aplicaciones Android y aprender programación de forma sencilla.
                </>
              )}
            </p>

            {/* Key Feature Pillars - BOLD WHITE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="bg-[#121b2d] p-3 rounded-xl border border-[#1e2a42] flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-white">Sitios Web</span>
              </div>
              <div className="bg-[#121b2d] p-3 rounded-xl border border-[#1e2a42] flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-white">Apps Android</span>
              </div>
              <div className="bg-[#121b2d] p-3 rounded-xl border border-[#1e2a42] flex items-center gap-2.5">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-white">SEO & Arreglos</span>
              </div>
              <div className="bg-[#121b2d] p-3 rounded-xl border border-[#1e2a42] flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-white">Cursos & Libros</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={heroData.primaryCtaUrl || "#servicios"}
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] text-base font-black px-7 py-4 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-3 text-center"
              >
                <span>{heroData.primaryCtaText || "Ver Servicios y Precios"}</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-base font-black px-7 py-4 rounded-xl shadow-md transition transform hover:scale-105 flex items-center justify-center gap-3 text-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{heroData.secondaryCtaText || "Hablar por WhatsApp"}</span>
              </a>
            </div>

            {/* Trust Markers - BOLD WHITE */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#1e2a42] text-sm text-white font-extrabold">
              <div className="flex items-center gap-1.5 font-black text-white">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>5.0 / 5.0 (Reseñas Reales)</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Atención Directa y Personal</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Profile Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#121b2d] rounded-3xl p-6 sm:p-8 border border-[#1e2a42] shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-5">
              
              {/* Profile Avatar / Photo Container */}
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-400 p-1 shadow-lg relative">
                <div className="w-full h-full bg-[#0a1120] rounded-[22px] overflow-hidden flex items-center justify-center text-white text-3xl font-black tracking-wider">
                  {heroData.avatarUrl ? (
                    <img
                      src={heroData.avatarUrl}
                      alt={heroData.profileName || "Alonso Ríos"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{heroData.avatarInitials || "AR"}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-[#0a1120] p-1.5 rounded-xl font-black shadow-md">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {heroData.profileName || "Alonso Ríos"}
                </h3>
                <p className="text-sm font-black text-amber-400 mt-1">
                  {heroData.profileRole || "Desarrollador Web, Android & Creador de Contenido"}
                </p>
                <p className="text-xs sm:text-sm text-white font-extrabold mt-2 max-w-sm">
                  {heroData.profileBio || "Resolver problemas técnicos complejos en lenguaje amigable y sin enredos."}
                </p>
              </div>

              {/* Metrics */}
              <div className="w-full grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="bg-[#0a1120] p-3.5 rounded-2xl border border-[#1e2a42]">
                  <div className="text-2xl font-black text-amber-400">+100</div>
                  <div className="text-xs font-black text-white">Proyectos Exitosos</div>
                </div>
                <div className="bg-[#0a1120] p-3.5 rounded-2xl border border-[#1e2a42]">
                  <div className="text-2xl font-black text-emerald-400">24 horas</div>
                  <div className="text-xs font-black text-white">Respuesta Rápida</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
