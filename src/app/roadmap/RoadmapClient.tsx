"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Activity,
  Code2,
  FolderGit2,
  ListTodo,
  BookOpen,
  Calendar,
  Layers,
  Star,
  RefreshCw,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

interface LatestActivity {
  repoName: string;
  cleanRepoName: string;
  message: string;
  timestamp: string;
  url: string;
  branch: string;
}

interface ActiveRepo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  pushedAt: string;
  url: string;
  homepage: string | null;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "completed" | "in_progress" | "planned";
  progress: number;
  shippedDate?: string;
  eta?: string;
}

interface WalkthroughEntry {
  date: string;
  title: string;
  badge: string;
  highlights: string[];
}

interface ActivityResponse {
  latestActivity: LatestActivity;
  activeRepos: ActiveRepo[];
  roadmap: RoadmapItem[];
  walkthrough: WalkthroughEntry[];
}

export default function RoadmapClient({ initialData }: { initialData?: ActivityResponse | null }) {
  const [data, setData] = useState<ActivityResponse | null>(initialData || null);
  const [activeTab, setActiveTab] = useState<"roadmap" | "repos" | "walkthrough">("roadmap");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in_progress" | "planned">("all");
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    fetch("/api/developer/activity")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Error loading activity:", err))
      .finally(() => setLoading(false));
  }, []);

  const latest = data?.latestActivity;
  const repos = data?.activeRepos || [];
  const roadmap = data?.roadmap || [];
  const walkthrough = data?.walkthrough || [];

  const filteredRoadmap =
    filterStatus === "all" ? roadmap : roadmap.filter((item) => item.status === filterStatus);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recientemente";
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "Hace unos minutos";
      if (diffHours === 1) return "Hace 1 hora";
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Ayer";
      return `Hace ${diffDays} días`;
    } catch {
      return "Hoy";
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "typescript":
        return "bg-blue-400";
      case "javascript":
        return "bg-yellow-400";
      case "kotlin":
        return "bg-purple-400";
      case "python":
        return "bg-emerald-400";
      case "html":
        return "bg-orange-400";
      default:
        return "bg-amber-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-white">
      {/* Background Radiance Blooms */}
      <div className="pointer-events-none fixed top-0 left-1/3 -translate-x-1/2 w-[600px] h-[500px] bg-orange-500/10 rounded-full blur-[160px] -z-10" />
      <div className="pointer-events-none fixed top-1/2 right-10 w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[160px] -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono mb-8 text-amber-300 font-bold">
          <Link href="/" className="text-white hover:text-amber-400 transition">
            Inicio
          </Link>
          <span className="text-amber-400">/</span>
          <span className="text-amber-300">Roadmap & Actividad GitHub</span>
        </div>

        {/* Editorial Page Header */}
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f172a] border border-slate-700/80 mb-5 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#67dba9]"></span>
            </span>
            <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider">
              Transparencia Radical & Sincronización en Vivo
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl text-white font-extrabold leading-[1.08] tracking-tight mb-4">
            Roadmap de Ingeniería &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-amber-200">
              Mirror de Repositorios.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white font-semibold leading-relaxed">
            Monitor abierto de los proyectos, módulos de software y funcionalidades en las que Alonso Ríos
            está trabajando día a día. Sincronizado en tiempo real con la actividad oficial de GitHub{" "}
            <a
              href="https://github.com/mrgab0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 underline font-black inline-flex items-center gap-1"
            >
              (@mrgab0) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            .
          </p>
        </div>

        {/* Hero Card: What is Alonso working on today? */}
        <div className="mb-14 rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-400/10 to-transparent p-1 border-2 border-amber-400/30 shadow-2xl">
          <div className="bg-[#090f1d] rounded-[22px] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#67dba9]" />
                  Trabajando Hoy
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeTime(latest?.timestamp)}
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Rama: {latest?.branch || "main"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl sm:text-2xl font-editorial font-bold text-white">
                    {latest?.cleanRepoName || "alonsorios.dev"}
                  </h2>
                </div>
                <p className="text-sm sm:text-base font-semibold text-white max-w-2xl leading-relaxed">
                  {latest?.message || "Optimización de arquitectura, balance tipográfico y roadmap"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={latest?.url || "https://github.com/mrgab0/alonsoriosdev"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition shadow-md"
              >
                <GithubIcon className="w-4 h-4 text-white" />
                <span>Ver en GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>

              <a
                href={`https://wa.me/584129912840?text=${encodeURIComponent(
                  `Hola Alonso, vi que estás trabajando en ${latest?.cleanRepoName || "tus proyectos"} y me gustaría consultarte algo`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-400/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "roadmap"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-[1.02]"
                : "bg-[#0f172a] hover:bg-slate-800 text-white border border-slate-700/80"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Roadmap de Productos ({roadmap.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("repos")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "repos"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-[1.02]"
                : "bg-[#0f172a] hover:bg-slate-800 text-white border border-slate-700/80"
            }`}
          >
            <GithubIcon className="w-4 h-4" />
            <span>Mirror de Repositorios ({repos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("walkthrough")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "walkthrough"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-[1.02]"
                : "bg-[#0f172a] hover:bg-slate-800 text-white border border-slate-700/80"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bitácora &amp; Walkthrough ({walkthrough.length})</span>
          </button>
        </div>

        {/* TAB 1: ROADMAP */}
        {activeTab === "roadmap" && (
          <div className="space-y-6">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-white text-slate-950"
                    : "bg-[#0f172a] text-white hover:bg-slate-800 border border-slate-700"
                }`}
              >
                Todos ({roadmap.length})
              </button>
              <button
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  filterStatus === "completed"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-[#0f172a] text-white hover:bg-slate-800 border border-slate-700"
                }`}
              >
                ✅ Completados ({roadmap.filter((r) => r.status === "completed").length})
              </button>
              <button
                onClick={() => setFilterStatus("in_progress")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  filterStatus === "in_progress"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-[#0f172a] text-white hover:bg-slate-800 border border-slate-700"
                }`}
              >
                ⚡ En Progreso ({roadmap.filter((r) => r.status === "in_progress").length})
              </button>
              <button
                onClick={() => setFilterStatus("planned")}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  filterStatus === "planned"
                    ? "bg-purple-400 text-slate-950"
                    : "bg-[#0f172a] text-white hover:bg-slate-800 border border-slate-700"
                }`}
              >
                🟣 Planificados ({roadmap.filter((r) => r.status === "planned").length})
              </button>
            </div>

            {/* Roadmap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoadmap.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#090f1d] border border-slate-700/80 p-6 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 shadow-xl group hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        {item.category}
                      </span>
                      {item.status === "completed" && (
                        <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completado
                        </span>
                      )}
                      {item.status === "in_progress" && (
                        <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                          <Activity className="w-3.5 h-3.5" />
                          En Progreso
                        </span>
                      )}
                      {item.status === "planned" && (
                        <span className="text-[11px] font-mono font-bold text-purple-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Planificado
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-800">
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="text-white font-bold">Progreso:</span>
                      <span
                        className={`font-black ${
                          item.status === "completed"
                            ? "text-emerald-400"
                            : item.status === "in_progress"
                            ? "text-amber-400"
                            : "text-purple-400"
                        }`}
                      >
                        {item.progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === "completed"
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : item.status === "in_progress"
                            ? "bg-gradient-to-r from-orange-500 to-amber-400"
                            : "bg-gradient-to-r from-purple-500 to-indigo-400"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono mt-3">
                      <span className="text-amber-300 font-bold">
                        {item.shippedDate ? `Lanzado: ${item.shippedDate}` : `Estimado: ${item.eta}`}
                      </span>
                      <a
                        href={`https://wa.me/584129912840?text=${encodeURIComponent(
                          `Hola Alonso, tengo una sugerencia para el roadmap sobre: ${item.title}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-amber-300 font-bold transition flex items-center gap-1"
                      >
                        <span>Sugerir</span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB REPOSITORIES MIRROR */}
        {activeTab === "repos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Repositorios Activos en GitHub (@mrgab0)
              </span>
              <a
                href="https://github.com/mrgab0?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <span>Ver todos en GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo) => (
                <div
                  key={repo.name}
                  className="rounded-3xl bg-[#090f1d] border border-slate-700/80 p-6 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 shadow-xl group hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GithubIcon className="w-5 h-5 text-amber-400" />
                        <h3 className="font-mono text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-[200px]">
                          {repo.name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                        Público
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed line-clamp-3">
                      {repo.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(repo.language)}`} />
                        <span className="text-white font-bold">{repo.language}</span>
                      </div>
                      <span className="text-amber-300 font-bold">{formatRelativeTime(repo.pushedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 border border-slate-700 group/btn"
                      >
                        <span>Explorar Repositorio</span>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WALKTHROUGH & DEVLOG */}
        {activeTab === "walkthrough" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Bitácora de Ingeniería (Changelog Oficial)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                100% Verificado en Producción
              </span>
            </div>

            <div className="relative border-l-2 border-slate-800 pl-6 sm:pl-8 space-y-10">
              {walkthrough.map((entry, idx) => (
                <div key={idx} className="relative group">
                  {/* Glowing Node on Timeline */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#070d19] border-2 border-amber-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>

                  <div className="rounded-3xl bg-[#090f1d] border border-slate-700/80 p-6 sm:p-7 shadow-xl hover:border-amber-400/50 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-xs font-black">
                          {entry.badge}
                        </span>
                        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                          {entry.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {entry.date}
                      </span>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {entry.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-white">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
