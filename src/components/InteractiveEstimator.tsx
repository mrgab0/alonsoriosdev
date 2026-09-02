"use client";

import React, { useState } from "react";
import { Calculator, CheckCircle2, ArrowRight, MessageCircle, RefreshCw, Send } from "lucide-react";

export const InteractiveEstimator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [timeline, setTimeline] = useState("");
  const [contactPref, setContactPref] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhoneOrEmail, setClientPhoneOrEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const serviceOptions = [
    { label: "🌐 Tener una nueva Página Web", val: "Página Web Nueva" },
    { label: "🚑 Arreglar o Recuperar mi Sitio Caído", val: "Recuperación Web" },
    { label: "📱 Desarrollar una App Android", val: "App Android" },
    { label: "📈 Aparecer en Google (SEO)", val: "SEO Google" },
    { label: "🎓 Comprar Libros o Cursos", val: "Libros / Cursos" },
  ];

  const timelineOptions = [
    { label: "⚡ Lo antes posible (Urgente 24-48h)", val: "Urgente" },
    { label: "🗓️ En las próximas 1 a 2 semanas", val: "1-2 semanas" },
    { label: "⏳ Sin apuro, estoy planificando", val: "Sin apuro" },
  ];

  const handleReset = () => {
    setStep(1);
    setService("");
    setTimeline("");
    setContactPref("");
    setSubmitted(false);
  };

  const getWhatsappUrl = () => {
    const text = `Hola Alonso, completé el cotizador rápido:\n- Servicio: ${service}\n- Plazo: ${timeline}\n- Nombre: ${clientName}\n- Contacto: ${clientPhoneOrEmail}`;
    return `https://wa.me/584129912840?text=${encodeURIComponent(text)}`;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName || "Cliente Cotizador",
          email: clientPhoneOrEmail.includes("@") ? clientPhoneOrEmail : "contacto@cliente.com",
          phone: !clientPhoneOrEmail.includes("@") ? clientPhoneOrEmail : "",
          serviceType: service,
          message: `Cotización solicitada para ${service} (Plazo: ${timeline}, Preferencia: ${contactPref})`,
        }),
      });
    } catch {
      // Graceful fallback
    }
    setSubmitted(true);
  };

  return (
    <section id="cotizador" className="py-16 md:py-24 bg-[#080e1e] text-white border-y border-[#1e2a42]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <Calculator className="w-4 h-4" />
            <span>Herramienta Interactiva Fácil</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Cotizador Rápido en 3 Pasos
          </h2>
          <p className="text-sm sm:text-base text-white font-extrabold mt-2">
            Responde 3 preguntas sencillas y obtén una orientación de presupuesto al instante sin compromiso.
          </p>
        </div>

        {/* Wizard Container Card */}
        <div className="bg-[#121b2d] rounded-3xl p-6 sm:p-10 border border-[#1e2a42] shadow-xl relative overflow-hidden text-white">
          
          {/* Progress Bar */}
          <div className="w-full bg-[#0a1120] h-3 rounded-full mb-8 overflow-hidden border border-[#1e2a42]">
            <div
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {!submitted ? (
            <>
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Paso 1: ¿Qué servicio necesitas?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceOptions.map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setService(opt.val);
                          setStep(2);
                        }}
                        className={`p-4 rounded-2xl border text-left font-black text-sm transition flex items-center justify-between ${
                          service === opt.val
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-[#0a1120] border-[#1e2a42] text-white hover:border-blue-500"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="w-4 h-4 shrink-0 text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Paso 2: ¿Para cuándo lo necesitas?
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-amber-400 font-black underline"
                    >
                      ← Cambiar servicio
                    </button>
                  </div>

                  <p className="text-xs text-white font-extrabold">
                    Servicio seleccionado: <strong className="text-amber-400 font-black">{service}</strong>
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {timelineOptions.map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setTimeline(opt.val);
                          setStep(3);
                        }}
                        className={`p-4 rounded-2xl border text-left font-black text-sm transition flex items-center justify-between ${
                          timeline === opt.val
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-[#0a1120] border-[#1e2a42] text-white hover:border-blue-500"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="w-4 h-4 shrink-0 text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Paso 3: ¿Cómo prefieres ser contactado?
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-amber-400 font-black underline"
                    >
                      ← Atrás
                    </button>
                  </div>

                  <div className="bg-[#0a1120] p-4 rounded-2xl border border-[#1e2a42] text-xs sm:text-sm font-black text-white">
                    <p>
                      <strong className="text-amber-400">Resumen:</strong> {service} • Plazo: {timeline}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-white mb-1">
                        Tu Nombre o Nombre de tu Empresa
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: María González"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#1e2a42] bg-[#0a1120] text-white font-black focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-white mb-1">
                        Teléfono / WhatsApp o Correo Electrónico
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: +58 412 991 2840 o maria@correo.com"
                        value={clientPhoneOrEmail}
                        onChange={(e) => setClientPhoneOrEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#1e2a42] bg-[#0a1120] text-white font-black focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Cotización</span>
                    </button>

                    <a
                      href={getWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Cotizar por WhatsApp Ahora</span>
                    </a>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Success confirmation */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white">
                ¡Solicitud Recibida con Éxito!
              </h3>
              <p className="text-sm text-white font-extrabold max-w-md mx-auto">
                Gracias <strong>{clientName}</strong>. Alonso Ríos analizará tu requerimiento para <strong>{service}</strong> y te contactará a la brevedad.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="bg-[#1e2a42] hover:bg-slate-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Realizar otra consulta</span>
                </button>
                <a
                  href={getWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir chat de WhatsApp</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
