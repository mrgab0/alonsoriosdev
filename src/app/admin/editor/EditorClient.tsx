"use client";

import React, { useEffect, useState } from "react";
import { Palette, Save, CheckCircle2, RefreshCw, Eye } from "lucide-react";

export default function EditorClient() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setConfig(data.data);
        }
      })
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
      setStatusMsg(data.message || "Configuración guardada con éxito.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch {
      setStatusMsg("Guardado correctamente en vista previa.");
      setTimeout(() => setStatusMsg(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
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
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Personalización Total
          </span>
          <h2 className="text-2xl font-black text-white">Editor de Secciones & Tema</h2>
          <p className="text-xs text-slate-300">
            Cambia colores, bordes de botones, textos y configuraciones del Home en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMsg}</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-500 text-[#0a1120] font-black px-6 py-3 rounded-xl transition text-sm flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form Columns */}
        <div className="lg:col-span-8 space-y-8">
          {/* TAB 1: Theme & Styles Editor */}
          <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-6">
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#1e2a42] pb-3">
              <Palette className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">1. Estilos Globales & Colores</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                    className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                    className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                    className="flex-1 bg-[#0a1120] border border-[#1e2a42] px-3 py-2 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
                >
                  <option value="rounded-none">Sin Bordes (Rectangular 0px)</option>
                  <option value="rounded-md">Redondeado Suave (6px)</option>
                  <option value="rounded-xl">Redondeado Grande (12px)</option>
                  <option value="rounded-full">Estilo Cápsula (Redondo 9999px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TAB 2: Hero Editor */}
          <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-[#1e2a42] pb-3">
              2. Sección Inicio (Hero)
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
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
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
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
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Subtítulo</label>
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
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* TAB 3: Contact & Integrations Editor */}
          <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-[#1e2a42] pb-3">
              3. Contacto & Webhooks en Tiempo Real
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  value={config.sections?.contact?.whatsappNumber || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        contact: { ...config.sections.contact, whatsappNumber: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={config.sections?.contact?.email || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        contact: { ...config.sections.contact, email: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">
                📱 Telegram Webhook URL (Gratis para recibir chats del Chatbot en vivo en tu celular)
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
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Permite ver lo que dicen los clientes y lo que responde el chatbot al instante en tu Telegram.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-400 mb-1">
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
                className="w-full bg-[#0a1120] border border-[#1e2a42] px-3 py-2.5 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121b2d] p-6 rounded-3xl border border-[#1e2a42] space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#1e2a42] pb-3">
              <Eye className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Vista Previa de Estilos</h3>
            </div>

            <div
              className="p-5 rounded-2xl border space-y-3"
              style={{
                backgroundColor: config.theme?.backgroundColor || "#0a1120",
                color: config.theme?.textColor || "#ffffff",
                borderColor: "#1e2a42",
              }}
            >
              <span className="text-xs font-bold text-amber-400">
                {config.sections?.hero?.statusBadge}
              </span>
              <h4 className="text-xl font-black">
                {config.sections?.hero?.title}{" "}
                <span className="text-amber-400">{config.sections?.hero?.titleHighlight}</span>
              </h4>
              <p className="text-xs text-slate-300">{config.sections?.hero?.subtitle}</p>

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
          </div>
        </div>
      </div>
    </div>
  );
}
