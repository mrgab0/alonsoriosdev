"use client";

import React, { useState, useEffect } from "react";
import { Gift, X, Mail, CheckCircle2, Sparkles, Copy, Check } from "lucide-react";

interface LeadCaptureFloatingWidgetProps {
  delayMs?: number;
}

export default function LeadCaptureFloatingWidget({
  delayMs = 4000,
}: LeadCaptureFloatingWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [coupon, setCoupon] = useState("ALONSO10");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Si ya vio o cerró el cupón, no insistir
    const seen = localStorage.getItem("leadCaptureSeen");
    const closed = sessionStorage.getItem("leadCaptureDismissed");
    if (seen || closed) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("leadCaptureDismissed", "true");
    }
  };

  const handleCopyCoupon = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(coupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Por favor escribe un correo válido");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "lead-coupon-widget" }),
      });
      const data = await res.json();

      if (res.ok && (data.success || data.saved || data.coupon)) {
        setStatus("sent");
        if (data.coupon) setCoupon(data.coupon);
        setMessage(data.message || "¡Cupón activado con éxito!");

        if (typeof window !== "undefined") {
          localStorage.setItem("leadCaptureSeen", "true");
        }

        // Auto-cerrar suavemente tras cumplir su ciclo
        setTimeout(() => {
          setVisible(false);
        }, 4500);
      } else {
        throw new Error(data.error || "No se pudo procesar");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error al conectar con el servidor");
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cupón de descuento por visita"
      className="fixed bottom-6 left-4 sm:left-6 z-40 w-[calc(100vw-2rem)] sm:w-96 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative bg-[#0c1527]/95 border border-amber-400/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-white">
        {/* Botón clásico de cerrar arriba a la derecha */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar notificación de descuento"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {status === "sent" ? (
          /* Estado de éxito con cupón visible */
          <div className="py-2 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-white">
                ¡Gracias por visitarme!
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Aquí tienes tu código de descuento para tu primer proyecto:
              </p>
            </div>

            {/* Código promocional con botón copiar */}
            <div className="flex items-center justify-center gap-2 bg-[#070d19] border border-amber-400/40 rounded-xl px-4 py-2 font-mono">
              <span className="text-base font-extrabold text-amber-300 tracking-wider">
                {coupon}
              </span>
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="ml-2 text-xs flex items-center gap-1 text-slate-300 hover:text-amber-300 transition"
                title="Copiar cupón"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px]">{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Menciónalo al cotizar por WhatsApp o formulario. Se cerrará automáticamente.
            </p>
          </div>
        ) : (
          /* Formulario de captura inicial */
          <form onSubmit={submit} className="space-y-3.5">
            {/* Header del cupón */}
            <div className="flex items-start gap-3 pr-7">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Regalo de Visita
                  </span>
                </div>
                <h3 className="text-sm font-black text-white mt-1 leading-tight">
                  ¿Pensando en una Web o App?
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Te obsequio un <strong>10% de descuento</strong> en el presupuesto de tu sitio web profesional o app móvil Android por visitar mi página.
            </p>

            {/* Input de correo */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="Escribe tu correo..."
                  className="w-full bg-[#070d19] border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                />
              </div>
              {status === "error" && (
                <p className="text-[11px] text-rose-400 font-medium px-1">
                  {message}
                </p>
              )}
            </div>

            {/* Botón de acción */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-[#070d19] font-black rounded-xl py-2.5 px-4 text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === "sending" ? (
                <span>Generando cupón...</span>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Obtener mi Cupón de 10%</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
