export interface VenezuelaBank {
  code: string;
  name: string;
  shortName: string;
}

export const VENEZUELA_BANKS: VenezuelaBank[] = [
  { code: "0102", name: "Banco de Venezuela, S.A. Banco Universal", shortName: "Banco de Venezuela (BDV)" },
  { code: "0134", name: "Banesco Banco Universal, C.A.", shortName: "Banesco" },
  { code: "0105", name: "Banco Mercantil, C.A. Banco Universal", shortName: "Mercantil" },
  { code: "0108", name: "Banco Provincial, S.A. Banco Universal", shortName: "BBVA Provincial" },
  { code: "0172", name: "Bancamiga Banco Universal, C.A.", shortName: "Bancamiga" },
  { code: "0151", name: "Banco Nacional de Crédito, C.A. Banco Universal", shortName: "BNC" },
  { code: "0114", name: "Bancaribe C.A. Banco Universal", shortName: "Bancaribe" },
  { code: "0163", name: "Banco del Tesoro, C.A. Banco Universal", shortName: "Banco del Tesoro" },
  { code: "0175", name: "Banco Bicentenario del Pueblo, Banco Universal C.A.", shortName: "Banco Bicentenario" },
  { code: "0115", name: "Banco Exterior, C.A. Banco Universal", shortName: "Banco Exterior" },
  { code: "0174", name: "Banplus Banco Universal, C.A.", shortName: "Banplus" },
  { code: "0104", name: "Venezolano de Crédito, S.A. Banco Universal", shortName: "Venezolano de Crédito" },
  { code: "0156", name: "100% Banco, Banco Universal C.A.", shortName: "100% Banco" },
  { code: "0138", name: "Banco Plaza, Banco Universal", shortName: "Banco Plaza" },
  { code: "0157", name: "Banco Del Sur, Banco Universal", shortName: "Del Sur" },
  { code: "0168", name: "Bancrecer, S.A. Banco Microfinanciero", shortName: "Bancrecer" },
  { code: "0171", name: "Banco Activo, Banco Universal", shortName: "Banco Activo" },
  { code: "0128", name: "Banco Caroní, C.A. Banco Universal", shortName: "Banco Caroní" },
  { code: "0166", name: "Banco Agrícola de Venezuela, C.A.", shortName: "Banco Agrícola" },
  { code: "0137", name: "Banco Sofitasa, Banco Universal", shortName: "Sofitasa" },
  { code: "0177", name: "Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)", shortName: "BANFANB" },
  { code: "0169", name: "Mi Banco, Banco Microfinanciero C.A.", shortName: "Mi Banco" },
];

export interface PagoMovilData {
  bankCode: string;
  phone: string;
  docType: "V" | "E" | "J" | "G";
  docNumber: string;
  beneficiaryName: string;
  amount?: string;
  concept?: string;
}

/**
 * Genera el payload de datos para el código QR de Pago Móvil.
 * Estructurado bajo el estándar interbancario de Suiche 7B (compatible con apps bancarias BDV, Bancamiga, etc.).
 */
export function generatePagoMovilPayload(data: PagoMovilData, format: "suiche7b_json" | "delimited" | "readable" = "suiche7b_json"): string {
  const cleanPhone = data.phone.replace(/[^0-9]/g, "");
  const cleanDocNumber = data.docNumber.replace(/[^0-9]/g, "");
  const fullDoc = `${data.docType}${cleanDocNumber}`;

  if (format === "suiche7b_json") {
    // Formato JSON estructurado ampliamente interpretado por lectores QR bancarios
    const payloadObj: Record<string, string> = {
      banco: data.bankCode,
      telefono: cleanPhone,
      cedula: fullDoc,
    };
    if (data.amount && parseFloat(data.amount) > 0) {
      payloadObj.monto = data.amount;
    }
    if (data.concept?.trim()) {
      payloadObj.concepto = data.concept.trim();
    }
    return JSON.stringify(payloadObj);
  }

  if (format === "delimited") {
    // Formato delimitado por pipes / estándar alternativo
    let str = `PAGOMOVIL|${data.bankCode}|${cleanPhone}|${fullDoc}`;
    if (data.amount && parseFloat(data.amount) > 0) {
      str += `|${data.amount}`;
    }
    return str;
  }

  // Formato legible para cámara estándar de smartphones
  return `PAGO MÓVIL\nBanco: ${data.bankCode}\nTel: ${cleanPhone}\nID: ${fullDoc}\nTitular: ${data.beneficiaryName}`;
}

export function formatVenezuelanPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length === 11) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 7)}.${clean.slice(7)}`;
  }
  return phone;
}

export function formatVenezuelanDoc(docType: string, docNumber: string): string {
  const clean = docNumber.replace(/[^0-9]/g, "");
  if (!clean) return `${docType}-`;
  // Formatear con separador de miles si es cédula
  if (clean.length <= 8) {
    const formattedNum = Number(clean).toLocaleString("es-VE");
    return `${docType}-${formattedNum}`;
  }
  // RIF o empresa
  return `${docType}-${clean}`;
}
