"use client";

import React, { useState } from "react";
import { Lock, Mail, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";

interface LockedSnippetProps {
  type: string;
  title?: string;
  children: React.ReactNode;
}

export function LockedSnippet({ type, title, children }: LockedSnippetProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (type === "email") {
      // Aquí iría la llamada real a la API para guardar el correo
      await new Promise(r => setTimeout(r, 1000));
      // Guardar localmente que ya se desbloqueó para evitar pedirlo de nuevo al recargar
      localStorage.setItem("unlocked_content", "true");
    } else if (type === "whatsapp") {
      window.open("https://wa.me/584129912840?text=Hola,%20quiero%20desbloquear%20el%20recurso%20oculto", "_blank");
    } else if (type === "social") {
      window.open("https://twitter.com/intent/tweet?text=Excelente%20artículo%20de%20@alonsoriosdev%20https://alonsorios.dev", "_blank");
    } else if (type === "youtube") {
      window.open("https://youtube.com/@alonsoriosdev?sub_confirmation=1", "_blank");
    } else if (type === "gumroad") {
      window.open("https://gumroad.com/alonsoriosdev", "_blank");
    } else if (type === "kofi") {
      window.open("https://ko-fi.com/alonsoriosdev", "_blank");
    }

    setUnlocked(true);
    setLoading(false);
  };

  // Si ya lo desbloqueó antes o ahora
  if (unlocked || (typeof window !== "undefined" && localStorage.getItem("unlocked_content") === "true")) {
    return (
      <div className="my-8 rounded-xl border border-green-500/30 bg-green-500/5 relative overflow-hidden">
        <div className="bg-green-500/20 px-4 py-2 text-green-400 font-bold text-sm flex items-center gap-2 border-b border-green-500/30">
          <ShieldCheck className="w-4 h-4" />
          Contenido Desbloqueado Exitosamente
        </div>
        <div className="p-6 prose prose-invert max-w-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 relative rounded-xl border border-gray-800 bg-[#121b2d] overflow-hidden group">
      {/* Contenido Difuminado */}
      <div className="p-6 blur-md opacity-40 select-none pointer-events-none transition duration-500 group-hover:blur-lg">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-600 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-600 rounded w-5/6 mb-4"></div>
        <div className="h-10 bg-amber-400/20 rounded w-1/3 mt-6"></div>
      </div>

      {/* Caja de Bloqueo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0a1120]/60 backdrop-blur-sm">
        <div className="bg-[#121b2d] p-6 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {title || "Contenido Exclusivo Bloqueado"}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {type === "email" && "Déjame tu mejor correo para acceder a este material exclusivo."}
            {type === "whatsapp" && "Envíame un mensaje rápido por WhatsApp para darte el acceso."}
            {type === "social" && "Comparte este artículo en tus redes para desbloquear la guía."}
            {type === "youtube" && "Suscríbete a mi canal de YouTube para continuar leyendo."}
            {type === "gumroad" && "Visita mi tienda en Gumroad para desbloquear este contenido."}
            {type === "kofi" && "Apóyame en Ko-fi para acceder a este material exclusivo."}
            {!["email", "whatsapp", "social", "youtube", "gumroad", "kofi"].includes(type) && "Realiza la acción solicitada para desbloquear."}
          </p>

          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            {type === "email" && (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
            >
              {loading ? "Procesando..." : (
                <>
                  {type === "email" && <Mail className="w-4 h-4" />}
                  {type === "whatsapp" && <MessageCircle className="w-4 h-4" />}
                  {type === "social" && <ExternalLink className="w-4 h-4" />}
                  {type === "youtube" && <ExternalLink className="w-4 h-4" />}
                  {type === "gumroad" && <ExternalLink className="w-4 h-4" />}
                  {type === "kofi" && <ExternalLink className="w-4 h-4" />}
                  {type === "email" ? "Desbloquear Ahora" : "Continuar para Desbloquear"}
                </>
              )}
            </button>
          </form>
          <div className="text-xs text-gray-500 mt-4">
            Totalmente seguro. Cero spam.
          </div>
        </div>
      </div>
    </div>
  );
}
