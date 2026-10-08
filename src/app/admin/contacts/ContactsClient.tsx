"use client";

import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";

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

export default function ContactsClient() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const toggleStatus = async (id: string) => {
    const currentLead = leads.find((l) => l._id === id);
    if (!currentLead) return;

    const nextStatus =
      currentLead.status === "new"
        ? "contacted"
        : currentLead.status === "contacted"
        ? "completed"
        : "new";

    // Update optimistically
    setLeads((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status: nextStatus } : l))
    );

    try {
      await fetch("/api/admin/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert if failed
      setLeads((prev) =>
        prev.map((l) =>
          l._id === id ? { ...l, status: currentLead.status } : l
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Leads & Solicitudes de Clientes
          </span>
          <h2 className="text-2xl font-black text-white mt-1">Contactos Reales Recibidos</h2>
          <p className="text-xs text-white font-bold">
            Revisa las consultas recibidas desde el formulario web y cotizador interactivo.
          </p>
        </div>

        <div className="bg-[#0a1120] px-4 py-2 rounded-xl border border-[#1e2a42] text-xs font-bold text-white font-bold placeholder-white placeholder-opacity-100 font-bold">
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
                  <div className="flex items-center gap-3 text-xs text-white font-bold">
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

            <div className="bg-[#0a1120] p-4 rounded-2xl border border-[#1e2a42] text-xs text-white font-bold leading-relaxed placeholder-white placeholder-opacity-100 font-bold">
              "{l.message}"
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-white font-bold">
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
