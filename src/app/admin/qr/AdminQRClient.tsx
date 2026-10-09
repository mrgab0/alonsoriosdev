"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  QrCode,
  Plus,
  Edit2,
  Trash2,
  Download,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Layers,
  Power,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { generateQRSvg, renderQRToCanvas } from "@/lib/qrcode";
import PagoMovilDesigner from "./PagoMovilDesigner";

interface DynamicQRItem {
  _id: string;
  code: string;
  targetUrl: string;
  title: string;
  type: string;
  creatorEmail?: string;
  scans: number;
  active: boolean;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminQRClient() {
  const [activeTab, setActiveTab] = useState<"dynamic" | "pagomovil">("dynamic");
  const [qrs, setQrs] = useState<DynamicQRItem[]>([]);
  const [stats, setStats] = useState({ total: 0, totalScans: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCustomCode, setCreateCustomCode] = useState("");
  const [createTargetUrl, setCreateTargetUrl] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit target inline / modal
  const [editingItem, setEditingItem] = useState<DynamicQRItem | null>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Preview QR Modal
  const [previewItem, setPreviewItem] = useState<DynamicQRItem | null>(null);

  // Notification / copied states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/qr");
      const json = await res.json();
      if (json.success) {
        setQrs(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTargetUrl.trim()) return;

    setSubmittingCreate(true);
    try {
      const res = await fetch("/api/admin/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customCode: createCustomCode.trim() || undefined,
          targetUrl: createTargetUrl.trim(),
          title: createTitle.trim() || "QR Admin",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        setCreateCustomCode("");
        setCreateTargetUrl("");
        setCreateTitle("");
        fetchQRs();
      } else {
        alert(json.error || "Error al crear el QR");
      }
    } catch (e) {
      alert("Error de conexión al crear");
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch("/api/admin/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem._id,
          targetUrl: editTargetUrl.trim(),
          title: editTitle.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEditingItem(null);
        fetchQRs();
      } else {
        alert(json.error || "Error al actualizar");
      }
    } catch (e) {
      alert("Error de conexión al actualizar");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (item: DynamicQRItem) => {
    try {
      const res = await fetch("/api/admin/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item._id,
          active: !item.active,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchQRs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQR = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este código QR? Los impresos dejarán de redirigir.")) return;

    try {
      const res = await fetch(`/api/admin/qr?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchQRs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://alonsorios.dev";
    navigator.clipboard.writeText(`${origin}/qr/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Preview QR generator logic
  const previewShortUrl = previewItem ? `${typeof window !== "undefined" ? window.location.origin : "https://alonsorios.dev"}/qr/${previewItem.code}` : "";

  const previewSvg = useMemo(() => {
    if (!previewShortUrl) return "";
    try {
      return generateQRSvg(previewShortUrl, { ecl: "M", size: 300, margin: 2 });
    } catch {
      return "";
    }
  }, [previewShortUrl]);

  useEffect(() => {
    if (previewItem && canvasRef.current && previewShortUrl) {
      renderQRToCanvas(canvasRef.current, previewShortUrl, { ecl: "M", size: 1024, margin: 2 });
    }
  }, [previewItem, previewShortUrl]);

  const handleDownloadPreviewPNG = () => {
    if (!canvasRef.current || !previewItem) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${previewItem.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPreviewSVG = () => {
    if (!previewSvg || !previewItem) return;
    const blob = new Blob([previewSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${previewItem.code}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredQRs = qrs.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e2a42] pb-4">
        <button
          onClick={() => setActiveTab("dynamic")}
          className={`px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition cursor-pointer ${
            activeTab === "dynamic"
              ? "bg-amber-400 text-black shadow-md"
              : "bg-[#121b2d] text-slate-300 hover:text-white border border-[#1e2a42]"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Gestor QR Dinámico Global</span>
        </button>

        <button
          onClick={() => setActiveTab("pagomovil")}
          className={`px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition cursor-pointer ${
            activeTab === "pagomovil"
              ? "bg-amber-400 text-black shadow-md"
              : "bg-[#121b2d] text-slate-300 hover:text-white border border-[#1e2a42]"
          }`}
        >
          <span>🇻🇪 Pago Móvil QR & Diseñador de Acrílicos</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
            Para Clientes
          </span>
        </button>
      </div>

      {activeTab === "pagomovil" ? (
        <PagoMovilDesigner />
      ) : (
        <>
          {/* Top Header & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                <span>Gestor de Códigos QR Dinámicos</span>
              </h2>
          <p className="text-slate-400 text-sm font-bold">
            Administra, redirige y analiza los escaneos de todos los códigos QR del sistema.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-black font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Crear QR de Admin</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121b2d] border border-[#1e2a42] rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-400/10 text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Total QRs Creados</div>
          </div>
        </div>

        <div className="bg-[#121b2d] border border-[#1e2a42] rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-400/10 text-emerald-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalScans}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Escaneos Totales</div>
          </div>
        </div>

        <div className="bg-[#121b2d] border border-[#1e2a42] rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-400/10 text-blue-400">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.activeCount}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">QRs Activos</div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-[#121b2d] border border-[#1e2a42] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, slug o destino..."
            className="w-full bg-[#0a1120] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
          />
        </div>

        <button
          onClick={fetchQRs}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#0a1120] border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* QRs Table */}
      <div className="bg-[#121b2d] border border-[#1e2a42] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#0b1324] border-b border-[#1e2a42] text-xs font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Código / Nombre</th>
                <th className="px-6 py-4">Destino Actual</th>
                <th className="px-6 py-4 text-center">Escaneos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a42] text-sm">
              {filteredQRs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                    {loading ? "Cargando códigos QR..." : "No hay códigos QR dinámicos registrados."}
                  </td>
                </tr>
              ) : (
                filteredQRs.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                          /qr/{item.code}
                        </span>
                        <button
                          onClick={() => handleCopyLink(item.code)}
                          className="text-slate-400 hover:text-white transition cursor-pointer"
                          title="Copiar enlace corto"
                        >
                          {copiedCode === item.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <a
                          href={item.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-amber-400 font-mono text-xs truncate max-w-[260px] inline-block"
                        >
                          {item.targetUrl}
                        </a>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-black text-xs">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{item.scans}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          item.active
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.active ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span>{item.active ? "Activo" : "Pausado"}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition cursor-pointer"
                          title="Ver y Descargar QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setEditTargetUrl(item.targetUrl);
                            setEditTitle(item.title);
                          }}
                          className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
                          title="Editar Destino"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteQR(item._id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Eliminar QR"
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
      </div>

      {/* Hidden Canvas for PNG Downloads */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-amber-400 mb-2">Crear Nuevo Código QR (Admin)</h3>
            <p className="text-xs text-slate-400 mb-6">
              Como administrador, puedes asignar un slug personalizado y redirigirlo a cualquier URL.
            </p>

            <form onSubmit={handleCreateQR} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre / Título</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Ej. Tarjeta de Presentación Alonso"
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Slug / Código Personalizado (Opcional)
                </label>
                <div className="flex items-center bg-[#090f1d] border border-slate-700 rounded-xl px-3 focus-within:border-amber-400">
                  <span className="text-xs text-slate-500 font-mono">alonsorios.dev/qr/</span>
                  <input
                    type="text"
                    value={createCustomCode}
                    onChange={(e) => setCreateCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="contacto"
                    className="flex-1 bg-transparent p-3 text-white font-mono font-bold focus:outline-none text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Si lo dejas vacío, se autogenerará un código aleatorio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL de Destino *</label>
                <input
                  type="url"
                  required
                  value={createTargetUrl}
                  onChange={(e) => setCreateTargetUrl(e.target.value)}
                  placeholder="https://wa.me/584129912840 o tu web"
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl transition cursor-pointer"
                >
                  {submittingCreate ? "Creando..." : "Crear Código QR"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-amber-400 mb-2">Editar Destino del QR</h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Código actual: /qr/{editingItem.code}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nueva URL de Destino *</label>
                <input
                  type="url"
                  required
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  El cambio toma efecto de inmediato. Quienes escaneen el QR irán a este nuevo enlace.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl transition cursor-pointer"
                >
                  {submittingEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview / Download Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center flex flex-col items-center">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-1">{previewItem.title}</h3>
            <p className="text-xs text-amber-400 font-mono mb-6">/qr/{previewItem.code}</p>

            <div className="p-4 bg-white rounded-2xl shadow-xl w-60 h-60 flex items-center justify-center mb-6">
              {previewSvg && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              )}
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={handleDownloadPreviewPNG}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-sm shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PNG (1024px)</span>
              </button>

              <button
                onClick={handleDownloadPreviewSVG}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Descargar SVG Vectorial</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
