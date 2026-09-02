"use client";

import React, { useState, useEffect } from "react";
import { Bot, User, ShieldCheck, RefreshCw } from "lucide-react";

interface ChatLog {
  sessionId: string;
  sender: "user" | "bot" | "human";
  text: string;
  timestamp: string;
  escalatedToWhatsapp?: boolean;
}

export default function ChatClient() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/chat")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setLogs(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Monitoreo en Tiempo Real
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Logs del Chatbot AI</h2>
          <p className="text-xs text-slate-300">
            Revisa las conversaciones mantenidas por el asistente virtual y notificadas a tu celular por Telegram.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-[#0a1120] hover:bg-[#1e2a42] border border-[#1e2a42] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar Conversaciones</span>
        </button>
      </div>

      {/* Webhook Status Info Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800 p-5 rounded-2xl text-xs text-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Notificaciones al celular activas:</strong>
          Cada mensaje que un cliente escribe en el chatbot se envía automáticamente a tu webhook de Telegram o Discord. Puedes configurar tu URL de Telegram en <a href="/admin/editor" className="underline font-bold text-amber-400">Editor Home & Tema → Contacto</a>.
        </div>
      </div>

      {/* Chat Log Cards */}
      <div className="space-y-4">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              log.sender === "user"
                ? "bg-blue-950/40 border-blue-800 text-blue-100"
                : "bg-[#121b2d] border-[#1e2a42] text-slate-200"
            }`}
          >
            <div
              className={`p-2 rounded-xl text-white shrink-0 ${
                log.sender === "user" ? "bg-blue-600" : "bg-amber-500 text-[#0a1120]"
              }`}
            >
              {log.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white uppercase">
                  {log.sender === "user" ? "👤 Cliente" : "🤖 Alonso Ríos AI"}
                </span>
                <span className="text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{log.text}</p>
              {log.escalatedToWhatsapp && (
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  💬 Ofreció enlace directo a WhatsApp
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
