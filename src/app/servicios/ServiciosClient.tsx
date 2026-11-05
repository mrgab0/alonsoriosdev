"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calculator,
  Clock,
  DollarSign,
  HelpCircle,
  ChevronDown,
  Layers,
  Zap,
  Code2,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";

interface ProjectType {
  id: string;
  name: string;
  baseHours: number;
  description: string;
  badge: string;
  icon: React.ReactNode;
  defaultFeatures: string[];
}

interface Addon {
  id: string;
  name: string;
  hours: number;
  category: "feature" | "optimization" | "support";
  description: string;
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: "web",
    name: "Sitio Web / Tienda / Landing Page",
    baseHours: 40,
    badge: "Más Solicitado",
    icon: <Globe className="w-5 h-5 text-amber-400" />,
    description: "Desarrollo completo en Next.js, diseño a medida, ultra rápido y adaptado a móviles.",
    defaultFeatures: [
      "100/100 en Google PageSpeed",
      "Diseño adaptable y responsivo",
      "Formularios de contacto y analítica",
      "Optimización SEO inicial",
    ],
  },
  {
    id: "android",
    name: "Aplicación Móvil Android Nativa",
    baseHours: 60,
    badge: "Alta Gama",
    icon: <Smartphone className="w-5 h-5 text-orange-400" />,
    description: "Aplicación nativa en Kotlin con arquitectura limpia, alto rendimiento y publicación.",
    defaultFeatures: [
      "Desarrollo nativo en Kotlin",
      "Funcionamiento offline y almacenamiento local",
      "Diseño con Material You fluido",
      "Publicación guiada en Google Play Store",
    ],
  },
  {
    id: "seo_repair",
    name: "SEO Técnico & Recuperación Web",
    baseHours: 10,
    badge: "Urgencias / Rápido",
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    description: "Auditoría exhaustiva, indexación en Google, limpieza de malware y aceleración TTFB.",
    defaultFeatures: [
      "Auditoría técnica y corrección de sitemaps",
      "Eliminación de scripts maliciosos",
      "Optimización de tiempo de primer byte",
      "Estrategia de posicionamiento orgánico",
    ],
  },
  {
    id: "custom",
    name: "Desarrollo por Horas / A Medida",
    baseHours: 20,
    badge: "Flexible",
    icon: <Code2 className="w-5 h-5 text-cyan-400" />,
    description: "Bolsa de horas para refactorización, nuevas funcionalidades o auditoría técnica.",
    defaultFeatures: [
      "Reporte diario de avances y commits",
      "Acceso directo a repositorio GitHub",
      "Comunicación continua en tiempo real",
      "Garantía de calidad de código",
    ],
  },
];

const AVAILABLE_ADDONS: Addon[] = [
  {
    id: "payments",
    name: "Pasarela de Pagos (Stripe / Pago Móvil / Binance)",
    hours: 10,
    category: "feature",
    description: "Cobros automatizados en dólares, bolívares o criptomonedas con verificación.",
  },
  {
    id: "admin_cms",
    name: "Panel Administrativo Autónomo (CMS)",
    hours: 15,
    category: "feature",
    description: "Panel privado para crear, editar o eliminar productos, posts y contenidos.",
  },
  {
    id: "ai_chatbot",
    name: "Chatbot IA de Atención 24/7",
    hours: 12,
    category: "feature",
    description: "Asistente inteligente entrenado con el catálogo de tu negocio para responder dudas.",
  },
  {
    id: "core_vitals",
    name: "Optimización Extrema Core Web Vitals 100/100",
    hours: 8,
    category: "optimization",
    description: "Compresión de recursos, precarga y arquitectura para carga instantánea (<0.2s).",
  },
  {
    id: "playstore",
    name: "Publicación & Aprobación en Google Play Console",
    hours: 10,
    category: "feature",
    description: "Preparación de firmas, assets gráficos, políticas de privacidad y gestión de revisión.",
  },
  {
    id: "support_month",
    name: "Mes Extra de Soporte y Mantenimiento Proactivo",
    hours: 8,
    category: "support",
    description: "Monitoreo de uptime, backups periódicos y resolución de incidencias prioritarias.",
  },
];

const FAQS = [
  {
    q: "¿Por qué cobras una tarifa de $19 USD por hora?",
    a: "La tarifa de $19 USD/h representa un balance justo entre ingeniería de software sénior y accesibilidad para emprendedores y negocios. Evito agencias intermediarias: hablas y trabajas directamente con el ingeniero que escribe cada línea de código.",
  },
  {
    q: "¿Cómo se gestionan los pagos?",
    a: "Normalmente trabajamos bajo un esquema de 50% de anticipo para iniciar el sprint de desarrollo y 50% contra entrega y verificación final de satisfacción. Aceptamos Pago Móvil (a tasa BCV), transferencias bancarias, Zelle y Binance USDT.",
  },
  {
    q: "¿Qué sucede si el proyecto toma más tiempo del estimado?",
    a: "El presupuesto inicial actúa como un techo pactado. Si una demora se debe a imprevistos técnicos atribuibles al desarrollo, yo asumo las horas adicionales sin costo extra para ti.",
  },
  {
    q: "¿Quién es dueño del código fuente?",
    a: "Tú eres 100% dueño del código y de todos los activos generados. Al completar el proyecto, se te transfiere el repositorio oficial de GitHub con su documentación técnica completa.",
  },
  {
    q: "¿Ofreces garantía post-lanzamiento?",
    a: "Sí. Todos los proyectos incluyen 30 días de garantía de rectificación y soporte sin costo adicional para resolver cualquier error o desajuste que pudiera surgir tras el lanzamiento.",
  },
];

export default function ServiciosClient() {
  const [selectedType, setSelectedType] = useState<string>("web");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["payments"]);
  const [coupon, setCoupon] = useState<string>("ALONSO10");
  const [couponApplied, setCouponApplied] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const HOURLY_RATE = 19;

  const currentType = useMemo(
    () => PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[0],
    [selectedType]
  );

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "ALONSO10") {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
    }
  };

  // Calculations
  const addonsHours = useMemo(() => {
    return selectedAddons.reduce((sum, id) => {
      const addon = AVAILABLE_ADDONS.find((a) => a.id === id);
      return sum + (addon ? addon.hours : 0);
    }, 0);
  }, [selectedAddons]);

  const totalHours = currentType.baseHours + addonsHours;
  const subtotal = totalHours * HOURLY_RATE;
  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal - discountAmount;

  // Delivery timeframe estimate
  const deliveryTimeframe = useMemo(() => {
    if (totalHours <= 15) return "3 a 5 días hábiles";
    if (totalHours <= 45) return "2 a 3 semanas";
    if (totalHours <= 75) return "3 a 4 semanas";
    return "4 a 6 semanas";
  }, [totalHours]);

  // WhatsApp prefilled message
  const whatsappUrl = useMemo(() => {
    const addonNames = selectedAddons
      .map((id) => AVAILABLE_ADDONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const text =
      `Hola Alonso! He configurado una cotización en tu sitio web:\n\n` +
      `📌 Proyecto: ${currentType.name}\n` +
      `⏱️ Horas estimadas: ${totalHours} hrs\n` +
      `📦 Módulos: ${addonNames || "Configuración base"}\n` +
      `💰 Inversión aproximada: $${finalTotal} USD (Tarifa $19/h${
        couponApplied ? " con 10% OFF" : ""
      })\n` +
      `📅 Tiempo estimado: ${deliveryTimeframe}\n\n` +
      `¿Podemos coordinar para revisar requerimientos e iniciar?`;

    return `https://wa.me/584129912840?text=${encodeURIComponent(text)}`;
  }, [currentType, totalHours, selectedAddons, finalTotal, couponApplied, deliveryTimeframe]);

  return (
    <div className="min-h-screen bg-[#070d19] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparencia Radical · Tarifa Fija $19 USD/h</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Cotizador y Tarifas de Servicios
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
            Calcula el costo y tiempo de desarrollo en tiempo real sin sorpresas. Sin costos ocultos,
            sin intermediarios y con código 100% de tu propiedad.
          </p>
        </div>

        {/* Interactive Estimator Tool */}
        <div className="bg-[#0b1325] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Calculadora Interactiva de Presupuesto
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                Paso a paso: Selecciona tu tipo de proyecto y módulos adicionales
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* Left Column: Selection Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Project Type */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Paso 1 · Selecciona el tipo de proyecto
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECT_TYPES.map((type) => {
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-400/10 border-amber-400 shadow-lg shadow-amber-400/10"
                            : "bg-[#080f1d] border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2 bg-slate-900 rounded-lg">{type.icon}</div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {type.badge}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{type.name}</h4>
                          <p className="text-xs text-slate-400 leading-snug">
                            {type.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">{type.baseHours} hrs estimadas</span>
                          <span className="font-bold text-amber-300">
                            ${type.baseHours * HOURLY_RATE} USD
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Add-on Modules */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Paso 2 · Módulos y funcionalidades complementarias (Opcional)
                </span>

                <div className="space-y-2.5">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isChecked
                            ? "bg-slate-800/70 border-emerald-500/50"
                            : "bg-[#080f1d] border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by parent div
                            className="mt-1 w-4 h-4 rounded text-amber-400 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <h5 className="text-sm font-bold text-white leading-snug">
                              {addon.name}
                            </h5>
                            <p className="text-xs text-slate-400 leading-tight">
                              {addon.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-xs">
                          <span className="block font-bold text-emerald-400">
                            +${addon.hours * HOURLY_RATE} USD
                          </span>
                          <span className="text-[11px] text-slate-500">+{addon.hours} hrs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon input */}
              <div className="bg-[#080f1d] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    ¿Tienes un cupón de descuento?
                  </span>
                  <span className="text-xs text-slate-400">
                    Aplica <strong className="text-amber-400">ALONSO10</strong> para 10% de descuento de bienvenida.
                  </span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="ALONSO10"
                    className="w-28 bg-[#0c1527] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 uppercase focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Aplicar
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Live Summary & Quote Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-gradient-to-b from-[#0c172e] to-[#080f1e] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Resumen de Estimación
                    </span>
                    <span className="text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      Tarifa $19/h
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{currentType.name}</h3>
                </div>

                {/* Breakdown list */}
                <div className="space-y-3 text-xs sm:text-sm border-y border-slate-800 py-4 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Horas base del proyecto:</span>
                    <span className="font-bold text-white">{currentType.baseHours} hrs</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Horas módulos opcionales ({selectedAddons.length}):</span>
                    <span className="font-bold text-white">+{addonsHours} hrs</span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/60 font-sans">
                    <span className="font-bold">Total horas de ingeniería:</span>
                    <span className="font-mono font-bold text-amber-400">{totalHours} horas</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal ($19 x {totalHours}h):</span>
                    <span className="font-bold text-white">${subtotal} USD</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Descuento de Bienvenida (10%):</span>
                      <span>-${discountAmount} USD</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800/60 font-sans">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Plazo de entrega estimado:</span>
                    </span>
                    <span className="font-bold text-slate-200 text-xs font-mono">
                      {deliveryTimeframe}
                    </span>
                  </div>
                </div>

                {/* Big Total Price */}
                <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Presupuesto Total Estimado
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 mt-1">
                    ${finalTotal} <span className="text-base text-slate-400 font-sans">USD</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    Pago en 2 partes (50% inicio / 50% entrega)
                  </span>
                </div>

                {/* Primary WhatsApp Action */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-5 rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider cursor-pointer font-sans"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Cotización a WhatsApp</span>
                </a>

                {/* Secondary Direct Form Link */}
                <div className="text-center">
                  <Link
                    href="/#contacto"
                    className="text-xs text-slate-400 hover:text-amber-400 underline font-mono transition"
                  >
                    O prefiere enviar un formulario de contacto tradicional
                  </Link>
                </div>

                {/* Included badges */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Código 100% tuyo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>30 días de garantía</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sin costes ocultos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Factura / Recibo formal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology: How We Work */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Flujo de Trabajo de Ingeniería
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Proceso estructurado en 5 etapas para garantizar que el proyecto se entregue a tiempo
              y sin fricciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Diagnóstico",
                desc: "Alineación de objetivos de negocio, alcance funcional y requerimientos técnicos.",
              },
              {
                step: "02",
                title: "Arquitectura",
                desc: "Definición de modelos de base de datos, wireframes y stack tecnológico óptimo.",
              },
              {
                step: "03",
                title: "Desarrollo Ágil",
                desc: "Construcción por sprints con acceso al repositorio GitHub y reportes de progreso.",
              },
              {
                step: "04",
                title: "Validación & QA",
                desc: "Pruebas de rendimiento 100/100, seguridad, responsive y verificación visual.",
              },
              {
                step: "05",
                title: "Entrega & Garantía",
                desc: "Puesta en producción oficial, transferencia de credenciales y 30 días de soporte.",
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className="bg-[#0b1325] border border-slate-800 rounded-2xl p-5 space-y-2 relative group hover:border-amber-400/50 transition"
              >
                <span className="font-mono text-2xl font-black text-amber-400/30 group-hover:text-amber-400 transition">
                  {st.step}
                </span>
                <h4 className="font-bold text-white text-base">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Preguntas Frecuentes sobre Tarifas y Contratación
            </h2>
            <p className="text-slate-400 text-sm">
              Respuestas directas sin tecnicismos ambiguos.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0b1325] border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-300 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Direct CTA */}
        <div className="bg-gradient-to-r from-[#0c172e] via-[#0f1d38] to-[#0c172e] border border-amber-400/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            ¿Tienes un requerimiento especial o necesitas asesoría técnica?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Escríbeme directamente. Analizo tu idea o proyecto en menos de 24 horas y te entrego una
            propuesta técnica detallada sin ningún compromiso.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20asesoría%20para%20un%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chatear por WhatsApp Directo</span>
            </a>

            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition"
            >
              <span>Completar Formulario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
