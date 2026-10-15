"use client";

import React, { useMemo } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { LockedSnippet } from "@/components/LockedSnippet";
import { Activity, Zap, Sparkles, CheckCircle2 } from "lucide-react";

interface BlogContentRendererProps {
  content: string;
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // 1. Pre-procesar ::locked_rest para convertirlo en ::locked que envuelve el resto del texto
  const processedContent = useMemo(() => {
    const readMoreRegex = /::locked_rest\{([^}]+)\}::([\s\S]*)/;
    return content.replace(readMoreRegex, (match, attrs, restOfArticle) => {
      return `::locked{${attrs}}\n${restOfArticle}\n::`;
    });
  }, [content]);

  // 2. Parser modular de bloques personalizados (locked, audit, stats, tip)
  const renderedContent = useMemo(() => {
    // Regex global para capturar cualquiera de los shortcodes soportados
    const shortcodeRegex = /::(locked|audit|stats|tip)\{([^}]*)\}(?:([\s\S]*?)::)?/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = shortcodeRegex.exec(processedContent)) !== null) {
      // Texto normal antes del shortcode
      const normalText = processedContent.substring(lastIndex, match.index);
      if (normalText.trim()) {
        elements.push(
          <div key={`md-${lastIndex}`} className="prose dark:prose-invert max-w-none mb-6">
            <MarkdownPreview
              source={normalText}
              style={{ backgroundColor: "transparent" }}
              wrapperElement={{ "data-color-mode": "dark" }}
            />
          </div>
        );
      }

      const tag = match[1];
      const attrsStr = match[2];
      const bodyContent = match[3] || "";

      // Parsear atributos clave-valor (ej: before="6.4s" after="0.58s")
      const getAttr = (name: string): string => {
        const regex = new RegExp(`${name}="([^"]*)"`);
        const m = attrsStr.match(regex);
        return m ? m[1] : "";
      };

      if (tag === "locked") {
        const type = (getAttr("type") || "email") as "email" | "whatsapp" | "social";
        const title = getAttr("title") || "Contenido Bloqueado";
        elements.push(
          <div key={`locked-${match.index}`} className="my-8">
            <LockedSnippet type={type} title={title}>
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownPreview
                  source={bodyContent}
                  style={{ backgroundColor: "transparent" }}
                  wrapperElement={{ "data-color-mode": "dark" }}
                />
              </div>
            </LockedSnippet>
          </div>
        );
      } else if (tag === "audit") {
        const before = getAttr("before") || "6.4s";
        const after = getAttr("after") || "0.58s";
        const score = getAttr("score") || "100/100";
        const label = getAttr("label") || "Auditoría Lighthouse · Caso Real";

        elements.push(
          <div
            key={`audit-${match.index}`}
            className="my-8 bg-[#090f1d] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {label}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                LIVE / VERIFICADO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-4 sm:p-5 rounded-xl border border-rose-500/25">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider block mb-1">
                  ESTADO INICIAL (STACK TRADICIONAL)
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-rose-400 mb-1">
                  {before}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Sobrecarga innecesaria de librerías y bloqueos de render
                </div>
              </div>

              <div className="bg-[#0f172a] p-4 sm:p-5 rounded-xl border border-emerald-500/35 relative">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                  ARQUITECTURA VELA (ALONSO RÍOS)
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 mb-1">
                  {after}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Score {score} · Rendimiento quirúrgico de primer byte (TTFB)
                </div>
              </div>
            </div>
          </div>
        );
      } else if (tag === "stats") {
        const stat1 = getAttr("stat1") || "+42% Conversión";
        const stat2 = getAttr("stat2") || "-61% Tasa de Rebote";
        const stat3 = getAttr("stat3") || "100/100 PageSpeed";

        const parseStat = (s: string) => {
          const parts = s.split(" ");
          return { value: parts[0] || "", label: parts.slice(1).join(" ") || "" };
        };

        const s1 = parseStat(stat1);
        const s2 = parseStat(stat2);
        const s3 = parseStat(stat3);

        elements.push(
          <div key={`stats-${match.index}`} className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#090f1d] border border-emerald-500/30 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-3xl font-mono font-black text-emerald-400">{s1.value}</div>
              <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">
                {s1.label}
              </div>
            </div>

            <div className="bg-[#090f1d] border border-emerald-500/30 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-3xl font-mono font-black text-emerald-400">{s2.value}</div>
              <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">
                {s2.label}
              </div>
            </div>

            <div className="bg-[#090f1d] border border-amber-500/30 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-3xl font-mono font-black text-amber-400">{s3.value}</div>
              <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">
                {s3.label}
              </div>
            </div>
          </div>
        );
      } else if (tag === "tip") {
        const title = getAttr("title") || "Regla de Oro de Arquitectura";
        elements.push(
          <div
            key={`tip-${match.index}`}
            className="my-6 p-5 sm:p-6 rounded-2xl bg-[#090f1d] border-l-4 border-l-amber-400 border border-slate-800 shadow-xl space-y-2"
          >
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{title}</span>
            </div>
            <div className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
              <MarkdownPreview
                source={bodyContent}
                style={{ backgroundColor: "transparent" }}
                wrapperElement={{ "data-color-mode": "dark" }}
              />
            </div>
          </div>
        );
      }

      lastIndex = shortcodeRegex.lastIndex;
    }

    // Texto normal restante
    const remainingText = processedContent.substring(lastIndex);
    if (remainingText.trim()) {
      elements.push(
        <div key="md-remaining" className="prose dark:prose-invert max-w-none mb-6">
          <MarkdownPreview
            source={remainingText}
            style={{ backgroundColor: "transparent" }}
            wrapperElement={{ "data-color-mode": "dark" }}
          />
        </div>
      );
    }

    return elements.length > 0 ? (
      elements
    ) : (
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownPreview
          source={processedContent}
          style={{ backgroundColor: "transparent" }}
          wrapperElement={{ "data-color-mode": "dark" }}
        />
      </div>
    );
  }, [processedContent]);

  return (
    <div className="w-full text-slate-200 text-base sm:text-lg leading-relaxed font-sans-inter" data-color-mode="dark">
      {renderedContent}
    </div>
  );
}
