"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestWhatsapp?: boolean;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "¡Hola! 👋 Soy el asistente virtual de Alonso Ríos. ¿En qué puedo ayudarte hoy? (Sitios web, recuperación por hackeo, apps Android o cursos).",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

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
        body: JSON.stringify({ message: userText, sessionId: "web_session" }),
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
          text: "Te entiendo. Si prefieres, puedes hablar directo con Alonso por WhatsApp.",
          suggestWhatsapp: true,
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
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-3 transition transform hover:scale-105 status-pulse"
          title="Asistente Virtual Alonso Ríos"
        >
          <Bot className="w-7 h-7 text-amber-400" />
          <span className="hidden sm:inline text-sm font-extrabold pr-1">¿Preguntas? Chatea con Alonso AI</span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="bg-[#121b2d] border border-[#1e2a42] w-[90vw] sm:w-[380px] h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="bg-[#080e1e] p-4 border-b border-[#1e2a42] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-amber-400 font-extrabold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>Alonso Ríos AI</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
                  <span>En línea • Monitoreo directo</span>
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
            <div className="bg-[#121b2d] p-2.5 rounded-xl border border-[#1e2a42] text-[11px] text-white font-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Las consultas son respondidas como por un humano y notificadas en tiempo real.</span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs font-black shadow-xs ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#121b2d] text-white border border-[#1e2a42] rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>

                {/* WhatsApp Escalation Button */}
                {m.suggestWhatsapp && (
                  <a
                    href="https://wa.me/584129912840?text=Hola%20Alonso,%20vengo%20del%20chat%20de%20tu%20web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hablar por WhatsApp con Alonso</span>
                  </a>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Escribiendo respuesta...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#080e1e] border-t border-[#1e2a42] flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu duda aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#121b2d] border border-[#1e2a42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-500 text-[#0a1120] font-black p-2.5 rounded-xl transition shrink-0"
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
