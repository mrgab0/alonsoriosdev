"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Download,
  Wifi,
  Sparkles,
  ExternalLink,
  Loader2,
  Layers,
} from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = lazy(() => import("../blog/MDWrapper"));

interface AppPermission {
  name: string;
  description: string;
}

interface AppProject {
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
  permissions: AppPermission[];
  features: string[];
  techStack: string[];
  featured?: boolean;
  published: boolean;
  order: number;
}

const emptyApp: AppProject = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  content: "",
  icon: "",
  version: "1.0.0",
  platform: "Android",
  category: "Herramientas & Productividad",
  status: "upcoming",
  githubUrl: "",
  playStoreUrl: "",
  downloadUrl: "",
  privacyPolicyUrl: "/privacy-remote-keyboard.html",
  permissions: [
    {
      name: "android.permission.INTERNET",
      description: "Requerido únicamente para abrir socket local en la red Wi-Fi compartida.",
    },
    {
      name: "android.permission.ACCESS_NETWORK_STATE",
      description: "Verifica si el dispositivo está conectado a la red Wi-Fi local.",
    },
    {
      name: "android.permission.ACCESS_WIFI_STATE",
      description: "Obtiene la IP local para mostrarla en la pantalla de conexión.",
    },
    {
      name: "android.permission.FOREGROUND_SERVICE",
      description: "Mantiene la conexión activa en segundo plano con notificación en barra de estado.",
    },
    {
      name: "android.permission.VIBRATE",
      description: "Proporciona retroalimentación háptica leve al recibir pulsaciones.",
    },
  ],
  features: [
    "100% Comunicación local sin salida a Internet",
    "Soporte para dictado por voz de Android en tu PC",
    "Conexión instantánea por código QR o dirección IP local",
    "Cero controladores pesados en el ordenador",
    "Servicio en primer plano estable contra ahorro de batería",
    "Cero publicidad, cero analíticas y cero telemetría",
  ],
  techStack: [
    "Android SDK",
    "Kotlin Nativo",
    "Local WebSockets / HTTP",
    "Coroutines & Flow",
    "Android Jetpack",
  ],
  featured: false,
  published: true,
  order: 1,
};

export default function AppsClient() {
  const [apps, setApps] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<AppProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form input helper states
  const [newFeature, setNewFeature] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newPermName, setNewPermName] = useState("");
  const [newPermDesc, setNewPermDesc] = useState("");

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/apps");
      const json = await res.json();
      if (json.success && json.data) {
        setApps(json.data);
      }
    } catch (err) {
      console.error("Error al cargar apps:", err);
      setMessage({ type: "error", text: "Error de red al conectar con el servidor." });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingApp) return;

    if (!editingApp.title.trim()) {
      setMessage({ type: "error", text: "El título de la aplicación es obligatorio." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const isNew = !editingApp._id;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/apps", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingApp),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({
          type: "success",
          text: isNew ? "¡Aplicación creada exitosamente!" : "¡Aplicación actualizada con éxito!",
        });
        setEditingApp(null);
        fetchApps();
      } else {
        setMessage({ type: "error", text: json.error || "Error al guardar la aplicación." });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Error al procesar la solicitud." });
    }
    setSaving(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("¿Seguro que deseas eliminar esta aplicación? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/apps?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Aplicación eliminada correctamente." });
        fetchApps();
      } else {
        setMessage({ type: "error", text: json.error || "Error al eliminar." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error al intentar eliminar la aplicación." });
    }
  };

  const handleAddFeature = () => {
    if (!editingApp || !newFeature.trim()) return;
    setEditingApp({
      ...editingApp,
      features: [...editingApp.features, newFeature.trim()],
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingApp) return;
    setEditingApp({
      ...editingApp,
      features: editingApp.features.filter((_, i) => i !== idx),
    });
  };

  const handleAddTech = () => {
    if (!editingApp || !newTech.trim()) return;
    setEditingApp({
      ...editingApp,
      techStack: [...editingApp.techStack, newTech.trim()],
    });
    setNewTech("");
  };

  const handleRemoveTech = (idx: number) => {
    if (!editingApp) return;
    setEditingApp({
      ...editingApp,
      techStack: editingApp.techStack.filter((_, i) => i !== idx),
    });
  };

  const handleAddPermission = () => {
    if (!editingApp || !newPermName.trim() || !newPermDesc.trim()) return;
    setEditingApp({
      ...editingApp,
      permissions: [
        ...editingApp.permissions,
        { name: newPermName.trim(), description: newPermDesc.trim() },
      ],
    });
    setNewPermName("");
    setNewPermDesc("");
  };

  const handleRemovePermission = (idx: number) => {
    if (!editingApp) return;
    setEditingApp({
      ...editingApp,
      permissions: editingApp.permissions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c1527] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Gestor de Aplicaciones & Software
            </h1>
            <p className="text-xs text-slate-400">
              Administra las fichas de tus apps, políticas legales de privacidad y especificaciones de Google Play.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingApp({ ...emptyApp });
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#070d19] font-black text-xs rounded-xl transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva App</span>
        </button>
      </div>

      {/* Status Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-950/40 text-rose-300 border border-rose-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editor Modal / Workspace */}
      {editingApp ? (
        <div className="bg-[#0c1527] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-lg font-black text-white">
                {editingApp._id ? `Editando: ${editingApp.title}` : "Nueva Ficha de Aplicación"}
              </h2>
            </div>
            <button
              onClick={() => setEditingApp(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Nombre de la App *
              </label>
              <input
                type="text"
                value={editingApp.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const autoSlug = !editingApp._id
                    ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                    : editingApp.slug;
                  setEditingApp({ ...editingApp, title, slug: autoSlug });
                }}
                placeholder="Ej. Remote WiFi Keyboard"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Slug URL *
              </label>
              <input
                type="text"
                value={editingApp.slug}
                onChange={(e) => setEditingApp({ ...editingApp, slug: e.target.value })}
                placeholder="ej. remote-wifi-keyboard"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Versión
              </label>
              <input
                type="text"
                value={editingApp.version}
                onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Plataforma
              </label>
              <input
                type="text"
                value={editingApp.platform}
                onChange={(e) => setEditingApp({ ...editingApp, platform: e.target.value })}
                placeholder="Android (APK / Google Play)"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={editingApp.category}
                onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                placeholder="Herramientas & Utilidades"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Estado de Lanzamiento
              </label>
              <select
                value={editingApp.status}
                onChange={(e) =>
                  setEditingApp({
                    ...editingApp,
                    status: e.target.value as "upcoming" | "beta" | "published",
                  })
                }
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="upcoming">Próximo Lanzamiento (Upcoming)</option>
                <option value="beta">Fase Beta Cerrada</option>
                <option value="published">Publicado / Disponible</option>
              </select>
            </div>
          </div>

          {/* Tagline & Short Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Lema o Frase de Impacto (Tagline)
              </label>
              <input
                type="text"
                value={editingApp.tagline}
                onChange={(e) => setEditingApp({ ...editingApp, tagline: e.target.value })}
                placeholder="Convierte tu teléfono en un teclado inalámbrico ultra veloz para tu PC..."
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Descripción Resumida
              </label>
              <textarea
                rows={3}
                value={editingApp.description}
                onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                placeholder="Aplicación nativa diseñada para resolver necesidades reales sin sobreingeniería..."
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* External URLs: GitHub, Play Store, Privacy Policy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                Repositorio GitHub
              </label>
              <input
                type="text"
                value={editingApp.githubUrl}
                onChange={(e) => setEditingApp({ ...editingApp, githubUrl: e.target.value })}
                placeholder="https://github.com/mrgab0/RemoteWifiKeyboard"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                URL Google Play Store
              </label>
              <input
                type="text"
                value={editingApp.playStoreUrl}
                onChange={(e) => setEditingApp({ ...editingApp, playStoreUrl: e.target.value })}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                URL Política de Privacidad
              </label>
              <input
                type="text"
                value={editingApp.privacyPolicyUrl}
                onChange={(e) => setEditingApp({ ...editingApp, privacyPolicyUrl: e.target.value })}
                placeholder="/privacy-remote-keyboard.html"
                className="w-full bg-[#070d19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Features Builder */}
          <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="block text-xs font-mono font-bold text-white uppercase">
              Características Destacadas
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                placeholder="Escribe una característica y pulsa Agregar..."
                className="flex-1 bg-[#0c1527] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {editingApp.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0f172a] border border-slate-800 text-xs text-slate-300"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Android Permissions Breakdown */}
          <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Permisos Android & Justificación Técnica Legal</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Requerido para Google Play Console
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newPermName}
                onChange={(e) => setNewPermName(e.target.value)}
                placeholder="Permiso (ej. android.permission.INTERNET)"
                className="sm:col-span-5 bg-[#0c1527] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={newPermDesc}
                onChange={(e) => setNewPermDesc(e.target.value)}
                placeholder="Justificación técnica (ej. Solo para sockets locales)"
                className="sm:col-span-5 bg-[#0c1527] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddPermission}
                className="sm:col-span-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {editingApp.permissions.map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#0f172a] border border-slate-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-amber-300 block">{perm.name}</span>
                    <span className="text-slate-400 font-sans">{perm.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePermission(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Tags */}
          <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="block text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Etiquetas de Tecnologías (Tech Stack)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                placeholder="Ej. Kotlin Nativo, WebSockets, Jetpack..."
                className="flex-1 bg-[#0c1527] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {editingApp.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 font-mono"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(idx)}
                    className="text-blue-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Markdown Documentation Editor (Same as Blog!) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold text-white uppercase">
                Documentación Técnica & Contenido en Markdown
              </label>
              <span className="text-xs text-amber-400 font-mono">
                Editor enriquecido con vista previa en vivo
              </span>
            </div>

            <div className="border border-slate-700 rounded-2xl overflow-hidden bg-[#070d19]">
              <Suspense
                fallback={
                  <div className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Cargando Editor Markdown...</span>
                  </div>
                }
              >
                <MDEditor
                  value={editingApp.content}
                  onChange={(val: any) =>
                    setEditingApp({ ...editingApp, content: val || "" })
                  }
                  height={420}
                />
              </Suspense>
            </div>
          </div>

          {/* Visibility and Featured Options */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-white">
              <input
                type="checkbox"
                checked={editingApp.published}
                onChange={(e) =>
                  setEditingApp({ ...editingApp, published: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-400 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span>Publicado en la web (/apps)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-white">
              <input
                type="checkbox"
                checked={editingApp.featured}
                onChange={(e) =>
                  setEditingApp({ ...editingApp, featured: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-400 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span>Destacado (Featured App)</span>
            </label>
          </div>

          {/* Save / Cancel Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setEditingApp(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#070d19] font-black text-xs transition shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Aplicación</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Existing Apps Table / List */}
      <div className="bg-[#0c1527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-black text-white">
            Catálogo de Apps ({apps.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Sincronizado con MongoDB & Google Play Policy
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
            <span>Cargando aplicaciones...</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Smartphone className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-bold">No hay aplicaciones registradas todavía.</p>
            <button
              onClick={() => setEditingApp({ ...emptyApp })}
              className="px-4 py-2 bg-amber-400 text-[#070d19] font-black text-xs rounded-xl"
            >
              Crear primera aplicación
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs uppercase bg-[#091122]">
                  <th className="py-3 px-6">Aplicación</th>
                  <th className="py-3 px-6">Plataforma & Versión</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6">Publicación</th>
                  <th className="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {apps.map((app) => (
                  <tr key={app.slug} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{app.title}</span>
                          <span className="text-xs text-amber-300 font-mono">/apps/{app.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-300 font-mono">
                      <span>{app.platform}</span> · <span className="text-emerald-400 font-bold">v{app.version}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border bg-slate-900 border-slate-700 text-slate-300">
                        {app.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {app.published ? (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Visible
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">
                          Borrador
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/apps/${app.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Ver en vivo"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            setEditingApp({ ...app });
                            setMessage(null);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition"
                          title="Editar Ficha"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
