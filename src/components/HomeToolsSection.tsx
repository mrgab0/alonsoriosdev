"use client";

import React from "react";
import Link from "next/link";
import { QrCode, Sparkles, CreditCard, FileText, ArrowRight } from "lucide-react";

export const HomeToolsSection: React.FC = () => {
  const tools = [
    {
      title: "Creador de Códigos QR",
      badge: "Gratis",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "Genera códigos QR de alta resolución (SVG y PNG) para páginas web, WhatsApp, texto y claves WiFi.",
      icon: <QrCode className="w-5 h-5 text-emerald-400" />,
      href: "/herramientas/creador-qr-estatico",
      active: true,
    },
    {
      title: "QR Dinámico Editable",
      badge: "Destacado",
      badgeColor: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      description: "Cambia la URL de destino de tu código QR en cualquier momento sin tener que volver a imprimir.",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      href: "/herramientas/creador-qr-dinamico",
      active: true,
    },
    {
      title: "Pago Móvil QR (Comercios)",
      badge: "Venezuela",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      description: "Estandarizado con la red Suiche 7B. Genera el cartel listo para soporte de acrílico en mostradores.",
      icon: <CreditCard className="w-5 h-5 text-orange-400" />,
      href: "/herramientas/creador-qr-pago-movil",
      active: true,
    },
    {
      title: "Unir PDFs en Línea",
      badge: "Pronto",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description: "Fusiona y organiza múltiples documentos PDF directamente en tu navegador sin subir datos a servidores ajenos.",
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      href: "#",
      active: false,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#070d19] text-white border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Utilidades Gratuitas
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white font-normal">
              Herramientas de Rendimiento
            </h2>
          </div>
          <p className="text-white text-xs sm:text-sm font-bold max-w-md">
            Desarrolladas para agilizar tu flujo diario con privacidad total y código ejecutado en el cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((t, idx) => {
            const Content = (
              <div
                className={`h-full p-6 rounded-2xl bg-[#090f1d] border border-slate-700/80 flex flex-col justify-between transition-all duration-300 ${
                  t.active
                    ? "hover:border-amber-400/60 hover:-translate-y-1 hover:shadow-xl group cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#0f172a] border border-slate-800">
                      {t.icon}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${t.badgeColor}`}
                    >
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg text-white font-bold mb-2 group-hover:text-amber-400 transition">
                    {t.title}
                  </h3>

                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {t.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold">
                  <span className={t.active ? "text-amber-300 font-black" : "text-slate-300 font-bold"}>
                    {t.active ? "Abrir herramienta" : "En desarrollo"}
                  </span>
                  {t.active && (
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            );

            return t.active ? (
              <Link key={idx} href={t.href}>
                {Content}
              </Link>
            ) : (
              <div key={idx}>{Content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
