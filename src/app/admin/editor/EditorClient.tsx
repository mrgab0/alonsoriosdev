"use client";

import React, { useEffect, useState } from "react";
import { Palette, Save, CheckCircle2, RefreshCw, Eye, ExternalLink, RotateCcw, Layout, MessageSquare, BookOpen, Wrench, Camera, User } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

const DEFAULT_CONFIG = {
  theme: {
    backgroundColor: "#0a1120",
    textColor: "#ffffff",
    cardBackgroundColor: "#121b2d",
    cardBorderColor: "#1e2a42",
    buttonColor: "#fbbf24",
    buttonTextColor: "#0a1120",
    buttonBorderRadius: "rounded-xl",
    accentColor: "#fbbf24",
    fontSizeScale: "normal",
  },
  sections: {
    hero: {
      statusBadge: "Disponible para Sitios Web, Apps Android y Cursos",
      title: "Páginas Web, Apps Android y SEO",
      titleHighlight: "sin complicaciones",
      subtitle:
        "Hola, soy Alonso Ríos. Ayudo a personas y negocios a crear sitios web profesionales, recuperar páginas caídas o con fallas, desarrollar aplicaciones Android y aprender programación de forma sencilla.",
      avatarUrl: "",
      avatarInitials: "AR",
      profileName: "Alonso Ríos",
      profileRole: "Desarrollador Web, Android & Creador de Contenido",
      profileBio: "Resolver problemas técnicos complejos en lenguaje amigable y sin enredos.",
      primaryCtaText: "Ver Servicios y Precios",
      primaryCtaUrl: "#servicios",
      secondaryCtaText: "Hablar por WhatsApp",
      secondaryCtaUrl: "https://wa.me/584129912840?text=Hola%20Alonso",
    },
    services: {
      title: "Servicios Principales",
      subtitle: "Selecciona lo que necesitas y te entregaré una solución transparente y eficiente.",
      items: [
        {
          icon: "Globe",
          badge: "Páginas Web",
          title: "Creación y Diseño de Sitios Web",
          description: "Sitios profesionales, ultrarrápidos y fáciles de usar en cualquier teléfono o computador.",
          benefits: ["Adaptado a celulares", "Botón directo de WhatsApp", "Sin costos ocultos"],
        },
        {
          icon: "RefreshCw",
          badge: "Urgencias",
          title: "Recuperación de Sitios Web",
          description: "Si tu página se cayó, fue infectada con virus o tiene errores de servidor, la recupero de inmediato.",
          benefits: ["Desinfección de malware", "Restauración de copias", "Protección anti-hackeo"],
        },
        {
          icon: "Smartphone",
          badge: "Android Apps",
          title: "Aplicaciones Móviles Android",
          description: "Desarrollo de aplicaciones nativas para el sistema Android con publicación en Google Play Store.",
          benefits: ["Publicación en Play Store", "Uso fluido y fácil", "Soporte personalizado"],
        },
      ],
    },
    coursesAndBooks: {
      title: "Mis Libros y Cursos de Aprendizaje",
      subtitle: "Material educativo pensado para enseñar tecnología de forma amigable, paso a paso y sin tecnicismos innecesarios.",
    },
    contact: {
      title: "Contacto Directo",
      subtitle: "Respuestas en menos de 24 horas. Atención directa y en español claro por Alonso Ríos.",
      whatsappNumber: "+584129912840",
      email: "iirockalonso@gmail.com",
      location: "Chile • Proyectos para todo el mundo hispanohablante",
      telegramWebhookUrl: "",
      discordWebhookUrl: "",
      resendApiKey: "",
    },
  },
};

export default function EditorClient() {
  const { refreshConfig } = useConfig();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"theme" | "hero" | "services" | "courses" | "contact">("hero");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setConfig(data.data);
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      })
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      await refreshConfig();
      setStatusMsg(data.message || "Configuración guardada con éxito.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch {
      setStatusMsg("Guardado correctamente.");
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("¿Seguro que deseas restaurar todos los textos y foto de perfil a sus valores por defecto?")) {
      return;
    }
    setResetting(true);
    setConfig(DEFAULT_CONFIG);
    try {
      await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_CONFIG),
      });
      await refreshConfig();
      setStatusMsg("Configuración restaurada a valores por defecto.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch {
      setStatusMsg("Restaurado correctamente.");
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setResetting(false);
    }
  };

  const openLivePreview = () => {
    window.open("/", "_blank");
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white font-black">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-amber-400" />
        <span>Cargando editor visual...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42]">
        <div>
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
            Personalización Total
          </span>
          <h2 className="text-2xl font-black text-white">Editor de Secciones & Foto de Perfil</h2>
          <p className="text-xs font-extrabold text-white">
            Edita tu foto de perfil, datos personales, colores y textos del Home en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {statusMsg && (
            <span className="text-xs text-emerald-400 font-black flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMsg}</span>
            </span>
          )}

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="bg-[#1e2a42] hover:bg-slate-700 text-white font-black px-4 py-3 rounded-xl transition text-xs flex items-center gap-2 border border-slate-700/60"
            title="Restaurar a valores por defecto"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>{resetting ? "Restaurando..." : "Restaurar por Defecto"}</span>
          </button>

          {/* Live Preview Button */}
          <button
            onClick={openLivePreview}
            className="bg-[#1e2a42] hover:bg-slate-700 text-white font-black px-4 py-3 rounded-xl transition text-xs flex items-center gap-2 border border-slate-700/60"
            title="Abrir vista previa del sitio en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Ver Sitio en Vivo</span>
          </button>

          {/* Save Button (Yellow Button -> Black Text) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a1120] font-black px-6 py-3 rounded-xl transition text-sm flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 bg-[#121b2d] p-2 rounded-2xl border border-[#1e2a42] text-xs font-black scrollbar-none">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
            activeTab === "hero" ? "bg-amber-400 text-[#0a1120]" : "text-white hover:bg-[#1e2a42]"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>1. Foto de Perfil & Hero</span>
        </button>

        <button
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
            activeTab === "theme" ? "bg-amber-400 text-[#0a1120]" : "text-white hover:bg-[#1e2a42]"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Estilos & Tema</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
            activeTab === "services" ? "bg-amber-400 text-[#0a1120]" : "text-white hover:bg-[#1e2a42]"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>3. Servicios Principales</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
            activeTab === "courses" ? "bg-amber-400 text-[#0a1120]" : "text-white hover:bg-[#1e2a42]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>4. Cursos & Libros</span>
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 ${
            activeTab === "contact" ? "bg-amber-400 text-[#0a1120]" : "text-white hover:bg-[#1e2a42]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>5. Contacto & Webhooks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form Columns */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB 1: Hero & Profile Photo Editor */}
          {activeTab === "hero" && (
            <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-6">
              <div className="flex items-center gap-2 text-amber-400 border-b border-[#1e2a42] pb-3">
                <Camera className="w-5 h-5" />
                <h3 className="text-lg font-black text-white">Foto de Perfil & Tarjeta Personal</h3>
              </div>

              {/* Profile Photo URL & Preview */}
              <div className="p-4 bg-[#0a1120] rounded-2xl border border-[#1e2a42] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-[#0a1120] rounded-[14px] overflow-hidden flex items-center justify-center text-white font-black text-xl">
                      {config.sections?.hero?.avatarUrl ? (
                        <img
                          src={config.sections.hero.avatarUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{config.sections?.hero?.avatarInitials || "AR"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-black text-white">
                      URL de tu Foto de Perfil (JPG, PNG, WebP)
                    </label>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/mi-foto-de-perfil.jpg"
                      value={config.sections?.hero?.avatarUrl || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, avatarUrl: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#121b2d] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white font-black placeholder:text-slate-500"
                    />
                    <span className="text-[11px] text-white font-extrabold block">
                      Deja vacío si deseas usar solo las iniciales estilizadas.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-black text-white mb-1">
                      Iniciales de Reserva
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={config.sections?.hero?.avatarInitials || "AR"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, avatarInitials: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#121b2d] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white font-black uppercase text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-white mb-1">
                      Nombre Oficial
                    </label>
                    <input
                      type="text"
                      value={config.sections?.hero?.profileName || "Alonso Ríos"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, profileName: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#121b2d] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-white mb-1">
                      Cargo / Título Profesional
                    </label>
                    <input
                      type="text"
                      value={config.sections?.hero?.profileRole || "Desarrollador Web, Android & Creador de Contenido"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, profileRole: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#121b2d] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white mb-1">
                      Lema / Biografía Corta
                    </label>
                    <input
                      type="text"
                      value={config.sections?.hero?.profileBio || "Resolver problemas técnicos complejos en lenguaje amigable y sin enredos."}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, profileBio: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#121b2d] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Headlines */}
              <div className="space-y-4 pt-2 border-t border-[#1e2a42]">
                <h4 className="text-sm font-black text-amber-400">Titulares de la Sección Hero</h4>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Insignia de Estado (Badge superior)
                  </label>
                  <input
                    type="text"
                    value={config.sections?.hero?.statusBadge || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          hero: { ...config.sections.hero, statusBadge: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white mb-1">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={config.sections?.hero?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, title: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white mb-1">
                      Texto Destacado en Color
                    </label>
                    <input
                      type="text"
                      value={config.sections?.hero?.titleHighlight || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: {
                            ...config.sections,
                            hero: { ...config.sections.hero, titleHighlight: e.target.value },
                          },
                        })
                      }
                      className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">Subtítulo Descriptivo</label>
                  <textarea
                    rows={3}
                    value={config.sections?.hero?.subtitle || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          hero: { ...config.sections.hero, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Theme & Styles Editor */}
          {activeTab === "theme" && (
            <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-6">
              <div className="flex items-center gap-2 text-amber-400 border-b border-[#1e2a42] pb-3">
                <Palette className="w-5 h-5" />
                <h3 className="text-lg font-black text-white">2. Estilos Globales & Colores</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Color de Fondo Principal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme?.backgroundColor || "#0a1120"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, backgroundColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.theme?.backgroundColor || "#0a1120"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, backgroundColor: e.target.value },
                        })
                      }
                      className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Color de Fondo de Tarjetas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme?.cardBackgroundColor || "#121b2d"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, cardBackgroundColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.theme?.cardBackgroundColor || "#121b2d"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, cardBackgroundColor: e.target.value },
                        })
                      }
                      className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Color de Botones de Acción
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme?.buttonColor || "#fbbf24"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, buttonColor: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.theme?.buttonColor || "#fbbf24"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          theme: { ...config.theme, buttonColor: e.target.value },
                        })
                      }
                      className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Tipo de Borde de Botones
                  </label>
                  <select
                    value={config.theme?.buttonBorderRadius || "rounded-xl"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        theme: { ...config.theme, buttonBorderRadius: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                  >
                    <option value="rounded-none">Sin Bordes (Rectangular 0px)</option>
                    <option value="rounded-md">Redondeado Suave (6px)</option>
                    <option value="rounded-xl">Redondeado Grande (12px)</option>
                    <option value="rounded-full">Estilo Cápsula (Redondo 9999px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Services Editor */}
          {activeTab === "services" && (
            <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
              <h3 className="text-lg font-black text-white border-b border-[#1e2a42] pb-3">
                3. Sección Servicios Principales
              </h3>

              <div>
                <label className="block text-xs font-black text-white mb-1">
                  Título de la Sección
                </label>
                <input
                  type="text"
                  value={config.sections?.services?.title || "Servicios Principales"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        services: { ...config.sections.services, title: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">
                  Subtítulo Explicativo
                </label>
                <input
                  type="text"
                  value={config.sections?.services?.subtitle || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        services: { ...config.sections.services, subtitle: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Courses & Books Editor */}
          {activeTab === "courses" && (
            <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
              <h3 className="text-lg font-black text-white border-b border-[#1e2a42] pb-3">
                4. Sección Cursos & Libros
              </h3>

              <div>
                <label className="block text-xs font-black text-white mb-1">
                  Título del Encabezado
                </label>
                <input
                  type="text"
                  value={config.sections?.coursesAndBooks?.title || "Mis Libros y Cursos de Aprendizaje"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        coursesAndBooks: {
                          ...config.sections.coursesAndBooks,
                          title: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">
                  Subtítulo Educativo
                </label>
                <textarea
                  rows={2}
                  value={config.sections?.coursesAndBooks?.subtitle || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        coursesAndBooks: {
                          ...config.sections.coursesAndBooks,
                          subtitle: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Contact & Integrations Editor */}
          {activeTab === "contact" && (
            <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
              <h3 className="text-lg font-black text-white border-b border-[#1e2a42] pb-3">
                5. Contacto & Webhooks en Tiempo Real
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Número Oficial de WhatsApp
                  </label>
                  <input
                    type="text"
                    value={config.sections?.contact?.whatsappNumber || "+584129912840"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          contact: { ...config.sections.contact, whatsappNumber: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Correo Electrónico Oficial
                  </label>
                  <input
                    type="email"
                    value={config.sections?.contact?.email || "iirockalonso@gmail.com"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          contact: { ...config.sections.contact, email: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 mb-1">
                  📱 Telegram Webhook URL (Notificaciones instantáneas de Chatbot a tu celular)
                </label>
                <input
                  type="text"
                  placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<ID>"
                  value={config.sections?.contact?.telegramWebhookUrl || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        contact: { ...config.sections.contact, telegramWebhookUrl: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-mono font-black"
                />
                <span className="text-[11px] text-white font-extrabold mt-1 block">
                  Recibe avisos de usuarios y chats del bot directamente en tu Telegram.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-rose-400 mb-1">
                  ✉️ Resend API Key (Para envíos masivos de Email Marketing)
                </label>
                <input
                  type="password"
                  placeholder="re_123456789..."
                  value={config.sections?.contact?.resendApiKey || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        contact: { ...config.sections.contact, resendApiKey: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-mono font-black"
                />
              </div>
            </div>
          )}

        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#1e2a42] pb-3">
              <Eye className="w-5 h-5" />
              <h3 className="text-base font-black text-white">Vista Previa Tarjeta & Estilos</h3>
            </div>

            <div
              className="p-5 rounded-2xl border space-y-3"
              style={{
                backgroundColor: config.theme?.backgroundColor || "#0a1120",
                color: config.theme?.textColor || "#ffffff",
                borderColor: "#1e2a42",
              }}
            >
              {/* Profile Card Preview */}
              <div className="flex flex-col items-center text-center p-3 bg-[#121b2d] rounded-2xl border border-[#1e2a42] mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 p-0.5 overflow-hidden mb-2">
                  <div className="w-full h-full bg-[#0a1120] rounded-[14px] overflow-hidden flex items-center justify-center text-white font-black text-lg">
                    {config.sections?.hero?.avatarUrl ? (
                      <img
                        src={config.sections.hero.avatarUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{config.sections?.hero?.avatarInitials || "AR"}</span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-black text-white">{config.sections?.hero?.profileName || "Alonso Ríos"}</h4>
                <p className="text-[11px] font-black text-amber-400 mt-0.5">{config.sections?.hero?.profileRole || "Desarrollador Web"}</p>
              </div>

              <span className="text-xs font-black text-amber-400 block">
                {config.sections?.hero?.statusBadge}
              </span>
              <h4 className="text-lg font-black text-white">
                {config.sections?.hero?.title}{" "}
                <span className="text-amber-400">{config.sections?.hero?.titleHighlight}</span>
              </h4>
              <p className="text-xs text-white font-extrabold">{config.sections?.hero?.subtitle}</p>

              <button
                className={`w-full py-2.5 px-4 font-black text-xs transition ${config.theme?.buttonBorderRadius}`}
                style={{
                  backgroundColor: config.theme?.buttonColor || "#fbbf24",
                  color: config.theme?.buttonTextColor || "#0a1120",
                }}
              >
                Ejemplo de Botón
              </button>
            </div>

            <div className="pt-3 border-t border-[#1e2a42] text-xs font-black text-white space-y-1">
              <p className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>WhatsApp: {config.sections?.contact?.whatsappNumber}</span>
              </p>
              <p className="flex items-center gap-1 text-amber-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Correo: {config.sections?.contact?.email}</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
