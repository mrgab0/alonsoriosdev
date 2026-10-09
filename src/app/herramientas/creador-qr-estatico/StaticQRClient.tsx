"use client";

import React, { useState, useId, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Wifi,
  Globe,
  MessageCircle,
  FileText,
  Mail,
  Palette,
  Layers,
  ArrowRight,
} from "lucide-react";
import { generateQRSvg, renderQRToCanvas, ErrorCorrectionLevel } from "@/lib/qrcode";

type QRContentType = "url" | "whatsapp" | "wifi" | "text" | "email";

export default function StaticQRClient() {
  const [contentType, setContentType] = useState<QRContentType>("url");

  // Form states
  const [urlInput, setUrlInput] = useState("https://alonsorios.dev");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiType, setWifiType] = useState("WPA");
  const [textInput, setTextInput] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Styling states
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [ecl, setEcl] = useState<ErrorCorrectionLevel>("M");
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR text string based on active type
  const qrString = useMemo(() => {
    switch (contentType) {
      case "url":
        if (!urlInput.trim()) return "https://alonsorios.dev";
        if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
          return `https://${urlInput.trim()}`;
        }
        return urlInput.trim();

      case "whatsapp": {
        const cleanPhone = whatsappPhone.replace(/[^0-9]/g, "");
        if (!cleanPhone) return "https://wa.me/";
        const textParam = whatsappMsg.trim() ? `?text=${encodeURIComponent(whatsappMsg.trim())}` : "";
        return `https://wa.me/${cleanPhone}${textParam}`;
      }

      case "wifi": {
        if (!wifiSsid.trim()) return "WIFI:S:MiRed;T:WPA;P:password;;";
        return `WIFI:S:${wifiSsid.trim()};T:${wifiType};P:${wifiPass};;`;
      }

      case "text":
        return textInput.trim() || "Hola desde alonsorios.dev";

      case "email": {
        if (!emailTo.trim()) return "mailto:contacto@alonsorios.dev";
        const params: string[] = [];
        if (emailSubject) params.push(`subject=${encodeURIComponent(emailSubject)}`);
        if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
        const query = params.length > 0 ? `?${params.join("&")}` : "";
        return `mailto:${emailTo.trim()}${query}`;
      }

      default:
        return "https://alonsorios.dev";
    }
  }, [contentType, urlInput, whatsappPhone, whatsappMsg, wifiSsid, wifiPass, wifiType, textInput, emailTo, emailSubject, emailBody]);

  // Generate SVG string safely
  const svgString = useMemo(() => {
    try {
      return generateQRSvg(qrString, {
        ecl,
        fgColor,
        bgColor,
        margin,
        size: 400,
      });
    } catch (err) {
      console.error(err);
      return "";
    }
  }, [qrString, ecl, fgColor, bgColor, margin]);

  // Render to hidden canvas for PNG download
  useEffect(() => {
    if (canvasRef.current && qrString) {
      try {
        renderQRToCanvas(canvasRef.current, qrString, {
          ecl,
          fgColor,
          bgColor,
          margin,
          size: 1024,
        });
      } catch (e) {
        console.error("Canvas render error:", e);
      }
    }
  }, [qrString, ecl, fgColor, bgColor, margin]);

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `codigo-qr-${Date.now()}.png`;
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
    a.download = `codigo-qr-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorPresets = [
    { name: "Negro", hex: "#000000" },
    { name: "Azul Pro", hex: "#2563eb" },
    { name: "Esmeralda", hex: "#059669" },
    { name: "Púrpura", hex: "#7c3aed" },
    { name: "Dorado", hex: "#d97706" },
  ];

  return (
    <div className="w-full">
      {/* Top Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
          <QrCode className="w-3.5 h-3.5" />
          <span>Herramienta Gratuita 100% Offline y Privada</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          Creador de Códigos QR <span className="text-amber-400">Estático</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
          Genera códigos QR en alta resolución para páginas web, redes WiFi, mensajes de WhatsApp y texto. Descarga en PNG y SVG vectorial sin marcas de agua.
        </p>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              1. Selecciona el Tipo de Contenido
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setContentType("url")}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs transition border cursor-pointer ${
                  contentType === "url"
                    ? "bg-amber-400 text-[#090f1d] border-amber-400 shadow-md font-black"
                    : "bg-[#1e293b]/60 text-slate-300 border-slate-700/60 hover:bg-[#1e293b]"
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>Enlace Web</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType("whatsapp")}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs transition border cursor-pointer ${
                  contentType === "whatsapp"
                    ? "bg-amber-400 text-[#090f1d] border-amber-400 shadow-md font-black"
                    : "bg-[#1e293b]/60 text-slate-300 border-slate-700/60 hover:bg-[#1e293b]"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType("wifi")}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs transition border cursor-pointer ${
                  contentType === "wifi"
                    ? "bg-amber-400 text-[#090f1d] border-amber-400 shadow-md font-black"
                    : "bg-[#1e293b]/60 text-slate-300 border-slate-700/60 hover:bg-[#1e293b]"
                }`}
              >
                <Wifi className="w-5 h-5" />
                <span>Red WiFi</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType("text")}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs transition border cursor-pointer ${
                  contentType === "text"
                    ? "bg-amber-400 text-[#090f1d] border-amber-400 shadow-md font-black"
                    : "bg-[#1e293b]/60 text-slate-300 border-slate-700/60 hover:bg-[#1e293b]"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Texto</span>
              </button>

              <button
                type="button"
                onClick={() => setContentType("email")}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs transition border cursor-pointer ${
                  contentType === "email"
                    ? "bg-amber-400 text-[#090f1d] border-amber-400 shadow-md font-black"
                    : "bg-[#1e293b]/60 text-slate-300 border-slate-700/60 hover:bg-[#1e293b]"
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Dynamic Inputs based on type */}
          <div className="pt-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              2. Datos del Código QR
            </label>

            {contentType === "url" && (
              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com o tu perfil social"
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3.5 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Introduce cualquier dirección web (Instagram, menú digital, portfolio, tienda, etc.).
                </p>
              </div>
            )}

            {contentType === "whatsapp" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Número de Teléfono (con código de país sin +)</label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="Ejemplo: 584129912840 o 5215512345678"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Mensaje predeterminado (Opcional)</label>
                  <input
                    type="text"
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    placeholder="Hola, me gustaría más información..."
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {contentType === "wifi" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Nombre de la Red (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Mi WiFi de Casa o Restaurante"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold mb-1 block">Contraseña</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder="Contraseña de la red"
                      className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold mb-1 block">Seguridad</label>
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value)}
                      className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Común)</option>
                      <option value="WEP">WEP (Antiguo)</option>
                      <option value="nopass">Sin Contraseña (Abierta)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {contentType === "text" && (
              <div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Escribe el texto o mensaje que quieras incluir en el código QR..."
                  rows={4}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {contentType === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Destinatario (Email)</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Asunto</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Consulta sobre servicios"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">Cuerpo del Mensaje</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Mensaje por defecto..."
                    rows={2}
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Design Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
              3. Personalización de Estilo
            </label>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" /> Color del QR (Puntos)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex gap-1.5">
                    {colorPresets.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setFgColor(p.hex)}
                        className="w-7 h-7 rounded-lg border border-slate-600 transition hover:scale-110"
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Color de Fondo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor === "transparent" ? "#ffffff" : bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <button
                    type="button"
                    onClick={() => setBgColor("#ffffff")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      bgColor === "#ffffff" ? "bg-white text-black border-white" : "border-slate-700 text-slate-300"
                    }`}
                  >
                    Blanco
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor("transparent")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      bgColor === "transparent" ? "bg-amber-400 text-black border-amber-400" : "border-slate-700 text-slate-300"
                    }`}
                  >
                    Transparente
                  </button>
                </div>
              </div>
            </div>

            {/* Error correction & Margins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Corrección de Error (Legibilidad)
                </label>
                <select
                  value={ecl}
                  onChange={(e) => setEcl(e.target.value as ErrorCorrectionLevel)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                >
                  <option value="L">Bajo (L ~7% recuperación) - Ideal para imprimir simple</option>
                  <option value="M">Medio (M ~15% recuperación) - Recomendado</option>
                  <option value="Q">Cuartil (Q ~25% recuperación) - Alta resistencia</option>
                  <option value="H">Alto (H ~30% recuperación) - Máxima protección</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Margen exterior ({margin} módulos)
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Downloads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              Vista Previa en Vivo
            </span>

            {/* QR Code Container */}
            <div
              className="p-6 rounded-3xl border border-slate-700/60 shadow-xl flex items-center justify-center max-w-[280px] w-full aspect-square transition-all"
              style={{
                backgroundColor: bgColor === "transparent" ? "#090f1d" : bgColor,
              }}
            >
              {svgString ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              ) : (
                <div className="text-xs text-rose-400 font-bold">
                  No se pudo renderizar. Reduce la longitud del texto.
                </div>
              )}
            </div>

            {/* Hidden canvas for PNG export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Download Buttons */}
            <div className="w-full mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="w-full bg-amber-400 hover:bg-amber-300 text-[#090f1d] font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Descargar PNG (1024px Alta Calidad)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer text-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>SVG Vectorial</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full bg-[#1e293b] hover:bg-[#334155] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upsell / Dynamic QR Promotion Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#0f172a] to-blue-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>¿Vas a imprimir este código QR?</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              Evita reimpresiones costosas con un QR Dinámico
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Si imprimes este QR estático en cartas, folletos o tarjetas y luego cambias de enlace, el QR quedará inservible. Con nuestro **QR Dinámico**, puedes cambiar el destino cuantas veces quieras y medir escaneos.
            </p>
            <Link
              href="/herramientas/creador-qr-dinamico"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
            >
              <span>Crear QR Dinámico Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Conversion Banner: Hire Alonso */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <p className="text-xs font-bold text-slate-400 mb-1">
              Desarrollado por Alonso Ríos
            </p>
            <h4 className="text-base font-black text-white mb-3">
              ¿Necesitas una web, tienda online o sistema a la medida?
            </h4>
            <a
              href="https://wa.me/584129912840?text=Hola%20Alonso,%20vi%20tu%20herramienta%20de%20QR%20y%20quisiera%20consultar%20por%20un%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-amber-400 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition"
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
