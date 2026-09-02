"use client";

import React, { useState } from "react";
import { BookOpen, Video, CheckCircle, ExternalLink, Sparkles, X, Eye } from "lucide-react";

interface ResourceItem {
  id: string;
  type: "book" | "course";
  title: string;
  subtitle: string;
  description: string;
  price: string;
  badge: string;
  features: string[];
  sampleChapterText: string;
}

export const BooksAndCourses: React.FC = () => {
  const [activePreview, setActivePreview] = useState<ResourceItem | null>(null);

  const resources: ResourceItem[] = [
    {
      id: "book-web",
      type: "book",
      title: "Páginas Web Sin Dolor de Cabeza",
      subtitle: "Guía práctica para entender y crear tu propio sitio en internet",
      description:
        "Un libro digital diseñado especialmente para principiantes y emprendedores. Explica paso a paso cómo funciona un sitio web, qué necesitas para empezar y cómo evitar estafas o gastos innecesarios.",
      price: "$14.99 USD",
      badge: "Libro Digital (PDF)",
      features: [
        "120 páginas en lenguaje claro y accesible",
        "Glosario de términos explicados sin tecnicismos",
        "Checklist para contratar o diseñar tu sitio",
        "Incluye plantillas y ejemplos descargables",
      ],
      sampleChapterText: `CAPÍTULO 1: ¿Qué es realmente una página web?

Imagina que internet es una gran ciudad comercial. 

Tu sitio web es el local donde atiendes a tus clientes. 
- El "Dominio" (ejemplo: tunegocio.com) es la dirección física de la calle que le das a las personas para que te encuentren.
- El "Hosting" o Alojamiento es el terreno alquilado donde está construido tu edificio. Si el terreno es deficiente, la tienda se cae cuando entran muchos clientes a la vez.

En este libro aprenderás a elegir la mejor dirección y el mejor terreno sin pagar de más...`,
    },
    {
      id: "course-android",
      type: "course",
      title: "Curso: Crea tu Primera App Android en 7 Días",
      subtitle: "Paso a paso desde cero, sin necesidad de experiencia previa",
      description:
        "Un curso en video con lecciones cortas de 10 a 15 minutos. Aprende a construir una aplicación real para teléfonos Android y publicarla en Google Play Store.",
      price: "$29.99 USD",
      badge: "Curso en Video HD",
      features: [
        "25 Lecciones en video con explicaciones pausadas",
        "Ejercicios prácticos con acompañamiento por WhatsApp",
        "Acceso de por vida a las actualizaciones",
        "Certificado de finalización firmado por Alonso Ríos",
      ],
      sampleChapterText: `LECCIÓN DE MUESTRA: Estructura de una Aplicación Móvil

En esta clase de introducción aprenderemos los 3 componentes básicos que componen cualquier aplicación Android:
1. La Pantalla (Lo que el usuario ve y toca: botones, fotos, textos).
2. La Lógica (Lo que sucede cuando el usuario presiona un botón).
3. El Almacenamiento (Donde se guardan los datos como nombres, fotos o compras).

No te preocupes por el código complejo: en la lección 2 usaremos componentes visuales muy sencillos...`,
    },
    {
      id: "book-seo",
      type: "book",
      title: "Manual Práctico de SEO & Reputación Digital",
      subtitle: "Aparece en Google y protege la imagen de tu negocio",
      description:
        "Una guía imprescindible para dueños de negocios y creadores que buscan ser encontrados por clientes potenciales y mantener una reputación intachable en internet.",
      price: "$19.99 USD",
      badge: "Manual Digital",
      features: [
        "Cómo aparecer en el mapa de Google de tu ciudad",
        "Estrategias para conseguir opiniones positivas reales",
        "Qué hacer si recibes reseñas falsas o malintencionadas",
        "Guía de SEO para personas no técnicas",
      ],
      sampleChapterText: `CAPÍTULO 3: El Poder de Google Maps para Negocios Locales

El 80% de los clientes mayores de 35 años busca negocios cercanos en sus celulares antes de llamar o ir en persona.

Si tu ficha de Google no tiene teléfono claro, horario actualizado y opiniones reales, estás regalando tus clientes a la competencia.

Paso 1: Reclamar tu perfil oficial en Google...`,
    },
  ];

  return (
    <section id="libros-cursos" className="py-12 md:py-20 bg-[#0a1120] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-3 mb-12">
          <div className="inline-flex items-center gap-2 justify-center bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3.5 py-1 rounded-full text-xs font-bold w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aprende Conmigo • Contenido Educativo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mis Libros y Cursos de Aprendizaje
          </h2>
          <p className="text-base text-slate-300">
            Material educativo pensado para enseñar tecnología de forma amigable, paso a paso y sin tecnicismos innecesarios.
          </p>
        </div>

        {/* Resource Cards (Matches esquema.png layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((r) => (
            <div
              key={r.id}
              className="bg-[#121b2d] rounded-3xl p-7 border border-[#1e2a42] shadow-2xl flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 group"
            >
              <div>
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#0a1120] rounded-2xl text-amber-400 border border-[#1e2a42]">
                    {r.type === "book" ? <BookOpen className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                  </div>
                  <span className="text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full">
                    {r.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-2xl font-bold text-white mb-2 leading-snug group-hover:text-amber-400 transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs font-medium text-slate-300 mb-4">{r.subtitle}</p>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{r.description}</p>

                {/* Bullet checklist */}
                <div className="space-y-3 mb-8 pt-4 border-t border-[#1e2a42]">
                  {r.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Price & Buttons */}
              <div className="pt-4 border-t border-[#1e2a42]">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-slate-400">Precio Especial:</span>
                  <span className="text-2xl font-extrabold text-amber-400">{r.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActivePreview(r)}
                    className="bg-[#1e2a42] hover:bg-[#28395a] text-white font-bold py-3 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 border border-slate-700/60"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Ver Muestra</span>
                  </button>

                  <a
                    href={`https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20adquirir%20el%20material:%20${encodeURIComponent(r.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] font-black py-3 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Adquirir</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Sample Preview */}
        {activePreview && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#121b2d] border border-[#1e2a42] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative text-white shadow-2xl">
              <button
                onClick={() => setActivePreview(null)}
                className="absolute top-4 right-4 bg-[#1e2a42] hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-wider">Vista Previa Gratuita</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{activePreview.title}</h3>
              <p className="text-xs text-slate-400 mb-6">{activePreview.subtitle}</p>

              <div className="bg-[#0a1120] p-5 rounded-2xl border border-[#1e2a42] font-mono text-sm whitespace-pre-wrap text-slate-300 leading-relaxed mb-6">
                {activePreview.sampleChapterText}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e2a42]">
                <div className="text-xs text-slate-400">
                  ¿Te gusta la metodología de enseñanza?
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActivePreview(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
                  >
                    Cerrar
                  </button>
                  <a
                    href={`https://wa.me/584129912840?text=Hola%20Alonso,%20leí%20la%20muestra%20de%20${encodeURIComponent(activePreview.title)}%20y%20quiero%20obtenerlo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <span>Obtener Material Completo</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
