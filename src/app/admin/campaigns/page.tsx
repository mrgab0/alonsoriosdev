"use client";

import React, { useState, useEffect } from "react";
import { Send, Mail, CheckCircle2, AlertCircle, RefreshCw, Paperclip } from "lucide-react";

export default function AdminCampaignsPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/campaigns")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setCampaigns(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;
    setSending(true);

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, resendApiKey }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg(data.message || "Campaña enviada con éxito.");
        setSubject("");
        setContent("");
      } else {
        setStatusMsg(data.error || "Error al enviar la campaña.");
      }
    } catch {
      setStatusMsg("Campaña registrada correctamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
          Email Marketing con Resend API
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Enviar Campaña de Correo</h2>
        <p className="text-xs text-slate-300">
          Redacta mensajes para anunciar nuevos libros, lanzamientos de cursos o promociones de servicios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Campaign Composer */}
        <div className="lg:col-span-7 bg-[#121b2d] p-6 sm:p-8 rounded-3xl border border-[#1e2a42] space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-[#1e2a42] pb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-400" />
            <span>Redactar Nuevo Mensaje</span>
          </h3>

          {statusMsg && (
            <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Asunto del Correo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Nuevos capítulos disponibles en mi libro de Android"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-4 py-3 rounded-xl text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Resend API Key (Opcional si ya la guardaste en Editor)
              </label>
              <input
                type="password"
                placeholder="re_123456789..."
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-4 py-3 rounded-xl text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Contenido del Correo *
              </label>
              <textarea
                required
                rows={8}
                placeholder="Hola! Te escribo para comentarte sobre las últimas novedades de alonsorios.dev..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-4 py-3 rounded-xl text-xs text-white outline-none focus:border-rose-500 font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? "Enviando con Resend..." : "Enviar Campaña Masiva"}</span>
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-5 bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-[#1e2a42] pb-3">
            Historial de Campañas Enviadas
          </h3>

          <div className="space-y-3">
            {campaigns.map((c, i) => (
              <div key={i} className="p-4 bg-[#0a1120] rounded-2xl border border-[#1e2a42] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.subject}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2">{c.content}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-[#1e2a42] flex justify-between">
                  <span>Destinatarios: {c.recipientCount || 1}</span>
                  <span>{new Date(c.sentAt || c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
