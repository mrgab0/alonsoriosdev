"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Bot, MessageCircle, Sparkles, ShieldCheck, Zap, Bell, Crown } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestWhatsapp?: boolean;
}

// Helper to render markdown links [text](url) and bold **text** safely
function renderFormattedMessage(text: string) {
  // Regex for [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    const isInternal = url.startsWith("/");
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target={isInternal ? "_self" : "_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
        className="text-amber-400 font-black underline hover:text-amber-300 transition"
      >
        {label}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.length > 0 ? parts : text}
    </span>
  );
}

export const ChatbotWidget: React.FC = () => {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;
  const { refreshConfig } = useConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<number>(Date.now() - 60000);

  const initialBotMessage = isAdmin
    ? "🎩 A su servicio, Alonso. Soy su Mayordomo Inteligente. Puedo meditar y redactar artículos para el blog, ajustar estilos y colores en vivo, modificar textos del sitio, optimizar SEO o monitorear las visitas en tiempo real. ¿En qué le colaboro hoy?"
    : "¡Hola! 👋 Soy el asistente virtual de Alonso Ríos. ¿En qué puedo ayudarte hoy? (Sitios web, apps Android, recuperación de sitios caídos o cursos).";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-init",
      sender: "bot",
      text: initialBotMessage,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Reset or update greeting if route changes between admin and public
  useEffect(() => {
    setMessages([
      {
        id: `m-init-${isAdmin ? "admin" : "public"}`,
        sender: "bot",
        text: initialBotMessage,
      },
    ]);
  }, [isAdmin]);

  // Telemetry Monitor for Admin (Lightweight Polling)
  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/live-feed?since=${lastCheckTimestamp}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.events && data.events.length > 0 && isMounted) {
          setLastCheckTimestamp(Date.now());
          const newEvents = data.events;

          const alertTexts = newEvents
            .map((ev: any) => `🔔 **Alerta en Vivo:** ${ev.title}\n${ev.detail}`)
            .join("\n\n");

          setMessages((prev) => [
            ...prev,
            {
              id: `alert-${Date.now()}`,
              sender: "bot",
              text: alertTexts,
            },
          ]);

          if (!isOpen) {
            setUnreadAlerts((prev) => prev + newEvents.length);
          }
        }
      } catch {}
    }, 25000); // 25s lightweight interval

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin, lastCheckTimestamp, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadAlerts(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("chatbot-toggle", { detail: { open: true } }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("chatbot-toggle", { detail: { open: false } }));
    }
  };

  const handleSend = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: isAdmin ? "admin_session" : "web_session",
          isAdmin,
          currentPath: pathname || "/",
        }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: "bot",
            text: data.reply,
            suggestWhatsapp: data.suggestWhatsapp,
          },
        ]);
      }

      // If action modified SiteConfig, refresh frontend context reactively
      if (data.refreshConfig) {
        await refreshConfig();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: isAdmin
            ? "🎩 Mil disculpas, Alonso. Se ha presentado un error de conexión con los servicios del Butler."
            : "Te entiendo. Si prefieres, puedes hablar directo con Alonso por WhatsApp.",
          suggestWhatsapp: !isAdmin,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Bubble Launcher */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`relative text-white font-black p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 sm:gap-3 transition transform hover:scale-105 active:scale-95 ${
            isAdmin
              ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/25 border border-amber-400/40 text-gray-950"
              : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 border border-blue-400/20"
          }`}
          title={isAdmin ? "Alonso Butler (Mayordomo de Administración)" : "Asistente Virtual Alonso Ríos"}
        >
          {isAdmin ? (
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-950 fill-gray-950" />
          ) : (
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
          )}
          <span className="hidden sm:inline text-xs sm:text-sm font-black pr-1">
            {isAdmin ? "🎩 Alonso Butler" : "Chatea con Alonso AI"}
          </span>

          {/* Unread Telemetry Badge */}
          {unreadAlerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              {unreadAlerts}
            </span>
          )}
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="bg-[#121b2d] border border-[#1e2a42] w-[90vw] sm:w-[420px] h-[560px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="bg-[#080e1e] p-4 border-b border-[#1e2a42] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold shadow-sm ${
                  isAdmin
                    ? "bg-amber-400/20 border border-amber-400/50 text-amber-400"
                    : "bg-blue-600 text-amber-400"
                }`}
              >
                {isAdmin ? <Crown className="w-5 h-5 fill-amber-400" /> : <Bot className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  <span>{isAdmin ? "Alonso Butler (Mayordomo IA)" : "Alonso Ríos AI"}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                </h4>
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAdmin ? "bg-amber-400 status-pulse" : "bg-emerald-400 status-pulse"
                    }`}
                  />
                  <span className={isAdmin ? "text-amber-400" : "text-emerald-400"}>
                    {isAdmin ? "Asistente Ejecutivo • Modo Autónomo" : "En línea • Monitoreo directo"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-white hover:text-amber-400 rounded-lg hover:bg-[#1e2a42] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0a1120] text-xs">
            <div className="bg-[#121b2d] p-2.5 rounded-xl border border-[#1e2a42] text-[11px] text-white font-bold flex items-center gap-2">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>
                {isAdmin
                  ? "Mayordomo conectado. Puede ordenar creación de posts, cambios de tema/copy, SEO y telemetría."
                  : "Las consultas son respondidas en tiempo real y conectadas con WhatsApp."}
              </span>
            </div>

            {/* Quick Action Chips for Admin */}
            {isAdmin && messages.length <= 2 && (
              <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => handleSend(null as any, "Créame un nuevo artículo técnico sobre optimización Next.js y Vercel")}
                  className="p-2 bg-[#162137] hover:bg-[#1e2d4a] border border-[#233554] rounded-xl text-[11px] font-bold text-left text-gray-200 hover:text-amber-300 transition"
                >
                  ✍️ Crear artículo técnico
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(null as any, "Ajusta el color de acento a ámbar solar (#f59e0b)")}
                  className="p-2 bg-[#162137] hover:bg-[#1e2d4a] border border-[#233554] rounded-xl text-[11px] font-bold text-left text-gray-200 hover:text-amber-300 transition"
                >
                  🎨 Cambiar acento a ámbar
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(null as any, "¿Quién ha entrado hoy a la página y qué leads hay?")}
                  className="p-2 bg-[#162137] hover:bg-[#1e2d4a] border border-[#233554] rounded-xl text-[11px] font-bold text-left text-gray-200 hover:text-amber-300 transition"
                >
                  👀 Ver tráfico y leads
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(null as any, "Optimiza los metatags SEO para Google y redes sociales")}
                  className="p-2 bg-[#162137] hover:bg-[#1e2d4a] border border-[#233554] rounded-xl text-[11px] font-bold text-left text-gray-200 hover:text-amber-300 transition"
                >
                  🔍 Optimizar metatags SEO
                </button>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed text-xs font-bold shadow-sm ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#121b2d] text-white border border-[#1e2a42] rounded-bl-none"
                  }`}
                >
                  {renderFormattedMessage(m.text)}
                </div>

                {/* WhatsApp Escalation Button (Only in visitor mode) */}
                {m.suggestWhatsapp && (
                  <a
                    href="https://wa.me/584129912840?text=Hola%20Alonso,%20vengo%20del%20chat%20de%20tu%20web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hablar por WhatsApp con Alonso</span>
                  </a>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-white font-bold text-xs italic">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{isAdmin ? "🎩 Mayordomo procesando orden..." : "Escribiendo respuesta..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => handleSend(e)}
            className="p-3 bg-[#080e1e] border-t border-[#1e2a42] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                isAdmin
                  ? "Ordene al Mayordomo: crear post, cambiar tema, SEO..."
                  : "Escribe tu duda sobre desarrollo o servicios..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#121b2d] border border-[#1e2a42] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold placeholder-white placeholder-opacity-60 outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black p-2.5 rounded-xl transition shrink-0 disabled:opacity-50"
              title="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
