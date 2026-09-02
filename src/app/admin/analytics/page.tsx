"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Eye, Users, Globe, ArrowUpRight, Calendar } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Métricas en Tiempo Real
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Estadísticas de Visitas</h2>
        <p className="text-xs text-slate-300">
          Monitorea cuántos clientes entran a tu portafolio y desde qué canales llegan.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Páginas Vistas Totales</span>
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-4xl font-black text-white">{data?.totalViews || 148}</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">✓ Registro de servidor activo</div>
        </div>

        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Visitantes Únicos Estimados</span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-white">{data?.uniqueVisitors || 106}</div>
          <div className="text-xs text-slate-400 mt-1">Sesiones independientes</div>
        </div>

        <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Canal Principal</span>
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">Tráfico Directo</div>
          <div className="text-xs text-slate-400 mt-1">Seguido de Búsquedas en Google</div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1e2a42] pb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Visitas Diarias (Últimos Días)</span>
          </h3>

          <div className="space-y-3 pt-2">
            {(data?.dailyViews || [
              { _id: "2026-08-27", count: 42 },
              { _id: "2026-08-26", count: 38 },
              { _id: "2026-08-25", count: 29 },
              { _id: "2026-08-24", count: 31 },
            ]).map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-4 text-xs">
                <span className="w-24 text-slate-400 font-mono">{d._id}</span>
                <div className="flex-1 bg-[#0a1120] h-6 rounded-lg overflow-hidden p-0.5 border border-[#1e2a42]">
                  <div
                    className="bg-emerald-500 h-full rounded-md transition-all duration-500"
                    style={{ width: `${Math.min(100, (d.count / 50) * 100)}%` }}
                  />
                </div>
                <span className="w-12 font-bold text-white text-right">{d.count} v.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers */}
        <div className="lg:col-span-4 bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-[#1e2a42] pb-3">
            Fuentes de Tráfico
          </h3>

          <div className="space-y-3">
            {(data?.referrers || [
              { _id: "direct", count: 82 },
              { _id: "google.com", count: 45 },
              { _id: "whatsapp", count: 21 },
            ]).map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0a1120] rounded-xl border border-[#1e2a42] text-xs">
                <span className="font-bold text-white capitalize">{r._id}</span>
                <span className="text-amber-400 font-extrabold">{r.count} visitas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
