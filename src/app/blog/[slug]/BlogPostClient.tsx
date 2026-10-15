"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  MessageCircle,
  Activity,
  Verified,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import BlogContentRenderer from "./BlogContentRenderer";

interface BlogPostData {
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

interface BlogPostClientProps {
  post: BlogPostData;
  prevPost?: { title: string; slug: string; category?: string } | null;
  nextPost?: { title: string; slug: string; category?: string } | null;
}

export default function BlogPostClient({ post, prevPost, nextPost }: BlogPostClientProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Monitor scroll for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappUrl = `https://wa.me/584129912840?text=Hola%20Alonso,%20leí%20tu%20artículo%20"${encodeURIComponent(
    post.title
  )}"`;

  return (
    <div className="w-full relative">
      {/* 1. STICKY READING PROGRESS BAR & TOP TELEMETRY */}
      <div className="sticky top-20 left-0 w-full z-40 bg-[#070d19]/90 backdrop-blur-md border-b border-slate-800/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5">
        <div
          className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-100 absolute top-0 left-0"
          style={{ width: `${readingProgress}%` }}
        />

        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Link
              href="/blog"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Blog
            </Link>
            <span>/</span>
            <span className="text-slate-300 truncate">
              {post.category || "Desarrollo Web & Rendimiento"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <Clock className="w-3.5 h-3.5" /> {post.readingTime || "8 min"}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {post.createdAt ? format(new Date(post.createdAt), "dd MMM, yyyy", { locale: es }) : "2026"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ARTÍCULO PRINCIPAL */}
      <article className="max-w-4xl mx-auto pt-8 pb-16">
        {/* Header Metadata */}
        <header className="mb-10 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#131d33] border border-slate-700/80 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              {post.category || "Caso de Estudio Real"}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Arquitectura Limpia
            </span>
          </div>

          {/* Monumental Headline */}
          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.12] tracking-tight">
            {post.title}
          </h1>

          {/* Subtitle / Lede */}
          {post.excerpt && (
            <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}

          {/* Author Metadata Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090f1d] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                AR
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090f1d] shadow-[0_0_8px_#67dba9]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">Alonso Ríos</span>
                  <Verified className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Desarrollador Web, Android & Consultor · Caracas / Global
                </div>
              </div>
            </div>

            {/* Social Share & WhatsApp Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Copiar enlace del artículo"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Telemetry Showcase (If telemetry is configured in post) */}
        {post.telemetry?.beforeTime && post.telemetry?.afterTime && (
          <div className="mb-10 bg-[#090f1d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                {post.telemetry.label || "Auditoría Lighthouse · Caso Real"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mediciones Verificadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-rose-500/25">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider block mb-1">
                  ESTADO ANTERIOR
                </span>
                <div className="text-3xl font-mono font-black text-rose-400">
                  {post.telemetry.beforeTime}
                </div>
                <div className="text-xs text-slate-400 mt-1">Carga lenta y exceso de plugins</div>
              </div>

              <div className="bg-[#0f172a] p-5 rounded-2xl border border-emerald-500/35 relative">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                  ARQUITECTURA VELA (DESPUÉS)
                </span>
                <div className="text-3xl font-mono font-black text-emerald-400">
                  {post.telemetry.afterTime}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Score {post.telemetry.score || "100/100"} · Optimizado
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="bg-[#090f1d] rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl">
          <BlogContentRenderer content={post.content} />
        </div>

        {/* 3. AUTHOR BIO & WHATSAPP CONSULTATION FOOTER */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#090f1d] via-[#0f172a] to-[#090f1d] border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0">
              AR
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Escrito por Alonso Ríos
              </span>
              <h4 className="font-editorial text-xl sm:text-2xl text-white font-normal">
                ¿Necesitas aplicar esta arquitectura en tu proyecto?
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Diseño sitios web ultrarrápidos, aplicaciones Android nativas y soluciono problemas de
                rendimiento sin tecnicismos confusos.
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-xl shadow-amber-400/20 shrink-0 transform hover:scale-105"
          >
            Consultar con Alonso
          </a>
        </div>

        {/* 4. PREV / NEXT NAVIGATION CARDS */}
        {(prevPost || nextPost) && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group p-5 rounded-2xl bg-[#090f1d] border border-slate-800 hover:border-amber-400/50 transition flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Artículo Anterior
                </span>
                <span className="font-editorial text-lg text-white group-hover:text-amber-400 transition font-normal line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group p-5 rounded-2xl bg-[#090f1d] border border-slate-800 hover:border-amber-400/50 transition flex flex-col justify-between text-right"
              >
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center justify-end gap-1 mb-2">
                  Siguiente Artículo <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <span className="font-editorial text-lg text-white group-hover:text-amber-400 transition font-normal line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
