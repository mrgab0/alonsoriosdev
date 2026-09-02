"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, Calendar, MessageSquare, CheckCircle2, Clock, Send } from "lucide-react";

interface ContactLead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  message: string;
  status: "new" | "contacted" | "completed";
  createdAt: string;
}

export default function AdminContactsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch leads or fallback
    setLeads([
      {
        _id: "lead-1",
        name: "Carlos Méndez",
        email: "carlos@sanmartin.com",
        phone: "+56 9 8888 7777",
        serviceType: "Recuperación Web",
        message: "Hola Alonso, mi sitio web muestra pantalla blanca por un virus y no podemos vender. Necesito solución urgente hoy.",
        status: "new",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "lead-2",
        name: "Dra. Carolina Silva",
        email: "carolina@consultoriodental.cl",
        phone: "+56 9 7777 6666",
        serviceType: "Página Web Nueva",
        message: "Quisiera cotizar una página web para mi clínica dental que sea muy fácil de usar para mis pacientes.",
        status: "contacted",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const toggleStatus = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l._id === id) {
          const nextStatus = l.status === "new" ? "contacted" : l.status === "contacted" ? "completed" : "new";
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Leads & Solicitudes de Clientes
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Contactos Reales Recibidos</h2>
          <p className="text-xs text-slate-300">
            Revisa las consultas recibidas desde el formulario web y cotizador interactivo.
          </p>
        </div>

        <div className="bg-[#0a1120] px-4 py-2 rounded-xl border border-[#1e2a42] text-xs font-bold text-slate-300">
          Total: <span className="text-amber-400 font-extrabold">{leads.length} mensajes</span>
        </div>
      </div>

      <div className="space-y-4">
        {leads.map((l) => (
          <div
            key={l._id}
            className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a42] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-base">
                  {l.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{l.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{l.email}</span>
                    {l.phone && <span>• {l.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full">
                  {l.serviceType}
                </span>

                <button
                  onClick={() => toggleStatus(l._id)}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition cursor-pointer ${
                    l.status === "new"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : l.status === "contacted"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {l.status === "new" ? "🔴 Nuevo" : l.status === "contacted" ? "🟡 Contactado" : "🟢 Completado"}
                </button>
              </div>
            </div>

            <div className="bg-[#0a1120] p-4 rounded-2xl border border-[#1e2a42] text-xs text-slate-200 leading-relaxed">
              "{l.message}"
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400">
                Recibido: {new Date(l.createdAt).toLocaleDateString()}
              </span>

              <a
                href={`mailto:${l.email}?subject=Respuesta%20Alonso%20Ríos%20-%20${encodeURIComponent(l.serviceType)}`}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Responder por Email</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
