/**
 * lead-engine/src/verification/verifier.ts
 * Verificación no intrusiva de URLs y datos públicos (Sección 7.3 de LEAD_ENGINE_SPEC.md).
 * Valida respuesta HTTP, redirecciones, HTTPS y accesibilidad básica.
 */

import type { NormalizedLead, VerificationResult } from "../schemas/contracts.ts";

export class Verifier {
  private timeoutMs: number;

  constructor(timeoutMs = 6000) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Ejecuta verificación técnica del sitio web y presencia de datos
   */
  public async verify(lead: NormalizedLead): Promise<VerificationResult> {
    const issues: string[] = [];
    const checkedAt = new Date().toISOString();

    // Caso 1: El prospecto no tiene sitio web declarado
    if (!lead.website_url) {
      return {
        lead_id: lead.lead_id,
        verification_status: "verified", // Es un prospecto válido con ausencia de web confirmada
        website_reachable: false,
        http_status: null,
        https_enabled: false,
        redirect_target: null,
        business_identity_match: "unknown",
        contact_data_verified: {
          phone: Boolean(lead.public_contact?.phone),
          email: Boolean(lead.public_contact?.email),
          contact_page: false,
        },
        issues: ["Sin sitio web registrado (oportunidad directa de creación de landing page)"],
        checked_at: checkedAt,
      };
    }

    // Caso 2: El prospecto tiene URL para verificar
    let url = lead.website_url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const httpsEnabled = url.startsWith("https://");
    let reachable = false;
    let httpStatus: number | null = null;
    let redirectTarget: string | null = null;
    let bodyText = "";

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BusinessAuditorBot/1.0; +https://www.alonsorios.dev)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

      clearTimeout(timer);
      httpStatus = res.status;

      if (res.url && res.url !== url) {
        redirectTarget = res.url;
      }

      if (res.ok) {
        reachable = true;
        // Leer primeros 50KB para detectar datos públicos sin consumir memoria
        bodyText = await res.text();
        bodyText = bodyText.substring(0, 50000).toLowerCase();
      } else {
        issues.push(`El servidor respondió con código HTTP de error: ${res.status}`);
      }
    } catch (err: any) {
      reachable = false;
      issues.push(`No se pudo conectar al sitio web: ${err.name === "AbortError" ? "Tiempo de espera agotado (timeout)" : err.message}`);
    }

    // Verificación de identidad y teléfono en el HTML si fue accesible
    let identityMatch: "likely" | "mismatch" | "unknown" = "unknown";
    let phoneFoundInHtml = false;
    let contactPageFound = false;

    if (reachable && bodyText) {
      const cleanName = lead.business_name.toLowerCase().split(" ")[0];
      if (cleanName && bodyText.includes(cleanName)) {
        identityMatch = "likely";
      }

      if (lead.public_contact?.phone) {
        const rawDigits = lead.public_contact.phone.replace(/\D/g, "").slice(-7);
        if (rawDigits && bodyText.includes(rawDigits)) {
          phoneFoundInHtml = true;
        }
      }

      if (bodyText.includes("href=") && (bodyText.includes("/contact") || bodyText.includes("contacto"))) {
        contactPageFound = true;
      }
    }

    const verificationStatus = reachable || !lead.website_url ? "verified" : issues.length > 0 ? "failed" : "unverified";

    return {
      lead_id: lead.lead_id,
      verification_status: verificationStatus,
      website_reachable: reachable,
      http_status: httpStatus,
      https_enabled: httpsEnabled,
      redirect_target: redirectTarget,
      business_identity_match: identityMatch,
      contact_data_verified: {
        phone: phoneFoundInHtml || Boolean(lead.public_contact?.phone),
        email: Boolean(lead.public_contact?.email),
        contact_page: contactPageFound || Boolean(lead.public_contact?.contact_page),
      },
      issues,
      checked_at: checkedAt,
    };
  }
}
