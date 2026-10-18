"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Bot, MessageCircle, Sparkles, ShieldCheck, Zap } from "lucide-react";

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

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const initialBotMessage = isAdmin
    ? "⚡ ¡Hola Alonso! Soy tu Co-Pilot de administración. Puedo ayudarte a actualizar tu telemetría de trabajo en vivo, consultar métricas de tráfico y leads, o guiarte en cualquier módulo."
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { id: `u-${Date.now()}`, sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: isAdmin
            ? "Error de conexión temporal con el Co-Pilot."
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
          onClick={() => setIsOpen(true)}
          className={`text-white font-black p-4 rounded-full shadow-2xl flex items-center gap-3 transition transform hover:scale-105 active:scale-95 ${
            isAdmin
              ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/25 border border-amber-400/40 text-gray-950"
              : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
          }`}
          title={isAdmin ? "Alonso Co-Pilot de Administración" : "Asistente Virtual Alonso Ríos"}
        >
          {isAdmin ? (
            <Zap className="w-6 h-6 fill-gray-950 text-gray-950" />
          ) : (
            <Bot className="w-6 h-6 text-amber-400" />
          )}
          <span className="hidden sm:inline text-sm font-black pr-1">
            {isAdmin ? "⚡ Co-Pilot Admin" : "¿Preguntas? Chatea con Alonso AI"}
          </span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="bg-[#121b2d] border border-[#1e2a42] w-[90vw] sm:w-[400px] h-[540px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-5 duration-200">
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
                {isAdmin ? <Zap className="w-5 h-5 fill-amber-400" /> : <Bot className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  <span>{isAdmin ? "Alonso Co-Pilot" : "Alonso Ríos AI"}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                </h4>
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAdmin ? "bg-amber-400 status-pulse" : "bg-emerald-400 status-pulse"
                    }`}
                  />
                  <span className={isAdmin ? "text-amber-400" : "text-emerald-400"}>
                    {isAdmin ? "Panel de Operaciones • En vivo" : "En línea • Monitoreo directo"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white hover:text-amber-400 rounded-lg hover:bg-[#1e2a42] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0a1120] text-xs">
            <div className="bg-[#121b2d] p-2.5 rounded-xl border border-[#1e2a42] text-[11px] text-white font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAdmin
                  ? "Co-Pilot administrativo activo. Puedes solicitar cambios de telemetría o consultar métricas."
                  : "Las consultas son respondidas en tiempo real y conectadas con WhatsApp."}
              </span>
            </div>

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
                <span>{isAdmin ? "Co-Pilot procesando..." : "Escribiendo respuesta..."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#080e1e] border-t border-[#1e2a42] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                isAdmin
                  ? "Ej: Pon que ando en: Refactor checkout en Flower..."
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
