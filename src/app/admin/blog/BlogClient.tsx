"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle, Save, X, Eye, Lock, Sparkles, Activity, Quote, Zap, Star, Clock, Languages, Loader2, RefreshCw, Send, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = lazy(() => import("./MDWrapper"));

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category?: string;
  readingTime?: string;
  featured?: boolean;
  telemetry?: {
    beforeTime?: string;
    afterTime?: string;
    score?: string;
    label?: string;
  };
  mediumUrl?: string;
  devtoUrl?: string;
  hashnodeUrl?: string;
  steemUrl?: string;
  crosspostMedium?: boolean;
  crosspostDevTo?: boolean;
  crosspostHashnode?: boolean;
  crosspostSteem?: boolean;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyPost: BlogPost = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  category: "Desarrollo Web & Rendimiento",
  readingTime: "5 min de lectura",
  featured: false,
  telemetry: {
    beforeTime: "",
    afterTime: "",
    score: "",
    label: "",
  },
  crosspostMedium: false,
  crosspostDevTo: false,
  crosspostHashnode: false,
  crosspostSteem: false,
  published: false,
};

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Autopilot con IA states
  const [isAutopilotOpen, setIsAutopilotOpen] = useState(false);
  const [autopilotTopic, setAutopilotTopic] = useState("");
  const [autopilotKeywords, setAutopilotKeywords] = useState("");
  const [autopilotCategory, setAutopilotCategory] = useState("Desarrollo Web & Rendimiento");
  const [autopilotLanguage, setAutopilotLanguage] = useState<"es" | "en">("es");
  const [generatingAutopilot, setGeneratingAutopilot] = useState(false);
  const [autopilotMode, setAutopilotMode] = useState<"editor" | "publish">("editor");
  const [autopilotError, setAutopilotError] = useState("");
  const [autopilotSuccessMsg, setAutopilotSuccessMsg] = useState("");
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) setPosts(json.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPost) return;
    setSaving(true);
    try {
      const isNew = !editingPost._id;
      const res = await fetch("/api/admin/blog", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost),
      });
      const json = await res.json();
      if (json.success) {
        setEditingPost(null);
        fetchPosts();
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      alert("Error saving post");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar este post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutopilotGenerate = async (mode: "editor" | "publish") => {
    if (!autopilotTopic.trim()) {
      setAutopilotError("Por favor ingresa un tema o idea técnica.");
      return;
    }

    setGeneratingAutopilot(true);
    setAutopilotMode(mode);
    setAutopilotError("");
    setAutopilotSuccessMsg("");

    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: autopilotTopic.trim(),
          keywords: autopilotKeywords.trim(),
          category: autopilotCategory,
          language: autopilotLanguage,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.post) {
        setAutopilotError(json.error || "Error al generar contenido con la IA.");
        setGeneratingAutopilot(false);
        return;
      }

      const post = json.post;

      if (mode === "publish") {
        const saveRes = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.suggestedImage,
            category: post.category || autopilotCategory,
            readingTime: post.readingTime || "6 min de lectura",
            featured: false,
            telemetry: post.telemetry,
            published: true,
          }),
        });

        const saveJson = await saveRes.json();
        if (saveJson.success) {
          setAutopilotSuccessMsg(`¡Publicado con éxito! "${post.title}"`);
          fetchPosts();
          setTimeout(() => {
            setIsAutopilotOpen(false);
            setAutopilotTopic("");
            setAutopilotKeywords("");
            setAutopilotSuccessMsg("");
          }, 1800);
        } else {
          setAutopilotError(saveJson.error || "Artículo generado pero ocurrió un error al guardarlo.");
        }
      } else {
        setEditingPost({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.suggestedImage,
          category: post.category || autopilotCategory,
          readingTime: post.readingTime || "6 min de lectura",
          featured: false,
          telemetry: post.telemetry,
          published: true,
          crosspostDevTo: false,
          crosspostMedium: false,
          crosspostHashnode: false,
          crosspostSteem: false,
        });
        setIsAutopilotOpen(false);
      }
    } catch (err: any) {
      setAutopilotError("Error de conexión al procesar la solicitud de Autopilot.");
    } finally {
      setGeneratingAutopilot(false);
    }
  };

  const handleTranslate = async (post: BlogPost) => {
    if (!post._id) return;
    if (!confirm(`¿Deseas traducir el artículo "${post.title}" con Inteligencia Artificial?`)) return;

    setTranslatingId(post._id);
    try {
      const res = await fetch("/api/admin/blog/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, targetLanguage: "en" }),
      });
      const json = await res.json();
      if (json.success && json.translation) {
        setEditingPost({
          ...post,
          _id: undefined,
          title: json.translation.title,
          slug: json.translation.slug,
          excerpt: json.translation.excerpt,
          content: json.translation.content,
          published: false,
        });
      } else {
        alert("Error al traducir: " + (json.error || "Desconocido"));
      }
    } catch (err) {
      alert("Error de conexión al traducir");
    } finally {
      setTranslatingId(null);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success) {
          return { success: true, url: json.url, name: file.name };
        }
        return { success: false, error: json.error };
      });

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (failedUploads.length > 0) {
        alert(`Hubo error al subir ${failedUploads.length} imágenes.`);
      }

      if (successfulUploads.length > 0) {
        if (isCover) {
          setEditingPost(prev => prev ? { ...prev, coverImage: successfulUploads[0].url } : null);
        } else {
          const markdownToAppend = successfulUploads.map(r => `\n![${r.name}](${r.url})\n`).join("");
          
          setEditingPost(prev => {
            if (!prev) return prev;
            let newContent = prev.content;
            if (contentTextareaRef.current) {
              const textarea = contentTextareaRef.current;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const before = newContent.substring(0, start);
              const after = newContent.substring(end);
              newContent = before + markdownToAppend + after;
            } else {
              newContent += markdownToAppend;
            }
            return { ...prev, content: newContent };
          });
        }
      }
    } catch (err) {
      alert("Error subiendo imágenes");
    }
    setUploadingImage(false);
    
    // Limpiar input para permitir subir la misma imagen si se desea de nuevo
    e.target.value = "";
  };

  const insertSnippetAtCursor = (snippet: string) => {
    if (!editingPost) return;
    let newContent = editingPost.content;
    if (contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = newContent.substring(0, start);
      const after = newContent.substring(end);
      newContent = before + snippet + after;
    } else {
      newContent += snippet;
    }
    setEditingPost({ ...editingPost, content: newContent });
  };

  const handleInsertLockedSnippet = () => {
    insertSnippetAtCursor(`\n\n::locked{type="email" title="Déjame tu email para desbloquear este recurso"}\nAquí va el contenido secreto, descargas o código fuente...\n::\n\n`);
  };

  const handleInsertReadMoreSnippet = () => {
    insertSnippetAtCursor(`\n\n::locked_rest{type="youtube" title="Suscríbete a YouTube para leer la Parte 2"}::\n\n`);
  };

  const handleInsertAuditSnippet = () => {
    insertSnippetAtCursor(`\n\n::audit{before="6.4s" after="0.58s" score="100/100" label="Lighthouse Web Vitals · Caso Real"}::\n\n`);
  };

  const handleInsertStatsSnippet = () => {
    insertSnippetAtCursor(`\n\n::stats{stat1="+42% Conversión" stat2="-61% Tasa de Rebote" stat3="100/100 PageSpeed"}::\n\n`);
  };

  const handleInsertQuoteSnippet = () => {
    insertSnippetAtCursor(`\n\n> **"Aquí va una cita técnica, reflexión o mantra de arquitectura destacada..."**\n\n`);
  };

  const handleInsertTipSnippet = () => {
    insertSnippetAtCursor(`\n\n::tip{title="Regla de Oro de Arquitectura"}\nAquí redactas la recomendación técnica o lección aprendida...\n::\n\n`);
  };

  const autoCalculateReadingTime = () => {
    if (!editingPost) return;
    const words = editingPost.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    setEditingPost({ ...editingPost, readingTime: `${minutes} min de lectura` });
  };

  if (loading && !editingPost) {
    return <div className="p-8 text-white">Cargando posts...</div>;
  }

  if (editingPost) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-amber-400">
            {editingPost._id ? "Editar Post" : "Nuevo Post"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        <div className="bg-[#121b2d] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white font-bold mb-1">Ttulo</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const autoSlug = newTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                  setEditingPost(prev => prev ? { 
                    ...prev, 
                    title: newTitle,
                    slug: prev._id ? prev.slug : autoSlug
                  } : null);
                }}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="El ttulo de tu artculo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white font-bold mb-1">URL amigable (Slug)</label>
              <input
                type="text"
                value={editingPost.slug}
                onChange={(e) => {
                  const sanitized = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setEditingPost({ ...editingPost, slug: sanitized });
                }}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="mi-articulo-genial (Opcional, se autogenera)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-1">Resumen (Excerpt)</label>
            <textarea
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none h-20 placeholder-white placeholder-opacity-100 font-bold"
              placeholder="Breve descripcin de qu trata el artculo..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-white font-bold">Imagen de Portada</label>
            <div className="flex gap-4 items-center">
              {editingPost.coverImage && (
                <img src={editingPost.coverImage} alt="Cover" className="w-32 h-20 object-cover rounded-lg border border-gray-700" />
              )}
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                <ImageIcon className="w-4 h-4" />
                {uploadingImage ? "Subiendo..." : "Subir a GitHub"}
                <input type="file" accept="image/*" className="hidden placeholder-white placeholder-opacity-100 font-bold" onChange={(e) => handleUploadImage(e, true)} disabled={uploadingImage} />
              </label>
              <input
                type="text"
                value={editingPost.coverImage}
                onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                className="flex-1 bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="O pega la URL de Medium/Hashnode aquí"
              />
            </div>
          </div>

          {/* Categoría y Tiempo de Lectura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white font-bold mb-1">Categoría Temática</label>
              <select
                value={editingPost.category || "Desarrollo Web & Rendimiento"}
                onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
              >
                <option value="Desarrollo Web & Rendimiento">Desarrollo Web & Rendimiento</option>
                <option value="Android & Kotlin">Android & Kotlin</option>
                <option value="SEO & Negocios">SEO & Negocios</option>
                <option value="Seguridad & Servidores">Seguridad & Servidores</option>
                <option value="Tutoriales Paso a Paso">Tutoriales Paso a Paso</option>
                <option value="Filosofía & Aprendizaje">Filosofía & Aprendizaje</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-white font-bold">Tiempo de Lectura</label>
                <button
                  type="button"
                  onClick={autoCalculateReadingTime}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Clock className="w-3 h-3" /> Calcular auto
                </button>
              </div>
              <input
                type="text"
                value={editingPost.readingTime || "5 min de lectura"}
                onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                placeholder="Ej. 8 min de lectura"
              />
            </div>
          </div>

          {/* Destacado Hero y Telemetría Lighthouse */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="featured-hero" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="featured-hero"
                  checked={!!editingPost.featured}
                  onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                  className="w-5 h-5 accent-amber-400"
                />
                <div>
                  <span className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400" /> Marcar como Artículo Principal (Hero Destacado en /blog)
                  </span>
                  <span className="text-xs text-slate-300 block font-medium">
                    Se mostrará con diseño monumental y tarjeta de telemetría en la cabecera de la página de Blog.
                  </span>
                </div>
              </label>
            </div>

            {/* Opciones de Telemetría Before / After */}
            <div className="pt-2 border-t border-amber-500/20">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Métricas de Auditoría Lighthouse (Opcional, para widget de telemetría):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Antes (ej. 6.4s)</label>
                  <input
                    type="text"
                    value={editingPost.telemetry?.beforeTime || ""}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      telemetry: { ...editingPost.telemetry, beforeTime: e.target.value }
                    })}
                    placeholder="6.4s"
                    className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-xs text-rose-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Después (ej. 0.58s)</label>
                  <input
                    type="text"
                    value={editingPost.telemetry?.afterTime || ""}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      telemetry: { ...editingPost.telemetry, afterTime: e.target.value }
                    })}
                    placeholder="0.58s"
                    className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Score (ej. 100/100)</label>
                  <input
                    type="text"
                    value={editingPost.telemetry?.score || ""}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      telemetry: { ...editingPost.telemetry, score: e.target.value }
                    })}
                    placeholder="100/100"
                    className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-xs text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Etiqueta</label>
                  <input
                    type="text"
                    value={editingPost.telemetry?.label || ""}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      telemetry: { ...editingPost.telemetry, label: e.target.value }
                    })}
                    placeholder="Web Vitals"
                    className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-800">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Visibilidad Original</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4 accent-amber-400"
                />
                <label htmlFor="published" className="text-sm text-white font-bold cursor-pointer">
                  Artculo Pblico (Visible en alonsorios.dev)
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white mb-2">Sindicacin Mgica (Crossposting)</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-devto"
                    checked={editingPost.crosspostDevTo}
                    disabled={!!editingPost.devtoUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostDevTo: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-devto" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Dev.to {editingPost.devtoUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-medium"
                    checked={editingPost.crosspostMedium}
                    disabled={!!editingPost.mediumUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostMedium: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-medium" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Medium {editingPost.mediumUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-hashnode"
                    checked={editingPost.crosspostHashnode}
                    disabled={!!editingPost.hashnodeUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostHashnode: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-hashnode" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Hashnode {editingPost.hashnodeUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-steem"
                    checked={editingPost.crosspostSteem}
                    disabled={!!editingPost.steemUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostSteem: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-steem" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Steem {editingPost.steemUrl && "(Ya clonado)"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800" data-color-mode="dark">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <label className="block text-sm font-semibold text-white font-bold">Contenido (Visual Markdown)</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  type="button"
                  onClick={handleInsertAuditSnippet}
                  title="Insertar widget de Auditoría Before vs After"
                  className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" /> Auditoría
                </button>
                <button
                  type="button"
                  onClick={handleInsertStatsSnippet}
                  title="Insertar tarjetas de métricas de impacto"
                  className="bg-blue-600/80 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" /> Métricas
                </button>
                <button
                  type="button"
                  onClick={handleInsertQuoteSnippet}
                  title="Insertar cita o frase editorial destacada"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Quote className="w-3.5 h-3.5" /> Cita
                </button>
                <button
                  type="button"
                  onClick={handleInsertTipSnippet}
                  title="Insertar recuadro de recomendación o regla de oro"
                  className="bg-amber-600/80 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Tip / Alerta
                </button>
                <button
                  type="button"
                  onClick={handleInsertLockedSnippet}
                  className="bg-purple-600/80 hover:bg-purple-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" /> Paywall
                </button>
                <button
                  type="button"
                  onClick={handleInsertReadMoreSnippet}
                  className="bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" /> Leer Más
                </button>
                <label className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-gray-900 px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition shadow-sm">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                  <input type="file" accept="image/*" multiple className="hidden placeholder-white placeholder-opacity-100 font-bold" onChange={(e) => handleUploadImage(e, false)} disabled={uploadingImage} />
                </label>
              </div>
            </div>
            {uploadingImage && (
              <div className="mb-2 text-xs text-amber-400 bg-amber-400/10 p-2 rounded border border-amber-400/20">
                La imagen se está subiendo... el link se insertará donde esté tu cursor.
              </div>
            )}
            <Suspense fallback={<div className="h-[500px] bg-[#0a1120] text-white font-bold p-4 border border-gray-700 rounded-lg flex items-center justify-center placeholder-white placeholder-opacity-100 font-bold">Cargando editor visual...</div>}>
              <MDEditor
                value={editingPost.content}
                onChange={(val: string | undefined) => setEditingPost({ ...editingPost, content: val || "" })}
                height={500}
                preview="edit"
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg overflow-hidden"
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-amber-400 mb-2">Blog Admin</h1>
          <p className="text-white font-bold">Gestiona tus artículos, Autopilot con IA y cross-posting</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutopilotOpen(true)}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-gray-950 font-black px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <Sparkles className="w-5 h-5 fill-gray-950" />
            Autopilot con IA
          </button>
          <button
            onClick={() => setEditingPost({ ...emptyPost })}
            className="bg-[#121b2d] hover:bg-[#1a263d] text-white border border-gray-700 font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            Nuevo Artículo
          </button>
        </div>
      </div>

      <div className="bg-[#121b2d] border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#0a1120] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Artculo</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Estado</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Fecha</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white font-bold">
                  No tienes ningn artculo publicado.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr 
                  key={post._id} 
                  onClick={() => setEditingPost(post)}
                  className="border-b border-gray-800 hover:bg-white/5 transition cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.featured && (
                        <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                          <Star className="w-3 h-3 fill-amber-400" /> HERO
                        </span>
                      )}
                      {post.category && (
                        <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-white mb-0.5">{post.title}</div>
                    <div className="text-xs text-slate-400 font-mono truncate max-w-md">/blog/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-500/10 text-white font-bold text-xs font-bold px-2.5 py-1 rounded-full border border-gray-500/20">
                        <Eye className="w-3.5 h-3.5" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-bold">
                    {post.createdAt ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es }) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTranslate(post); }}
                        disabled={translatingId === post._id}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition disabled:opacity-50"
                        title="Traducir a Inglés con IA"
                      >
                        {translatingId === post._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        ) : (
                          <Languages className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPost(post); }}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); post._id && handleDelete(post._id); }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Autopilot con IA */}
      {isAutopilotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => !generatingAutopilot && setIsAutopilotOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
              disabled={generatingAutopilot}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-400">Autopilot Técnico con IA</h3>
                <p className="text-xs text-white font-bold">Generación con Google Gemini (Cascada de 6 Modelos)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-1.5">
                  Tema o Idea Técnica del Artículo:
                </label>
                <input
                  type="text"
                  value={autopilotTopic}
                  onChange={(e) => setAutopilotTopic(e.target.value)}
                  placeholder="Ej: Cómo optimizar Core Web Vitals en Next.js 15 para alcanzar 100 en PageSpeed"
                  className="w-full bg-[#070d19] border border-gray-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  disabled={generatingAutopilot}
                />
              </div>

              {/* Ideas Rápidas */}
              <div>
                <span className="text-xs font-bold text-amber-400 block mb-1">Ideas sugeridas de alta conversión:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Optimización de LCP y Core Web Vitals en Next.js 15",
                    "Arquitectura MVI en Android Nativo con Jetpack Compose",
                    "Auditoría y Desinfección de Sitios Web Hackeados",
                    "Por qué elegir TypeScript estricto en proyectos de alta escala",
                  ].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setAutopilotTopic(idea)}
                      className="text-[11px] bg-white/5 hover:bg-amber-400/10 text-white font-bold border border-gray-700 hover:border-amber-400/50 px-2.5 py-1 rounded-lg transition"
                      disabled={generatingAutopilot}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Categoría:
                  </label>
                  <select
                    value={autopilotCategory}
                    onChange={(e) => setAutopilotCategory(e.target.value)}
                    className="w-full bg-[#070d19] border border-gray-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    disabled={generatingAutopilot}
                  >
                    <option value="Desarrollo Web & Rendimiento">Desarrollo Web & Rendimiento</option>
                    <option value="Apps Android Nativas">Apps Android Nativas</option>
                    <option value="Ciberseguridad & Recuperación">Ciberseguridad & Recuperación</option>
                    <option value="SEO Técnico & Google">SEO Técnico & Google</option>
                    <option value="Tutoriales & Arquitectura">Tutoriales & Arquitectura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Palabras Clave Secundarias (Opcional):
                  </label>
                  <input
                    type="text"
                    value={autopilotKeywords}
                    onChange={(e) => setAutopilotKeywords(e.target.value)}
                    placeholder="Ej: LCP, FID, SSR, Vercel"
                    className="w-full bg-[#070d19] border border-gray-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                    disabled={generatingAutopilot}
                  />
                </div>
              </div>

              {autopilotError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
                  {autopilotError}
                </div>
              )}

              {autopilotSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {autopilotSuccessMsg}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleAutopilotGenerate("editor")}
                  disabled={generatingAutopilot}
                  className="flex-1 bg-[#121b2d] hover:bg-[#1a263d] text-white border border-amber-400/50 font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {generatingAutopilot && autopilotMode === "editor" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Redactando artículo...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 text-amber-400" />
                      Cargar en Editor (Revisar)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleAutopilotGenerate("publish")}
                  disabled={generatingAutopilot}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-950 font-black p-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {generatingAutopilot && autopilotMode === "publish" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                      Publicando con Autopilot...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-gray-950" />
                      Publicar en 1-Clic
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
