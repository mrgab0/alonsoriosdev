/**
 * lead-engine/src/utils/normalize.ts
 * Normalización determinista de dominios, teléfonos y nombres de negocios.
 */

/**
 * Normaliza un dominio web para comparaciones deterministas:
 * "https://www.ExampleHVAC.com/contact/" -> "examplehvac.com"
 */
export function normalizeDomain(urlOrDomain: string | null | undefined): string | null {
  if (!urlOrDomain) return null;
  let clean = urlOrDomain.trim().toLowerCase();

  // Quitar protocolo
  clean = clean.replace(/^[a-zA-Z]+:\/\//, "");

  // Quitar www.
  clean = clean.replace(/^www\./, "");

  // Quitar paths, query params y hashes
  clean = clean.split("/")[0].split("?")[0].split("#")[0];

  // Quitar puertos si existen
  clean = clean.split(":")[0];

  // Validar formato mínimo de dominio
  if (clean.includes(".") && clean.length >= 4) {
    return clean;
  }
  return null;
}

/**
 * Normaliza un número telefónico (enfocado en estándar estadounidense US +1):
 * "(713) 555-0199" -> "+17135550199"
 */
export function normalizePhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  // Extraer solo dígitos
  const digits = rawPhone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  } else if (digits.length > 7) {
    return `+${digits}`;
  }
  return null;
}

/**
 * Normaliza nombres comerciales para clustering y deduplicación:
 * "  Acme Air Conditioning, LLC  " -> "acme air conditioning"
 */
export function normalizeBusinessName(name: string): string {
  if (!name) return "";
  let clean = name.trim().toLowerCase();

  // Eliminar sufijos corporativos comunes en USA que suelen variar entre fuentes
  clean = clean.replace(/\b(llc|inc|corp|corporation|co|ltd|limited|services)\b\.?/gi, "");

  // Normalizar espacios y caracteres especiales
  clean = clean.replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();

  return clean;
}

/**
 * Genera una clave compuesta única e idempotente para el negocio:
 * Prioridad 1: Dominio normalizado
 * Prioridad 2: Teléfono normalizado
 * Prioridad 3: Nombre normalizado + Ciudad
 */
export function generateDeduplicationKey(domain: string | null, phone: string | null, name: string, city: string): string {
  const normDomain = normalizeDomain(domain);
  if (normDomain) return `dom:${normDomain}`;

  const normPhone = normalizePhone(phone);
  if (normPhone) return `tel:${normPhone}`;

  const normName = normalizeBusinessName(name);
  const normCity = city ? city.trim().toLowerCase() : "unknown";
  return `name:${normName}@${normCity}`;
}
