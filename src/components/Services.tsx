"use client";

import React from "react";
import { Globe, RefreshCw, Smartphone, CheckCircle, ArrowRight } from "lucide-react";

export const Services: React.FC = () => {
  const services = [
    {
      icon: <Globe className="w-7 h-7 text-amber-400" />,
      badge: "Páginas Web",
      priceTag: "Desde $760 USD (40 hrs x $19/h)",
      title: "Creación y Diseño de Sitios Web",
      description: "Sitios profesionales, ultrarrápidos y fáciles de usar en cualquier teléfono o computador.",
      benefits: ["Adaptado a celulares", "Botón directo de WhatsApp", "Sin costos ocultos"],
    },
    {
      icon: <RefreshCw className="w-7 h-7 text-rose-400" />,
      badge: "Urgencias",
      priceTag: "Desde $190 USD (10 hrs x $19/h)",
      title: "Recuperación de Sitios Web",
      description: "Si tu página se cayó, fue infectada con virus o tiene errores de servidor, la recupero de inmediato.",
      benefits: ["Desinfección de malware", "Restauración de copias", "Protección anti-hackeo"],
    },
    {
      icon: <Smartphone className="w-7 h-7 text-indigo-400" />,
      badge: "Android Apps",
      priceTag: "Desde $1,140 USD (60 hrs x $19/h)",
      title: "Aplicaciones Móviles Android",
      description: "Desarrollo de aplicaciones nativas para el sistema Android con publicación en Google Play Store.",
      benefits: ["Publicación en Play Store", "Uso fluido y fácil", "Soporte personalizado"],
    },
  ];

  return (
    <section id="servicios" className="py-12 md:py-20 bg-[#070d19] text-white border-y border-[#1e2a42]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Servicios Principales
          </h2>
          <p className="text-sm sm:text-base text-white font-extrabold mt-2">
            Tarifa transparente de <strong className="text-amber-400 font-black">$19 USD / hora</strong>. Selecciona lo que necesitas y te entregaré una solución eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#121b2d] rounded-3xl p-7 border border-[#1e2a42] shadow-xl flex flex-col justify-between hover:border-amber-400/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#0a1120] rounded-2xl border border-[#1e2a42]">
                    {s.icon}
                  </div>
                  <span className="text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full">
                    {s.badge}
                  </span>
                </div>

                <div className="inline-block bg-[#0a1120] text-amber-400 font-black text-xs px-3 py-1 rounded-xl border border-[#1e2a42] mb-3">
                  {s.priceTag}
                </div>

                <h3 className="text-xl font-black text-white mb-2 leading-snug">{s.title}</h3>
                <p className="text-sm text-white font-extrabold mb-6 leading-relaxed">{s.description}</p>

                <div className="space-y-2.5 mb-6 pt-4 border-t border-[#1e2a42]">
                  {s.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-white font-black">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#contacto"
                className="w-full bg-[#1e2a42] hover:bg-amber-400 hover:text-[#0a1120] text-white font-black py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>Consultar por este servicio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
