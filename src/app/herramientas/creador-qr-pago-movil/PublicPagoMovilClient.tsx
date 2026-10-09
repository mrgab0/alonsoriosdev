"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Check,
  Copy,
  MessageCircle,
  Upload,
  ArrowRight,
  Truck,
  CheckCircle2,
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

export default function PublicPagoMovilClient() {
  // Form fields
  const [bankCode, setBankCode] = useState("0102"); // BDV por defecto
  const [phonePrefix, setPhonePrefix] = useState("0412");
  const [phoneNumber, setPhoneNumber] = useState("1234567");
  const [docType, setDocType] = useState<"V" | "E" | "J" | "G">("V");
  const [docNumber, setDocNumber] = useState("12345678");
  const [beneficiaryName, setBeneficiaryName] = useState("Mi Negocio / Comercio");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");

  // Logo upload
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Visual Customization
  const [headerTitle, setHeaderTitle] = useState("PAGO MÓVIL");
  const [headerSubtitle, setHeaderSubtitle] = useState("Aceptamos pagos de todos los bancos");
  const [theme, setTheme] = useState<AcrylicTheme>("clean");
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Canvas refs
  const singleQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const acrylicCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement>(null);

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
    return generatePagoMovilPayload(data, "suiche7b_json");
  }, [bankCode, fullPhone, docType, docNumber, beneficiaryName, amount, concept]);

  // Generate SVG QR Code
  const qrSvg = useMemo(() => {
    try {
      return generateQRSvg(qrPayload, {
        ecl: "M",
        fgColor: "#000000",
        bgColor: "#ffffff",
        margin: 1,
        size: 300,
      });
    } catch {
      return "";
    }
  }, [qrPayload]);

  // Render individual QR to hidden canvas
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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

    // Draw logo if exists
    let headerYOffset = 0;
    if (logoImgRef.current && logoDataUrl) {
      try {
        const logoMaxH = 120;
        const logoMaxW = 300;
        const imgW = logoImgRef.current.naturalWidth || 200;
        const imgH = logoImgRef.current.naturalHeight || 100;
        const ratio = Math.min(logoMaxW / imgW, logoMaxH / imgH);
        const drawW = imgW * ratio;
        const drawH = imgH * ratio;
        ctx.drawImage(logoImgRef.current, (width - drawW) / 2, 60, drawW, drawH);
        headerYOffset = 70;
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Header banner / Title
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(headerTitle.toUpperCase(), width / 2, 130 + headerYOffset);

    ctx.fillStyle = textMuted;
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(headerSubtitle, width / 2, 175 + headerYOffset);

    // Divider line
    ctx.strokeStyle = isDark ? "#334155" : "#e2e8f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 205 + headerYOffset);
    ctx.lineTo(width - 100, 205 + headerYOffset);
    ctx.stroke();

    // 3. QR Code Box (white background with rounded border)
    const qrBoxSize = 630;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 235 + headerYOffset;

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
    ctx.roundRect(width / 2 - 240, 895 + headerYOffset, 480, 50, 25);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 23px sans-serif";
    ctx.fillText("⚡ RED SUICHE 7B INTERBANCARIO", width / 2, 930 + headerYOffset);

    // 5. Data Card
    const cardX = 90;
    const cardY = 970 + headerYOffset;
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

      ctx.strokeStyle = isDark ? "#1e2a42" : "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 50, yPos + 68);
      ctx.lineTo(cardX + cardW - 50, yPos + 68);
      ctx.stroke();
    };

    drawRow("Beneficiario / Razón Social", beneficiaryName || "Titular", cardY + 60);
    drawRow("Banco Receptor", `${selectedBank.code} - ${selectedBank.shortName}`, cardY + 165);
    drawRow("Teléfono Afiliado", formatVenezuelanPhone(fullPhone), cardY + 270, true);
    drawRow("Cédula / RIF", formatVenezuelanDoc(docType, docNumber), cardY + 375, true);

    if (amount && parseFloat(amount) > 0) {
      drawRow("Monto a Pagar", `Bs. ${parseFloat(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, cardY + 480, true);
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = textMuted;
      ctx.font = "italic 22px sans-serif";
      ctx.fillText("El cliente digita el monto en su aplicación bancaria", width / 2, cardY + 500);
    }

    // 6. Footer branding
    ctx.textAlign = "center";
    ctx.fillStyle = textMuted;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Escanea este código desde la app de tu banco con la opción Pago Móvil QR", width / 2, cardY + 610);
  };

  const handleDownloadAcrylicPoster = () => {
    drawAcrylicToCanvas();
    const canvas = acrylicCanvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `cartel-pago-movil-${selectedBank.code}-${docNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const whatsappOrderMessage = encodeURIComponent(
    `Hola Alonso, diseñé mi cartel de Pago Móvil para mi negocio "${beneficiaryName}" en tu web alonsorios.dev y quisiera encargar el soporte físico de acrílico para mi mostrador.`
  );

  return (
    <div className="w-full space-y-10">
      {/* Hidden canvases and loaded image */}
      <canvas ref={singleQrCanvasRef} className="hidden" />
      <canvas ref={acrylicCanvasRef} className="hidden" />
      {logoDataUrl && <img ref={logoImgRef} src={logoDataUrl} alt="Logo" className="hidden" />}

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black uppercase tracking-wider mb-4">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Herramienta Oficial para Comercios en Venezuela</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          Creador de Carteles QR para <span className="text-yellow-400">Pago Móvil</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
          Diseña gratis tu cartel de mostrador en tamaño acrílico (10x15cm) con código QR oficial bajo la red **Suiche 7B**. Descarga en ultra alta resolución (300 DPI) listo para imprimir.
        </p>
      </div>

      {/* Main Grid: Form Left, Acrylic Stand Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Section 1: Bank Data */}
          <div>
            <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>1. Datos de tu Pago Móvil</span>
            </h3>

            <div className="space-y-4">
              {/* Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Institución Bancaria *</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                >
                  {VENEZUELA_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Número de Teléfono Afiliado *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
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
                    className="col-span-2 sm:col-span-3 bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-mono font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Document ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cédula o RIF del Beneficiario *</label>
                <div className="grid grid-cols-4 gap-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
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
                    className="col-span-3 bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-mono font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Beneficiary Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Negocio o Titular *</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Ej. Bodegón El Trigal, C.A. o Juan Pérez"
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                />
              </div>

              {/* Amount (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Monto Opcional (Bs.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Dejar vacío para que el cliente digite el monto libremente"
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-3 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logo and Styling */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>2. Personalización del Cartel</span>
            </h3>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Subir Logo de tu Negocio (Opcional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-[#090f1d] hover:bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-200 transition">
                  <Upload className="w-4 h-4 text-yellow-400" />
                  <span>{logoDataUrl ? "Cambiar Imagen" : "Subir Logo PNG / JPG"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Quitar Logo
                  </button>
                )}
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Tema de Color del Cartel</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("clean")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "clean"
                      ? "bg-white text-black border-yellow-400 shadow-md font-black ring-2 ring-yellow-400"
                      : "bg-[#090f1d] text-slate-300 border-slate-700 hover:bg-slate-800"
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
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-md font-black ring-2 ring-yellow-400"
                      : "bg-[#090f1d] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#070d19] border border-yellow-400" />
                  <span>Dark Luxe</span>
                  <span className="text-[10px] text-slate-400 font-normal">Fondo Oscuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("blue")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    theme === "blue"
                      ? "bg-blue-600 text-white border-blue-400 shadow-md font-black ring-2 ring-blue-400"
                      : "bg-[#090f1d] text-slate-300 border-slate-700 hover:bg-slate-800"
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
                      : "bg-[#090f1d] text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-400" />
                  <span>Esmeralda</span>
                  <span className="text-[10px] text-slate-400 font-normal">Fintech S7B</span>
                </button>
              </div>
            </div>

            {/* Custom Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Encabezado</label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full bg-[#090f1d] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Acrylic Stand Mockup & Downloads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
              Vista Previa para Soporte de Acrílico (10x15 cm)
            </span>

            {/* ACRYLIC STAND VISUAL CARD */}
            <div
              className={`w-full max-w-[340px] mx-auto rounded-3xl p-6 shadow-2xl border transition-all duration-300 flex flex-col items-center ${
                theme === "clean"
                  ? "bg-white text-slate-900 border-slate-300 shadow-slate-900/20"
                  : theme === "dark"
                  ? "bg-[#070d19] text-white border-yellow-500/40 shadow-black"
                  : theme === "blue"
                  ? "bg-white text-slate-900 border-blue-300"
                  : "bg-white text-slate-900 border-emerald-300"
              }`}
            >
              {/* Optional Logo */}
              {logoDataUrl && (
                <div className="mb-2 max-h-12 max-w-[180px] overflow-hidden flex items-center justify-center">
                  <img src={logoDataUrl} alt="Logo Comercio" className="max-h-12 object-contain" />
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-3">
                <h2
                  className={`text-xl font-black tracking-tight ${
                    theme === "dark"
                      ? "text-yellow-400"
                      : theme === "blue"
                      ? "text-blue-700"
                      : theme === "emerald"
                      ? "text-emerald-700"
                      : "text-slate-900"
                  }`}
                >
                  {headerTitle.toUpperCase()}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{headerSubtitle}</p>
              </div>

              {/* QR Visual */}
              <div className="p-3 bg-white rounded-2xl border border-slate-300 shadow-md w-48 h-48 flex items-center justify-center mb-2.5">
                {qrSvg && (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                )}
              </div>

              {/* Suiche 7B Chip */}
              <div
                className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-3 flex items-center gap-1 ${
                  theme === "dark"
                    ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Red Suiche 7B Interbancario</span>
              </div>

              {/* Legible Data Card */}
              <div
                className={`w-full rounded-2xl p-3.5 text-xs space-y-1.5 border text-left ${
                  theme === "dark"
                    ? "bg-[#0f172a] border-[#1e2a42] text-slate-200"
                    : theme === "blue"
                    ? "bg-blue-50/70 border-blue-100 text-slate-800"
                    : theme === "emerald"
                    ? "bg-emerald-50/70 border-emerald-100 text-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Beneficiario</span>
                  <span className="font-bold text-xs block truncate">{beneficiaryName || "Titular"}</span>
                </div>

                <div className="border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Banco</span>
                  <span className="font-bold text-xs block truncate">
                    {selectedBank.code} - {selectedBank.shortName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-black/5 dark:border-white/5 pb-1">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Teléfono</span>
                    <span className="font-black text-xs block font-mono">{formatVenezuelanPhone(fullPhone)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Cédula / RIF</span>
                    <span className="font-black text-xs block font-mono">{formatVenezuelanDoc(docType, docNumber)}</span>
                  </div>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="pt-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Monto</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 block font-mono">
                      Bs. {parseFloat(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-400 font-bold text-center mt-2.5">
                Escanea desde la app de tu banco con Pago Móvil QR
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleDownloadAcrylicPoster}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition transform hover:scale-[1.01] cursor-pointer text-sm"
              >
                <Download className="w-5 h-5" />
                <span>Descargar Cartel para Imprimir (PNG 300 DPI)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl border border-slate-700 text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Directamente</span>
              </button>
            </div>
          </div>

          {/* Lead Magnet 1: Buy Physical Acrylic Stand from Alonso */}
          <div className="bg-gradient-to-br from-yellow-950/40 via-[#0f172a] to-amber-950/30 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-yellow-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Servicio de Fabricación Física</span>
            </div>
            <h4 className="text-base font-black text-white">
              ¿Quieres este cartel listo en acrílico físico de alta calidad para tu mostrador?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Te fabricamos el soporte de acrílico transparente de 10x15cm impreso en papel fotográfico de alta resolución con base premium. Envíos a toda Venezuela.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Listo para colocar en tu caja o punto de venta.</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Envíos por MRW, Tealca o Zoom a nivel nacional.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={`https://wa.me/584129912840?text=${whatsappOrderMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs shadow-lg transition transform hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Encargar Acrílico Físico por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Lead Magnet 2: Hire Alonso for Software / Web */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
            <p className="text-xs font-bold text-slate-400 mb-1">
              Desarrollado por Alonso Ríos
            </p>
            <h4 className="text-sm font-black text-white mb-2">
              ¿Quieres automatizar tu facturación o crear tu tienda online?
            </h4>
            <p className="text-xs text-slate-300 mb-4">
              Creamos sistemas de cobro, páginas web y aplicaciones a la medida para empresas y emprendedores.
            </p>
            <a
              href="https://wa.me/584129912840?text=Hola%20Alonso,%20vi%20tu%20generador%20de%20Pago%20Movil%20y%20quisiera%20cotizar%20un%20sitio%20web%20o%20sistema"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-yellow-400 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Cotizar Software por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
