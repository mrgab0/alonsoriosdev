"use client";

import React from "react";
import { Globe, RefreshCw, Smartphone, CheckCircle, ArrowRight, Sparkles, TrendingUp, ShieldAlert } from "lucide-react";

export const Services: React.FC = () => {
  const services = [
    {
      icon: <Globe className="w-6 h-6 text-amber-400" />,
      badge: "Más Solicitado",
      badgeColor: "bg-amber-400/15 border-amber-400/30 text-amber-400",
      priceTag: "Desde $760 USD (40 hrs x $19/h)",
      timeframe: "Entrega: 2 a 3 semanas",
      title: "Desarrollo y Creación de Sitios Web",
      description:
        "Sitios corporativos, landing pages de alta conversión y tiendas online ultrarrápidas. Cero plantillas genéricas pesadas.",
      benefits: [
        "100/100 en Google PageSpeed y Web Vitals",
        "Diseño adaptativo para celulares y escritorio",
        "Integración de pagos (Stripe, Pago Móvil, Binance)",
        "Panel de administración autónomo para editar contenido",
      ],
      whatsappMsg: "Hola Alonso, me interesa cotizar la creación de un Sitio Web profesional",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      badge: "Impacto Alto",
      badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      priceTag: "Desde $190 USD (10 hrs x $19/h)",
      timeframe: "Entrega: 3 a 5 días",
      title: "SEO Técnico & Recuperación de Páginas",
      description:
        "Posicionamiento en primeras posiciones de Google sin gastar en anuncios y solución urgente a páginas infectadas o caídas.",
      benefits: [
        "Auditoría técnica de indexación y sitemaps",
        "Limpieza de malware y blindaje anti-hackeo",
        "Optimización de velocidad y primer byte (TTFB)",
        "Estrategia de palabras clave con intención de compra",
      ],
      whatsappMsg: "Hola Alonso, necesito optimizar el SEO o reparar mi sitio web",
    },
    {
      icon: <Smartphone className="w-6 h-6 text-orange-400" />,
      badge: "Alta Gama",
      badgeColor: "bg-orange-500/15 border-orange-500/30 text-orange-400",
      priceTag: "Desde $1,140 USD (60 hrs x $19/h)",
      timeframe: "Entrega: 4 a 6 semanas",
      title: "Aplicaciones Móviles Android Nativas",
      description:
        "Desarrollo en Kotlin moderno con arquitectura limpia, sincronización en tiempo real y publicación oficial en Google Play Store.",
      benefits: [
        "Publicación completa en Google Play Store",
        "Rendimiento nativo fluido a 60 FPS",
        "Notificaciones Push y consumo offline",
        "Soporte post-lanzamiento directo y código fuente",
      ],
      whatsappMsg: "Hola Alonso, tengo en mente un proyecto de Aplicación Móvil Android",
    },
  ];

  return (
    <section id="servicios" className="py-16 md:py-24 bg-[#070d19] text-white border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f172a] border border-slate-800 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarifas Claras y Resultados Reales</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-white font-bold tracking-tight mb-4">
            Servicios Principales
          </h2>

          <p className="text-white text-base sm:text-lg font-semibold leading-relaxed">
            Tarifa fija y transparente de <strong className="text-amber-400 font-mono font-black">$19 USD / hora</strong>.
            Cada proyecto incluye garantía directa, soporte de rectificación y acompañamiento permanente post-lanzamiento.
          </p>
        </div>

        {/* 3 Main Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#090f1d] rounded-3xl p-7 sm:p-8 border border-slate-700/80 hover:border-amber-400/70 transition-all duration-300 shadow-2xl flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-[#0f172a] rounded-2xl border border-slate-700/80 group-hover:border-amber-400/40 transition">
                    {s.icon}
                  </div>
                  <span className={`text-[11px] font-mono font-black border px-3 py-1 rounded-full uppercase tracking-wider ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                {/* Price & Timeframe */}
                <div className="flex flex-col gap-1 mb-4">
                  <div className="text-base font-mono font-black text-amber-300">
                    {s.priceTag}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {s.timeframe}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="font-editorial text-2xl text-white font-bold mb-3 leading-snug group-hover:text-amber-400 transition">
                  {s.title}
                </h3>
                <p className="text-sm text-white font-semibold mb-6 leading-relaxed">
                  {s.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8 pt-4 border-t border-slate-800">
                  {s.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <a
                href={`https://wa.me/584129912840?text=${encodeURIComponent(s.whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0f172a] hover:bg-amber-400 hover:text-slate-950 text-white font-black py-4 px-4 rounded-xl border border-slate-700/80 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg group-hover:shadow-amber-400/20 cursor-pointer"
              >
                <span>Cotizar este servicio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
