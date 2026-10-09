"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Phone,
  CreditCard,
  User,
  Palette,
  Sparkles,
  QrCode,
  Check,
  Copy,
} from "lucide-react";
import {
  VENEZUELA_BANKS,
  PagoMovilData,
  generatePagoMovilPayload,
  formatVenezuelanPhone,
  formatVenezuelanDoc,
} from "@/lib/venezuelaBanks";
import { generateQRSvg, renderQRToCanvas } from "@/lib/qrcode";

type AcrylicTheme = "clean" | "dark" | "blue" | "emerald";

export default function PagoMovilDesigner() {
  // Form fields
  const [bankCode, setBankCode] = useState("0102"); // BDV por defecto
  const [phonePrefix, setPhonePrefix] = useState("0412");
  const [phoneNumber, setPhoneNumber] = useState("1234567");
  const [docType, setDocType] = useState<"V" | "E" | "J" | "G">("V");
  const [docNumber, setDocNumber] = useState("12345678");
  const [beneficiaryName, setBeneficiaryName] = useState("Comercio / Titular");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");

  // Visual Customization
  const [headerTitle, setHeaderTitle] = useState("PAGO MÓVIL");
  const [headerSubtitle, setHeaderSubtitle] = useState("Aceptamos pagos de todos los bancos");
  const [theme, setTheme] = useState<AcrylicTheme>("clean");
  const [payloadFormat, setPayloadFormat] = useState<"suiche7b_json" | "delimited">("suiche7b_json");

  // Notifications
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Canvas refs
  const singleQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const acrylicCanvasRef = useRef<HTMLCanvasElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Selected Bank Object
  const selectedBank = useMemo(() => {
    return VENEZUELA_BANKS.find((b) => b.code === bankCode) || VENEZUELA_BANKS[0];
  }, [bankCode]);

  // Combined full phone
  const fullPhone = `${phonePrefix}${phoneNumber.replace(/[^0-9]/g, "")}`;

  // Current Pago Movil Payload string
  const qrPayload = useMemo(() => {
    const data: PagoMovilData = {
      bankCode,
      phone: fullPhone,
      docType,
      docNumber,
      beneficiaryName,
      amount: amount.trim() || undefined,
      concept: concept.trim() || undefined,
    };
    return generatePagoMovilPayload(data, payloadFormat);
  }, [bankCode, fullPhone, docType, docNumber, beneficiaryName, amount, concept, payloadFormat]);

  // Generate SVG QR Code
  const qrSvg = useMemo(() => {
    try {
      return generateQRSvg(qrPayload, {
        ecl: "M",
        fgColor: theme === "dark" ? "#000000" : "#000000",
        bgColor: "#ffffff",
        margin: 1,
        size: 300,
      });
    } catch {
      return "";
    }
  }, [qrPayload, theme]);

  // Render individual QR to hidden canvas for PNG download
  useEffect(() => {
    if (singleQrCanvasRef.current && qrPayload) {
      renderQRToCanvas(singleQrCanvasRef.current, qrPayload, {
        ecl: "M",
        fgColor: "#000000",
        bgColor: "#ffffff",
        margin: 1,
        size: 1024,
      });
    }
  }, [qrPayload]);

  // Render the FULL ACRYLIC STAND to high-resolution Canvas (300 DPI, 1200x1800 px)
  const drawAcrylicToCanvas = () => {
    const canvas = acrylicCanvasRef.current;
    if (!canvas) return;

    const width = 1200;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme color palettes
    const isDark = theme === "dark";
    const isBlue = theme === "blue";
    const isEmerald = theme === "emerald";

    let bgFill = "#ffffff";
    let primaryColor = "#0f172a";
    let accentColor = "#d97706";
    let textColor = "#0f172a";
    let textMuted = "#475569";
    let cardBg = "#f8fafc";
    let cardBorder = "#e2e8f0";

    if (isDark) {
      bgFill = "#070d19";
      primaryColor = "#fbbf24";
      accentColor = "#fbbf24";
      textColor = "#ffffff";
      textMuted = "#94a3b8";
      cardBg = "#0f172a";
      cardBorder = "#1e293b";
    } else if (isBlue) {
      bgFill = "#ffffff";
      primaryColor = "#1e40af";
      accentColor = "#2563eb";
      textColor = "#0f172a";
      textMuted = "#475569";
      cardBg = "#eff6ff";
      cardBorder = "#bfdbfe";
    } else if (isEmerald) {
      bgFill = "#ffffff";
      primaryColor = "#047857";
      accentColor = "#059669";
      textColor = "#0f172a";
      textMuted = "#475569";
      cardBg = "#ecfdf5";
      cardBorder = "#a7f3d0";
    }

    // 1. Background
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);

    // Decorative outer border
    ctx.strokeStyle = isDark ? "#1e2a42" : "#cbd5e1";
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // 2. Header banner / Title
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(headerTitle.toUpperCase(), width / 2, 130);

    ctx.fillStyle = textMuted;
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(headerSubtitle, width / 2, 180);

    // Divider line
    ctx.strokeStyle = isDark ? "#334155" : "#e2e8f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(width - 100, 220);
    ctx.stroke();

    // 3. QR Code Box (white background with rounded border)
    const qrBoxSize = 640;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 260;

    // Draw white card for QR
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = isDark ? "#334155" : "#cbd5e1";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36);
    ctx.fill();
    ctx.stroke();

    // Draw QR image onto box
    if (singleQrCanvasRef.current) {
      const qrPadding = 36;
      ctx.drawImage(
        singleQrCanvasRef.current,
        qrBoxX + qrPadding,
        qrBoxY + qrPadding,
        qrBoxSize - qrPadding * 2,
        qrBoxSize - qrPadding * 2
      );
    }

    // 4. Suiche 7B Badge below QR
    ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 240, 930, 480, 54, 27);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("⚡ RED SUICHE 7B INTERBANCARIO", width / 2, 966);

    // 5. Data Card
    const cardX = 90;
    const cardY = 1020;
    const cardW = width - 180;
    const cardH = 680;

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.stroke();

    // Row helper
    const drawRow = (label: string, value: string, yPos: number, isBig = false) => {
      ctx.textAlign = "left";
      ctx.fillStyle = textMuted;
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(label.toUpperCase(), cardX + 50, yPos);

      ctx.textAlign = "left";
      ctx.fillStyle = textColor;
      ctx.font = isBig ? "bold 44px sans-serif" : "bold 36px sans-serif";
      ctx.fillText(value, cardX + 50, yPos + 44);

      // Light separator
      ctx.strokeStyle = isDark ? "#1e293b" : "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 50, yPos + 68);
      ctx.lineTo(cardX + cardW - 50, yPos + 68);
      ctx.stroke();
    };

    drawRow("Beneficiario / Razón Social", beneficiaryName || "Titular", 1080);
    drawRow("Banco Receptor", `${selectedBank.code} - ${selectedBank.shortName}`, 1185);
    drawRow("Teléfono Afiliado", formatVenezuelanPhone(fullPhone), 1290, true);
    drawRow("Cédula / RIF", formatVenezuelanDoc(docType, docNumber), 1395, true);

    if (amount && parseFloat(amount) > 0) {
      drawRow("Monto a Pagar", `Bs. ${parseFloat(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, 1500, true);
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = textMuted;
      ctx.font = "italic 22px sans-serif";
      ctx.fillText("El cliente digita el monto en su aplicación bancaria", width / 2, 1530);
    }

    // 6. Footer branding
    ctx.textAlign = "center";
    ctx.fillStyle = textMuted;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Escanea este código desde la app de tu banco con la opción Pago Móvil QR", width / 2, 1630);
  };

  // Download high-resolution Acrylic Poster (PNG 300 DPI)
  const handleDownloadAcrylicPoster = () => {
    drawAcrylicToCanvas();
    const canvas = acrylicCanvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `cartel-acrilico-pagomovil-${selectedBank.code}-${docNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download individual QR in PNG
  const handleDownloadSinglePNG = () => {
    if (!singleQrCanvasRef.current) return;
    const url = singleQrCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-pagomovil-${selectedBank.code}-${docNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download individual QR in SVG
  const handleDownloadSingleSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-pagomovil-${selectedBank.code}-${docNumber}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hidden canvases for rendering */}
      <canvas ref={singleQrCanvasRef} className="hidden" />
      <canvas ref={acrylicCanvasRef} className="hidden" />

      {/* Intro info banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#121b2d] to-blue-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Servicio Comercial para Clientes en Venezuela</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Diseñador de Carteles de Acrílico para Pago Móvil QR
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Genera los códigos QR oficiales bajo la red **Suiche 7B** e imprime carteles de mostrador (proporción 10x15cm para soporte de acrílico) con diseño impecable y datos legibles.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadAcrylicPoster}
            className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Cartel 300 DPI</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-[#121b2d] border border-[#1e2a42] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Section 1: Bank Data */}
          <div>
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>1. Datos Bancarios del Pago Móvil</span>
            </h4>

            <div className="space-y-4">
              {/* Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Banco Receptor *</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                >
                  {VENEZUELA_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input with Venezuela Prefixes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono Afiliado *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="0412">0412 (Digitel)</option>
                    <option value="0414">0414 (Movistar)</option>
                    <option value="0424">0424 (Movistar)</option>
                    <option value="0416">0416 (Movilnet)</option>
                    <option value="0426">0426 (Movilnet)</option>
                  </select>
                  <input
                    type="text"
                    maxLength={7}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="1234567"
                    className="col-span-2 sm:col-span-3 bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Document ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cédula de Identidad o RIF *</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="V">V (Venezolano)</option>
                    <option value="E">E (Extranjero)</option>
                    <option value="J">J (Jurídico / Empresa)</option>
                    <option value="G">G (Gubernamental)</option>
                  </select>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="12345678"
                    className="col-span-3 bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Beneficiary Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Beneficiario o Negocio *</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Ej. Inversiones Alonso, C.A. o Alonso Ríos"
                  className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Amount & Concept (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Monto Opcional (Bs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Dejar vacío para monto libre"
                    className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Concepto Opcional</label>
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ej. Compra, Almuerzo..."
                    className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Acrylic Visual Theme */}
          <div className="pt-4 border-t border-[#1e2a42]">
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>2. Diseño y Estilo del Cartel de Acrílico</span>
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("clean")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "clean"
                      ? "bg-white text-black border-amber-400 shadow-md font-black ring-2 ring-amber-400"
                      : "bg-[#0a1120] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-200 border border-slate-400" />
                  <span>Blanco Print</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ideal Acrílico</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "dark"
                      ? "bg-amber-400 text-black border-amber-400 shadow-md font-black ring-2 ring-amber-400"
                      : "bg-[#0a1120] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#070d19] border border-amber-400" />
                  <span>Dark Luxe</span>
                  <span className="text-[10px] text-slate-400 font-normal">Fondo Oscuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("blue")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "blue"
                      ? "bg-blue-600 text-white border-blue-400 shadow-md font-black ring-2 ring-blue-400"
                      : "bg-[#0a1120] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 border border-blue-400" />
                  <span>Azul Banca</span>
                  <span className="text-[10px] text-slate-400 font-normal">Corporativo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("emerald")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "emerald"
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-black ring-2 ring-emerald-400"
                      : "bg-[#0a1120] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-400" />
                  <span>Esmeralda</span>
                  <span className="text-[10px] text-slate-400 font-normal">Fintech S7B</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Título Superior</label>
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={headerSubtitle}
                    onChange={(e) => setHeaderSubtitle(e.target.value)}
                    className="w-full bg-[#0a1120] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Estructura del Payload Bancario
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="payloadFormat"
                      checked={payloadFormat === "suiche7b_json"}
                      onChange={() => setPayloadFormat("suiche7b_json")}
                      className="accent-amber-400"
                    />
                    <span>Estándar Suiche 7B (JSON Interbancario - Recomendado)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="payloadFormat"
                      checked={payloadFormat === "delimited"}
                      onChange={() => setPayloadFormat("delimited")}
                      className="accent-amber-400"
                    />
                    <span>Trama Delimitada (|)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Acrylic Display Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Vista Previa de Mostrador (10x15 cm)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Copiar trama de datos codificada"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? "Copiado" : "Copiar Payload"}</span>
              </button>
            </div>
          </div>

          {/* ACRYLIC STAND VISUAL CARD (Responsive Proportion 1:1.5) */}
          <div
            ref={printContainerRef}
            className={`w-full max-w-[360px] mx-auto rounded-3xl p-6 shadow-2xl border transition-all duration-300 flex flex-col items-center ${
              theme === "clean"
                ? "bg-white text-slate-900 border-slate-300 shadow-slate-900/20"
                : theme === "dark"
                ? "bg-[#070d19] text-white border-amber-500/40 shadow-black"
                : theme === "blue"
                ? "bg-white text-slate-900 border-blue-300"
                : "bg-white text-slate-900 border-emerald-300"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2
                className={`text-2xl font-black tracking-tight ${
                  theme === "dark"
                    ? "text-amber-400"
                    : theme === "blue"
                    ? "text-blue-700"
                    : theme === "emerald"
                    ? "text-emerald-700"
                    : "text-slate-900"
                }`}
              >
                {headerTitle.toUpperCase()}
              </h2>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">{headerSubtitle}</p>
            </div>

            {/* QR Visual (Always on crisp white background for phone cameras) */}
            <div className="p-3 bg-white rounded-2xl border border-slate-300 shadow-md w-52 h-52 flex items-center justify-center mb-3">
              {qrSvg && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              )}
            </div>

            {/* Suiche 7B Chip */}
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
                theme === "dark"
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Red Suiche 7B Interbancario</span>
            </div>

            {/* Legible Data Card */}
            <div
              className={`w-full rounded-2xl p-4 text-xs space-y-2 border ${
                theme === "dark"
                  ? "bg-[#0f172a] border-[#1e2a42] text-slate-200"
                  : theme === "blue"
                  ? "bg-blue-50/70 border-blue-100 text-slate-800"
                  : theme === "emerald"
                  ? "bg-emerald-50/70 border-emerald-100 text-slate-800"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Beneficiario</span>
                <span className="font-bold text-sm block truncate">{beneficiaryName || "Titular"}</span>
              </div>

              <div className="border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Banco</span>
                <span className="font-bold text-sm block truncate">
                  {selectedBank.code} - {selectedBank.shortName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-black/5 dark:border-white/5 pb-1.5">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Teléfono</span>
                  <span className="font-black text-sm block font-mono">{formatVenezuelanPhone(fullPhone)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Cédula / RIF</span>
                  <span className="font-black text-sm block font-mono">{formatVenezuelanDoc(docType, docNumber)}</span>
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">Monto</span>
                  <span className="font-black text-base text-emerald-600 dark:text-emerald-400 block font-mono">
                    Bs. {parseFloat(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[9px] text-slate-400 font-bold text-center mt-3">
              Escanea desde la app de tu banco con Pago Móvil QR
            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadAcrylicPoster}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition transform hover:scale-[1.01] cursor-pointer text-sm"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Cartel para Acrílico (PNG 300 DPI)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadSinglePNG}
                className="bg-[#121b2d] hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Solo QR (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSingleSVG}
                className="bg-[#121b2d] hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Solo QR (SVG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
