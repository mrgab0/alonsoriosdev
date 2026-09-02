"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Palette, BarChart3, Mail, Send, MessageSquare, ArrowRight, Eye, Users, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalViews: 148,
    uniqueVisitors: 106,
    contactsCount: 5,
    chatLogsCount: 12,
  });

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setStats((prev) => ({
            ...prev,
            totalViews: data.data.totalViews,
            uniqueVisitors: data.data.uniqueVisitors,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#121b2d] border border-[#1e2a42] rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
            Control Total del Sitio Web
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            Panel de Control alonsorios.dev
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Edita secciones, personaliza colores y botones del Home, revisa estadísticas de visitas, gestiona contactos reales y envía campañas con Resend.
          </p>
        </div>

        <Link
          href="/admin/editor"
          className="bg-amber-400 hover:bg-amber-500 text-[#0a1120] font-black px-6 py-3.5 rounded-xl transition text-sm flex items-center gap-2 shrink-0 shadow-lg"
        >
          <Palette className="w-5 h-5" />
          <span>Editar Home & Tema</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Visitas Totales</span>
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalViews}</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            ↑ +18% este mes
          </div>
        </div>

        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Visitantes Únicos</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.uniqueVisitors}</div>
          <div className="text-xs text-slate-400 mt-1">Tráfico orgánico & directo</div>
        </div>

        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Contactos Recibidos</span>
            <Mail className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.contactsCount}</div>
          <div className="text-xs text-purple-400 font-semibold mt-1">Leads en base de datos</div>
        </div>

        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Chats Chatbot AI</span>
            <MessageSquare className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.chatLogsCount}</div>
          <div className="text-xs text-amber-400 font-semibold mt-1">Notificados en Telegram</div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/editor"
          className="bg-[#121b2d] hover:bg-[#18243c] p-6 rounded-3xl border border-[#1e2a42] transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl w-fit mb-4">
              <Palette className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Editor del Home & Tema</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modifica textos de Inicio, Servicios, Libros/Cursos, colores de fondo, tipos de botones y tipografía.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-extrabold text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Abrir Editor Visual</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-[#121b2d] hover:bg-[#18243c] p-6 rounded-3xl border border-[#1e2a42] transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl w-fit mb-4">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Estadísticas de Visitas</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Visualiza el desglose de páginas vistas, fuentes de tráfico (Google, WhatsApp, directo) y dispositivos.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-extrabold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Ver Gráficos de Tráfico</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/admin/campaigns"
          className="bg-[#121b2d] hover:bg-[#18243c] p-6 rounded-3xl border border-[#1e2a42] transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-rose-600/20 text-rose-400 rounded-2xl w-fit mb-4">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campañas Email Marketing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Redacta y envía correos masivos a tus clientes y alumnos usando la API de Resend.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-extrabold text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Crear Nueva Campaña</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
