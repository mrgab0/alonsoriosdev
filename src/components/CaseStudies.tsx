"use client";

import React, { useState } from "react";
import { CheckCircle2, TrendingUp, ShieldAlert, Award, ArrowUpRight, Clock, Star } from "lucide-react";

interface CaseStudyItem {
  id: string;
  category: string;
  categoryColor: string;
  client: string;
  title: string;
  problem: string;
  solution: string;
  results: { label: string; value: string }[];
  quote: string;
  quoteAuthor: string;
}

export const CaseStudies: React.FC = () => {
  const cases: CaseStudyItem[] = [
    {
      id: "case-1",
      category: "Recuperación Web de Urgencia",
      categoryColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
      client: "Distribuidora San Martín",
      title: "Sitio web hackeado con virus y bloqueado por Google en menos de 24 hrs",
      problem:
        "La empresa fue víctima de malware. Su proveedor anterior no daba respuesta y Google marcaba su sitio como peligroso, perdiendo ventas diarias.",
      solution:
        "Realicé una desinfección profunda del servidor, eliminé archivos maliciosos, solicité el desbloqueo urgente ante Google y restauré la velocidad original.",
      results: [
        { label: "Tiempo de Respuesta", value: "18 Horas" },
        { label: "Archivos Recuperados", value: "100%" },
        { label: "Estatus Google", value: "Sitio Seguro 🟢" },
      ],
      quote: "Pensábamos que habíamos perdido toda la información. Alonso actuó de inmediato y en menos de un día nuestro sitio estaba limpio y vendiendo de nuevo.",
      quoteAuthor: "Roberto San Martín • Gerente General",
    },
    {
      id: "case-2",
      category: "Diseño Web + SEO Local",
      categoryColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      client: "Consultorio Odontológico Dra. Silva",
      title: "De no aparecer en internet a ser el #1 en Google en su ciudad",
      problem:
        "Tenían una página web antigua que tardaba más de 8 segundos en cargar en teléfonos. Nadie los contactaba a través de la web.",
      solution:
        "Rediseñé su sitio web desde cero con tipografía de alta legibilidad, botones directos de WhatsApp para citas y optimización SEO local.",
      results: [
        { label: "Crecimiento Visitas", value: "+340%" },
        { label: "Velocidad de Carga", value: "0.7 seg" },
        { label: "Nuevas Citas por Mes", value: "+45 Pacientes" },
      ],
      quote: "Ahora mis pacientes mayores agendan su hora desde su celular sin pedir ayuda a sus hijos. La página es extremadamente fácil de usar.",
      quoteAuthor: "Dra. Carolina Silva • Directora Médica",
    },
    {
      id: "case-3",
      category: "App Android Nativa",
      categoryColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
      client: "Plataforma Educativa de Aprendizaje",
      title: "Aplicación Android para estudiantes de tecnología con +15,000 usuarios",
      problem:
        "Los estudiantes necesitaban acceder a sus cursos y libros sin consumir muchos datos móviles ni requerir dispositivos de alta gama.",
      solution:
        "Desarrollé una app Android ultraligera (<12MB) optimizada para funcionar fluido incluso en teléfonos sencillos.",
      results: [
        { label: "Descargas Totales", value: "+15,000" },
        { label: "Valoración Play Store", value: "4.9 ★" },
        { label: "Consumo de Datos", value: "-60% Menor" },
      ],
      quote: "Alonso no solo desarrolló la aplicación, sino que diseñó una interfaz donde cualquier persona entiende dónde hacer clic sin leer manuales.",
      quoteAuthor: "Matías Loyola • Fundador Educativo",
    },
  ];

  return (
    <section id="casos" className="py-16 md:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-14">
          <div className="inline-flex items-center gap-2 justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-bold w-fit mx-auto">
            <Award className="w-4 h-4" />
            <span>Casos de Éxito & Demostraciones</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Resultados Reales en Clientes Reales
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
            Mira cómo he resuelto problemas críticos de tecnología y ayudado a hacer crecer negocios en internet.
          </p>
        </div>

        {/* Case Studies Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-slate-50 dark:bg-slate-800/80 rounded-3xl p-7 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                {/* Category & Client */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${c.categoryColor}`}>
                    {c.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {c.client}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                  {c.title}
                </h3>

                {/* Problem & Solution Box */}
                <div className="space-y-3 mb-6">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 block mb-1">
                      ⚠️ El Desafío:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{c.problem}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">
                      ✅ La Solución:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{c.solution}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-200 dark:border-slate-700 mb-6 text-center">
                  {c.results.map((r, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
                        {r.value}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                        {r.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial Quote */}
                <div className="bg-blue-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-blue-100 dark:border-slate-800 text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 relative">
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  "{c.quote}"
                  <span className="block not-italic font-bold text-slate-900 dark:text-white mt-2 text-right text-xs">
                    — {c.quoteAuthor}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#contacto"
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Quiero resultados parecidos para mi proyecto</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
