"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Wifi,
  Github,
  ArrowRight,
  Sparkles,
  Download,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface AppItem {
  _id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  icon?: string;
  version: string;
  platform: string;
  category: string;
  status: "upcoming" | "beta" | "published";
  githubUrl?: string;
  playStoreUrl?: string;
  downloadUrl?: string;
  privacyPolicyUrl: string;
  features: string[];
  techStack: string[];
  featured?: boolean;
}

interface AppsListClientProps {
  apps: AppItem[];
}

export default function AppsListClient({ apps }: AppsListClientProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Disponible
          </span>
        );
      case "beta":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Fase Beta
          </span>
        );
      case "upcoming":
      default:
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Próximo Lanzamiento
          </span>
        );
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Ecosistema de Software Móvil</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Aplicaciones Android & Herramientas de Autor
        </h1>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Diseñadas con enfoque anti-sobreingeniería:{" "}
          <strong className="text-amber-300 font-bold">100% comunicación local</strong>,
          cero rastreadores invasivos, cero publicidad molesta y rendimiento nativo para resolver necesidades concretas.
        </p>
      </div>

      {/* Featured / Developer Standards Banner */}
      <div className="bg-[#0b1325] border border-slate-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Privacidad por Defecto</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sin telemetría oculta ni venta de datos personales. Cumplimiento riguroso con GDPR, CCPA y Google Play.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Red Local Autónoma</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus datos no tocan servidores de terceros. Todo el intercambio se realiza punto a punto en tu red Wi-Fi.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Ligero & Sin Drivers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Desarrollado para funcionar sin obligar al usuario a instalar software con privilegios peligrosos en la PC.
            </p>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {apps.map((app) => (
          <div
            key={app.slug}
            className="group relative bg-[#0c1527] border border-slate-800 hover:border-amber-400/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <div>
              {/* Top row with category and status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {app.category} · {app.platform}
                </span>
                {getStatusBadge(app.status)}
              </div>

              {/* Title & Tagline */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#121d33] border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {app.title}
                  </h2>
                  <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                    Versión {app.version}
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {app.tagline}
              </p>

              {/* Feature Highlights */}
              {app.features && app.features.length > 0 && (
                <div className="space-y-2 mb-6">
                  {app.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tech Stack Pills */}
              {app.techStack && app.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {app.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={`/apps/${app.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#070d19] font-black text-xs transition shadow-md"
                >
                  <span>Ver Ficha Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {app.githubUrl && (
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition"
                    title="Ver repositorio en GitHub (Privado / Source)"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>

              <Link
                href={app.privacyPolicyUrl || "/privacy-remote-keyboard.html"}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition font-mono"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Privacidad Legal</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Developer Note */}
      <div className="text-center pt-8 border-t border-slate-800/80">
        <p className="text-xs text-slate-400 font-mono">
          ¿Tienes una idea o necesitas una aplicación a medida para Android con comunicación de red local o IoT?{" "}
          <Link href="/#contacto" className="text-amber-400 font-bold underline hover:text-amber-300">
            Contáctame directamente
          </Link>
        </p>
      </div>
    </div>
  );
}
