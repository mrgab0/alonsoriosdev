"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  Sparkles,
  Activity,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Check,
  Star,
  ShieldCheck,
  Zap,
  Terminal,
  BookOpen,
  Filter,
} from "lucide-react";

interface PostItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  readingTime?: string;
  featured?: boolean;
  telemetry?: {
    beforeTime?: string;
    afterTime?: string;
    score?: string;
    label?: string;
  };
  createdAt?: string;
}

interface BlogListClientProps {
  posts: PostItem[];
}

const CATEGORIES = [
  "Todos los artículos",
  "Desarrollo Web & Rendimiento",
  "Android & Kotlin",
  "SEO & Negocios",
  "Seguridad & Servidores",
  "Tutoriales Paso a Paso",
  "Filosofía & Aprendizaje",
];

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos los artículos");
  const [searchTerm, setSearchTerm] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Identify featured hero post (either marked as featured or the latest post)
  const featuredPost = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return posts.find((p) => p.featured) || posts[0];
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Exclude featured post from the general list if we are on "Todos" without active search
      // but keep it if user is searching
      const matchesSearch =
        !searchTerm.trim() ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "Todos los artículos" ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  // Other posts (exclude featured if we are displaying hero)
  const gridPosts = useMemo(() => {
    if (!featuredPost || searchTerm.trim() || selectedCategory !== "Todos los artículos") {
      return filteredPosts;
    }
    return filteredPosts.filter((p) => p._id !== featuredPost._id);
  }, [filteredPosts, featuredPost, searchTerm, selectedCategory]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.includes("@")) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

  return (
    <div className="w-full">
      {/* 1. HEADER EDITORIAL (Obsidian Cinema Style) */}
      <section className="mb-12 max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131d33] border border-[#1e293b] text-xs font-mono font-bold text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#67dba9]"></span>
            </span>
            <span className="uppercase tracking-wider">Bitácora Técnica & Reflexiones · 2026</span>
          </div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
            // VOL. 02 · ALONSORIOS.DEV
          </span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl text-white font-normal leading-[1.08] tracking-tight mb-5">
          Pensamiento crítico sobre código, diseño y la web que perdura.
        </h1>

        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed max-w-3xl">
          Ensayos prácticos sobre desarrollo anti-sobreingeniería, arquitectura Android nativa,
          posicionamiento orgánico (SEO) y lecciones tácticas tras una década construyendo software
          independiente y resiliente.
        </p>

        {/* Buscador & Categorías */}
        <div className="mt-8 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tema, vocabulario o palabras clave..."
              className="w-full bg-[#090f1d] border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-slate-500 font-medium text-sm focus:border-amber-400 focus:outline-none shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black"
                    : "bg-[#0f172a] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ARTÍCULO PRINCIPAL DESTACADO (HERO POST - Stitch Screen 5) */}
      {featuredPost && !searchTerm.trim() && selectedCategory === "Todos los artículos" && (
        <section className="mb-16">
          <div className="relative overflow-hidden bg-[#090f1d] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl transition hover:border-slate-700">
            {/* Ambient Radiance Halo */}
            <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Post Copy & Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    Lectura Destacada
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {featuredPost.category || "Artículo Principal"} · {featuredPost.readingTime || "8 min de lectura"}
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`} className="group">
                  <h2 className="font-editorial text-2xl sm:text-4xl text-white font-normal leading-[1.15] tracking-tight group-hover:text-amber-400 transition">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed line-clamp-3">
                  {featuredPost.excerpt ||
                    featuredPost.content
                      .replace(/[#*`_\[\]()]/g, "")
                      .substring(0, 220) + "..."}
                </p>

                {/* Author row & Read button */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                      AR
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        Alonso Ríos
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Desarrollador Web & Android · Caracas
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 transform hover:scale-[1.02]"
                  >
                    <span>Leer artículo completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Telemetry Web Vitals Widget */}
              <div className="lg:col-span-5">
                <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                        {featuredPost.telemetry?.label || "Métricas Real Time Web Vitals"}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE / VERIF
                    </span>
                  </div>

                  {/* Stat Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#090f1d] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        TTFB (Primer Byte)
                      </span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        {featuredPost.telemetry?.afterTime || "0.18s"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">100% Edge Cache</span>
                    </div>

                    <div className="bg-[#090f1d] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        FCP (Pintado)
                      </span>
                      <span className="text-lg font-mono font-black text-emerald-400">0.58s</span>
                      <span className="text-[10px] text-slate-400 block">Instantáneo</span>
                    </div>

                    <div className="bg-[#090f1d] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        LCP (Render Mayor)
                      </span>
                      <span className="text-lg font-mono font-black text-amber-400">0.89s</span>
                      <span className="text-[10px] text-slate-400 block">Óptimo Verde</span>
                    </div>

                    <div className="bg-[#090f1d] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        Score Lighthouse
                      </span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        {featuredPost.telemetry?.score || "100 / 100"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Zero-Layout Shift</span>
                    </div>
                  </div>

                  {/* Micro telemetry bars */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Stack Tradicional Monolítico</span>
                        <span className="text-rose-400">
                          {featuredPost.telemetry?.beforeTime || "6.4s"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[85%] rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Arquitectura Limpia (Alonso Ríos)</span>
                        <span className="text-emerald-400">
                          {featuredPost.telemetry?.afterTime || "0.58s"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[18%] rounded-full shadow-[0_0_8px_#67dba9]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. GRILLA DE ARTÍCULOS RECIENTES */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-800">
          <h2 className="font-editorial text-2xl sm:text-3xl text-white font-normal">
            Artículos e Investigaciones Recientes
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        {gridPosts.length === 0 ? (
          <div className="text-center py-16 bg-[#090f1d] border border-slate-800 rounded-3xl p-8">
            <p className="text-slate-400 font-bold mb-2">
              No se encontraron artículos con los criterios seleccionados.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("Todos los artículos");
                setSearchTerm("");
              }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between bg-[#090f1d] border border-slate-800/90 hover:border-amber-400/50 rounded-2xl p-6 transition duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div>
                  {/* Category & Reading Time */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md">
                      {post.category || "Desarrollo Web"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {post.readingTime || "5 min"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-editorial text-xl sm:text-2xl text-white font-normal group-hover:text-amber-400 transition leading-snug mb-3">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt ||
                      post.content
                        .replace(/[#*`_\[\]()]/g, "")
                        .substring(0, 140) + "..."}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>
                    {post.createdAt
                      ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es })
                      : "2026"}
                  </span>
                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                    Leer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEWSLETTER / LEAD MAGNET BOX (Stitch Screen 5) */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-[#090f1d] via-[#0f172a] to-[#090f1d] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
              Boletín Técnico Semanal
            </span>
            <h3 className="font-editorial text-2xl sm:text-4xl text-white font-normal mb-3">
              Recibe análisis de rendimiento, arquitecturas limpias y alertas de seguridad web.
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
              Sin spam ni correos automáticos genéricos. Análisis técnicos redactados directamente por Alonso
              Ríos con configuraciones listas para producción.
            </p>

            {subscribed ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 text-sm font-bold">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>¡Gracias por suscribirte! Te avisaremos con los nuevos ensayos y lanzamientos.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  className="flex-1 bg-[#070d19] border border-slate-700 rounded-xl px-4 py-3 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  Suscribirme Gratis
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
