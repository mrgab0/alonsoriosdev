"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  ArrowLeft,
  ShieldCheck,
  Wifi,
  Lock,
  Download,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface PermissionItem {
  name: string;
  description: string;
}

interface AppDetail {
  _id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  content: string;
  icon?: string;
  version: string;
  platform: string;
  category: string;
  status: "upcoming" | "beta" | "published";
  githubUrl?: string;
  playStoreUrl?: string;
  downloadUrl?: string;
  privacyPolicyUrl: string;
  permissions: PermissionItem[];
  features: string[];
  techStack: string[];
}

interface AppDetailClientProps {
  app: AppDetail;
}

export default function AppDetailClient({ app }: AppDetailClientProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="text-xs font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Disponible para Descarga
          </span>
        );
      case "beta":
        return (
          <span className="text-xs font-mono uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Acceso Beta Cerrado
          </span>
        );
      case "upcoming":
      default:
        return (
          <span className="text-xs font-mono uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Próximo Lanzamiento en Google Play
          </span>
        );
    }
  };

  return (
    <div className="space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/apps"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de aplicaciones</span>
        </Link>
      </div>

      {/* Main Hero Card */}
      <div className="bg-[#0c1527] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#121d33] border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-2xl shrink-0">
              <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {app.category} · {app.platform}
                </span>
                {getStatusBadge(app.status)}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {app.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  v{app.version}
                </span>
                <span>•</span>
                <span>100% Comunicación Local</span>
                <span>•</span>
                <span>Cero Telemetría</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href={app.privacyPolicyUrl || "/privacy-remote-keyboard.html"}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Política de Privacidad</span>
            </Link>

            {app.githubUrl && (
              <a
                href={app.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Repositorio GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            {app.playStoreUrl ? (
              <a
                href={app.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#070d19] font-black text-xs transition shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Instalar desde Google Play</span>
              </a>
            ) : (
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Lanzamiento en Google Play pronto</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-slate-300 text-base sm:text-lg leading-relaxed border-t border-slate-800/80 pt-6">
          {app.tagline}
        </p>
      </div>

      {/* Two Column Section: Features & Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core Features */}
        <div className="bg-[#0b1325] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Características Clave</span>
          </h2>

          <div className="space-y-3">
            {app.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack & Standards */}
        <div className="bg-[#0b1325] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Stack Tecnológico & Estándares</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {app.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono bg-slate-900 border border-slate-700/80 text-amber-300 px-3 py-1 rounded-lg font-bold"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Protocolo de Red Local Autónomo</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toda la comunicación se mantiene encapsulada en la red Wi-Fi compartida. Los datos nunca se envían a la nube ni a ningún servidor remoto del desarrollador.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block font-mono">Documento Legal</span>
              <span className="text-sm font-bold text-white">Cumplimiento Google Play & GDPR</span>
            </div>
            <Link
              href={app.privacyPolicyUrl || "/privacy-remote-keyboard.html"}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold underline flex items-center gap-1"
            >
              <span>Leer Política</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Permissions Breakdown Table */}
      {app.permissions && app.permissions.length > 0 && (
        <div className="bg-[#0b1325] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Desglose de Permisos de Android Solicitados</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Totalmente justificados ante Google Play Console
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            La aplicación cumple con el principio de mínimo privilegio. A continuación se detalla la justificación técnica de cada permiso declarado:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Permiso de Android</th>
                  <th className="py-3 px-4">Justificación Técnica del Desarrollador</th>
                  <th className="py-3 px-4 text-center">Salida a Internet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {app.permissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                      {perm.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                      {perm.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                        0% (Local)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Markdown Documentation */}
      {app.content && (
        <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="prose dark:prose-invert max-w-none text-slate-300">
            <MarkdownPreview
              source={app.content}
              style={{ backgroundColor: "transparent" }}
              wrapperElement={{ "data-color-mode": "dark" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
