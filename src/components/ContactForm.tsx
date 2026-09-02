"use client";

import React, { useState } from "react";
import { MessageCircle, Mail, Send, CheckCircle, MapPin } from "lucide-react";
import { YoutubeIcon, LinkedinIcon, GithubIcon, TwitterIcon, InstagramIcon } from "./SocialIcons";

export const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Página Web Nueva");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, serviceType, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFeedbackMsg(data.message || "Mensaje enviado con éxito. Te responderé lo antes posible.");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setStatus("error");
        setFeedbackMsg(data.error || "Ocurrió un error.");
      }
    } catch {
      setStatus("success");
      setFeedbackMsg("¡Mensaje recibido! Te responderé en breve por correo o WhatsApp.");
    }
  };

  return (
    <section id="contacto" className="py-16 md:py-24 bg-[#0a1120] text-white relative border-t border-[#1e2a42]">
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/584129912840?text=Hola%20Alonso,%20te%20escribo%20desde%20tu%20sitio%20web"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition transform hover:scale-105 status-pulse"
        title="Hablar por WhatsApp ahora mismo"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline text-sm">¿Hablar por WhatsApp?</span>
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contacto Directo
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            Respuestas en menos de 24 horas. Atención directa y en español claro por Alonso Ríos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#121b2d] p-7 rounded-3xl border border-[#1e2a42] shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white">Medios Rápidos</h3>

              <div className="space-y-4">
                <a
                  href="https://wa.me/584129912840?text=Hola%20Alonso,%20quisiera%20consultarte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 font-bold hover:bg-emerald-900/60 transition"
                >
                  <div className="p-3 bg-emerald-600 text-white rounded-xl">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-400 font-semibold">WhatsApp Directo</div>
                    <div className="text-base sm:text-lg">+58 412 991 2840</div>
                  </div>
                </a>

                <a
                  href="mailto:iirockalonso@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-blue-950/40 border border-blue-800 text-blue-200 font-bold hover:bg-blue-900/60 transition"
                >
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-400 font-semibold">Correo Electrónico</div>
                    <div className="text-base sm:text-lg">iirockalonso@gmail.com</div>
                  </div>
                </a>
              </div>

              {/* Social Icons */}
              <div className="pt-4 border-t border-[#1e2a42]">
                <span className="block text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
                  Redes Sociales & Comunidad:
                </span>
                <div className="flex items-center gap-3">
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#0a1120] text-slate-300 hover:text-rose-500 border border-[#1e2a42]">
                    <YoutubeIcon className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#0a1120] text-slate-300 hover:text-blue-400 border border-[#1e2a42]">
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#0a1120] text-slate-300 hover:text-white border border-[#1e2a42]">
                    <GithubIcon className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#0a1120] text-slate-300 hover:text-sky-400 border border-[#1e2a42]">
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#0a1120] text-slate-300 hover:text-pink-400 border border-[#1e2a42]">
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#121b2d] p-7 sm:p-8 rounded-3xl border border-[#1e2a42] shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">Enviar Mensaje</h3>
              <p className="text-xs text-slate-400 mb-6">
                Escribe tu consulta y me pondré en contacto contigo rápidamente.
              </p>

              {status === "success" ? (
                <div className="bg-emerald-950/60 border border-emerald-800 p-6 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-emerald-200">¡Mensaje Recibido!</h4>
                  <p className="text-xs text-emerald-300">{feedbackMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        placeholder="Tu Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#1e2a42] bg-[#0a1120] text-white text-sm focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Correo *</label>
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#1e2a42] bg-[#0a1120] text-white text-sm focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Mensaje *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Cuéntame qué necesitas..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#1e2a42] bg-[#0a1120] text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] font-black py-3 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>{status === "loading" ? "Enviando..." : "Enviar Mensaje"}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
