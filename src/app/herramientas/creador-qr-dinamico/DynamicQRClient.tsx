"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  BarChart2,
  RefreshCw,
  Key,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  PlusCircle,
  Clock,
  Mail,
} from "lucide-react";
import { generateQRSvg, renderQRToCanvas } from "@/lib/qrcode";

interface SavedQR {
  code: string;
  editToken: string;
  title: string;
  shortUrl: string;
  targetUrl: string;
  createdAt: string;
}

export default function DynamicQRClient() {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");

  // Form creation states
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Created QR Result
  const [createdResult, setCreatedResult] = useState<{
    code: string;
    shortUrl: string;
    editToken: string;
    title: string;
    targetUrl: string;
    creatorEmail?: string;
    emailSent?: boolean;
  } | null>(null);

  // Manage / Edit QR states
  const [manageCode, setManageCode] = useState("");
  const [manageToken, setManageToken] = useState("");
  const [loadingQR, setLoadingQR] = useState(false);
  const [loadedQR, setLoadedQR] = useState<{
    code: string;
    shortUrl: string;
    editToken: string;
    title: string;
    targetUrl: string;
    scans: number;
    lastScannedAt?: string;
    createdAt?: string;
  } | null>(null);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [updatingUrl, setUpdatingUrl] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // LocalStorage saved QRs
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved QRs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("alonsorios_saved_dynamic_qrs");
      if (stored) {
        setSavedQRs(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveQRToLocalStorage = (qr: SavedQR) => {
    try {
      const updated = [qr, ...savedQRs.filter((item) => item.code !== qr.code)].slice(0, 10);
      setSavedQRs(updated);
      localStorage.setItem("alonsorios_saved_dynamic_qrs", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!targetUrl.trim()) {
      setErrorMsg("Por favor introduce la URL a la que dirigirá el QR.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/qr/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          title: title.trim() || "Mi QR Dinámico",
          creatorEmail: creatorEmail.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedResult(json.data);
        saveQRToLocalStorage({
          code: json.data.code,
          editToken: json.data.editToken,
          title: json.data.title,
          shortUrl: json.data.shortUrl,
          targetUrl: json.data.targetUrl,
          createdAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(json.error || "Error al crear el código QR.");
      }
    } catch (err: any) {
      setErrorMsg("Error de conexión al generar el QR.");
    } finally {
      setCreating(false);
    }
  };

  const handleFetchQRToManage = async (codeToFetch?: string, tokenToFetch?: string) => {
    const code = codeToFetch || manageCode;
    const token = tokenToFetch || manageToken;

    if (!code.trim() || !token.trim()) {
      setErrorMsg("Debes ingresar el código y el token de edición.");
      return;
    }

    setLoadingQR(true);
    setErrorMsg("");
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/qr/dynamic?code=${encodeURIComponent(code.trim())}&editToken=${encodeURIComponent(token.trim())}`);
      const json = await res.json();

      if (json.success) {
        setLoadedQR(json.data);
        setNewTargetUrl(json.data.targetUrl);
        setManageCode(json.data.code);
        setManageToken(json.data.editToken);
      } else {
        setErrorMsg(json.error || "No se encontró el código QR con ese token.");
      }
    } catch (err) {
      setErrorMsg("Error al consultar el QR.");
    } finally {
      setLoadingQR(false);
    }
  };

  // Detectar enlace mágico desde el correo (?code=...&token=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code");
      const tokenParam = params.get("token");
      if (codeParam && tokenParam) {
        setActiveTab("manage");
        setManageCode(codeParam);
        setManageToken(tokenParam);
        handleFetchQRToManage(codeParam, tokenParam);
      }
    }
  }, []);

  const handleUpdateTargetUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loadedQR) return;

    if (!newTargetUrl.trim()) {
      setErrorMsg("La nueva URL no puede estar vacía.");
      return;
    }

    setUpdatingUrl(true);
    setErrorMsg("");
    setUpdateSuccess(false);

    try {
      const res = await fetch("/api/qr/dynamic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: loadedQR.code,
          editToken: loadedQR.editToken,
          targetUrl: newTargetUrl.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setLoadedQR((prev) => (prev ? { ...prev, targetUrl: json.data.targetUrl } : null));
        setUpdateSuccess(true);
        // Actualizar en localStorage
        saveQRToLocalStorage({
          code: loadedQR.code,
          editToken: loadedQR.editToken,
          title: loadedQR.title,
          shortUrl: loadedQR.shortUrl,
          targetUrl: json.data.targetUrl,
          createdAt: loadedQR.createdAt || new Date().toISOString(),
        });
      } else {
        setErrorMsg(json.error || "Error al actualizar la URL.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión al actualizar.");
    } finally {
      setUpdatingUrl(false);
    }
  };

  // Current QR string to generate
  const currentQRUrl = createdResult?.shortUrl || loadedQR?.shortUrl || "https://alonsorios.dev";

  const svgString = useMemo(() => {
    try {
      return generateQRSvg(currentQRUrl, {
        ecl: "M",
        fgColor: "#000000",
        bgColor: "#ffffff",
        margin: 2,
        size: 400,
      });
    } catch (e) {
      return "";
    }
  }, [currentQRUrl]);

  useEffect(() => {
    if (canvasRef.current && currentQRUrl) {
      try {
        renderQRToCanvas(canvasRef.current, currentQRUrl, {
          ecl: "M",
          fgColor: "#000000",
          bgColor: "#ffffff",
          margin: 2,
          size: 1024,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentQRUrl]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-dinamico-${createdResult?.code || loadedQR?.code || "codigo"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-dinamico-${createdResult?.code || loadedQR?.code || "codigo"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyToken = (tokenToCopy: string) => {
    navigator.clipboard.writeText(tokenToCopy);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tecnología Inteligente de Redirección</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          Creador de Códigos QR <span className="text-emerald-400">Dinámicos</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
          Crea códigos QR cuyo destino puedes cambiar en cualquier momento sin tener que volver a imprimir. Mide cuántas personas lo escanean en tiempo real.
        </p>
      </div>

      {/* Tabs: Create vs Manage */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 flex gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => { setActiveTab("create"); setErrorMsg(""); }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === "create"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Nuevo QR Dinámico</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("manage"); setErrorMsg(""); }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === "manage"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Destino de mi QR</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {activeTab === "create" ? (
            <div>
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <span>Configurar Código QR Dinámico</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Te generaremos un enlace corto protegido. Podrás editar el destino en cualquier momento usando tu token secreto.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Título o Nombre descriptivo (Para identificarlo)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Menú Restaurante Verano 2026, Tarjeta Personal..."
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    URL de Destino Inicial *
                  </label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://tu-pagina-actual.com"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-emerald-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hacia dónde serán dirigidos quienes escaneen tu QR. Puedes cambiar esto después.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tu Correo Electrónico (Opcional, para respaldo)
                  </label>
                  <input
                    type="email"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition transform hover:scale-[1.01] cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{creating ? "Generando QR Dinámico..." : "Generar Código QR Dinámico Gratis"}</span>
                  </button>
                </div>
              </form>

              {/* Show Success Result Box */}
              {createdResult && (
                <div className="mt-8 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <Check className="w-5 h-5" />
                    <span>¡Tu QR Dinámico ha sido creado con éxito!</span>
                  </div>

                  {createdResult.creatorEmail && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                      <Mail className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        {createdResult.emailSent
                          ? `Enviamos una copia de tu token y enlace directo de gestión a ${createdResult.creatorEmail}`
                          : `Guardamos tu correo (${createdResult.creatorEmail}) para enviarte el respaldo de tu token.`}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Enlace Corto Redirigible (Impreso en el QR):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdResult.shortUrl}
                        className="flex-1 bg-[#090f1d] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyLink(createdResult.shortUrl)}
                        className="px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1 flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      <span>Token de Edición Secreto (Guárdalo para cambiar el enlace luego):</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdResult.editToken}
                        className="flex-1 bg-[#090f1d] border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyToken(createdResult.editToken)}
                        className="px-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ya lo hemos guardado automáticamente en tu navegador para que puedas editarlo cuando vuelvas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab Manage Existing QR */
            <div>
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Panel de Edición de QR Dinámico</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Ingresa el código corto de tu QR y el token de edición que recibiste al crearlo para cambiar su destino.
              </p>

              {/* Quick Pick from Saved QRs */}
              {savedQRs.length > 0 && !loadedQR && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Tus Códigos QR Guardados en este Navegador:
                  </span>
                  <div className="space-y-2">
                    {savedQRs.map((saved) => (
                      <div
                        key={saved.code}
                        onClick={() => handleFetchQRToManage(saved.code, saved.editToken)}
                        className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{saved.title || saved.code}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{saved.targetUrl}</div>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                          Cargar
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form to load QR manually */}
              {!loadedQR ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Código del QR</label>
                      <input
                        type="text"
                        value={manageCode}
                        onChange={(e) => setManageCode(e.target.value)}
                        placeholder="Ej: d7k4m9"
                        className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Token de Edición</label>
                      <input
                        type="text"
                        value={manageToken}
                        onChange={(e) => setManageToken(e.target.value)}
                        placeholder="Token de 24 caracteres"
                        className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFetchQRToManage()}
                    disabled={loadingQR}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingQR ? "animate-spin" : ""}`} />
                    <span>{loadingQR ? "Buscando QR..." : "Cargar y Editar QR"}</span>
                  </button>
                </div>
              ) : (
                /* Loaded QR Edit Interface */
                <div className="space-y-6">
                  {/* Live Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <BarChart2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">{loadedQR.scans}</div>
                        <div className="text-xs text-slate-400 font-bold">Escaneos Totales</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">
                          {loadedQR.lastScannedAt ? new Date(loadedQR.lastScannedAt).toLocaleDateString() : "Sin escaneos"}
                        </div>
                        <div className="text-xs text-slate-400 font-bold">Último Escaneo</div>
                      </div>
                    </div>
                  </div>

                  {/* Form to change target URL */}
                  <form onSubmit={handleUpdateTargetUrl} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        URL de Destino Actual:
                      </label>
                      <input
                        type="url"
                        required
                        value={newTargetUrl}
                        onChange={(e) => { setNewTargetUrl(e.target.value); setUpdateSuccess(false); }}
                        placeholder="https://nueva-url.com"
                        className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-emerald-400 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Al guardar, cualquier persona que escanee el QR impreso será redirigida a esta nueva dirección.
                      </p>
                    </div>

                    {updateSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>¡URL de destino actualizada con éxito! Ya está activa en vivo.</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updatingUrl}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition cursor-pointer"
                      >
                        {updatingUrl ? "Guardando cambios..." : "Guardar Nuevo Destino"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadedQR(null)}
                        className="px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              Código QR Dinámico
            </span>

            {/* QR Visual */}
            <div className="p-6 rounded-3xl bg-white border border-slate-700/60 shadow-xl flex items-center justify-center max-w-[280px] w-full aspect-square">
              {svgString && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Target indicator */}
            <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-xs">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Redirige a: {loadedQR?.targetUrl || createdResult?.targetUrl || targetUrl || "alonsorios.dev"}</span>
            </div>

            {/* Downloads */}
            <div className="w-full mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Descargar PNG (1024px)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer text-sm"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar SVG Vectorial</span>
              </button>
            </div>
          </div>

          {/* Value Proposition Box */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>¿Por qué utilizar un QR Dinámico?</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Ahorro total:</strong> Cambia enlaces promocionales sin reimprimir menús, flyers o packaging.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Control analítico:</strong> Sabrás exactamente cuántas personas han interactuado con tu material.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Alta disponibilidad:</strong> Hospedado en la infraestructura ultrarrápida de Vercel y Next.js.</span>
              </li>
            </ul>
          </div>

          {/* Lead Magnet */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <p className="text-xs font-bold text-slate-400 mb-1">
              Desarrollado por Alonso Ríos
            </p>
            <h4 className="text-base font-black text-white mb-3">
              ¿Quieres un software con analíticas avanzadas o QR para tu empresa?
            </h4>
            <a
              href="https://wa.me/584129912840?text=Hola%20Alonso,%20me%20interesa%20un%20sistema%20personalizado%20con%20analiticas%20y%20codigos%20QR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
