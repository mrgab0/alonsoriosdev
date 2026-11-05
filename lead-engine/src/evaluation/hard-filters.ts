/**
 * lead-engine/src/evaluation/hard-filters.ts
 * Filtros deterministas de descarte obligatorio y clasificación de complejidad (Sección 9 de LEAD_ENGINE_SPEC.md).
 * Estas son reglas estrictas en código; nunca son decisiones libres de un modelo.
 */

import type { NormalizedLead, AuditResult, VerificationResult } from "../schemas/contracts.ts";

export interface HardFilterResult {
  passed: boolean;
  reasonsToReject: string[];
  complexity: "low" | "medium" | "high" | "unknown";
  customDevRequired: boolean;
}

export class HardFilters {
  /**
   * Evalúa los filtros obligatorios de descarte sobre un prospecto
   */
  public static evaluate(
    lead: NormalizedLead,
    verification?: VerificationResult,
    audit?: AuditResult
  ): HardFilterResult {
    const reasonsToReject: string[] = [];
    let customDevRequired = false;
    let complexity: "low" | "medium" | "high" | "unknown" = "low";

    // Regla 1: Negocio cerrado permanentemente
    if (lead.business_status === "closed") {
      reasonsToReject.push("El negocio figura como cerrado o inactivo.");
    }

    // Regla 2: Inexistencia o falta total de datos de contacto
    if (!lead.website_url && !lead.public_contact?.phone && !lead.public_contact?.email) {
      reasonsToReject.push("No existen datos mínimos de contacto ni presencia web confirmable.");
    }

    // Regla 3: Dominio de marketplace o directorio de terceros (no es sitio propio)
    if (lead.domain) {
      const marketplaceDomains = [
        "yelp.com",
        "facebook.com",
        "instagram.com",
        "yellowpages.com",
        "angi.com",
        "thumbtack.com",
        "tripadvisor.com",
        "foursquare.com",
      ];
      if (marketplaceDomains.some((m) => lead.domain?.endsWith(m))) {
        reasonsToReject.push(`El enlace proporcionado (${lead.domain}) pertenece a una plataforma o marketplace de terceros, no a un sitio propio.`);
      }
    }

    // Regla 4: Verificación técnica fallida
    if (verification && verification.verification_status === "failed") {
      reasonsToReject.push(`Fallo crítico de verificación técnica: ${verification.issues.join(", ")}`);
    }

    // Regla 5: Requerimientos de desarrollo fuera del catálogo (CRM, POS, ERP, Booking complejo)
    if (lead.requires_custom_app || lead.requires_complex_booking) {
      customDevRequired = true;
      complexity = "high";
      reasonsToReject.push("El prospecto requiere integraciones especiales o software fuera del catálogo (CRM/POS/Booking multi-empleado).");
    }

    // Clasificación de complejidad
    if (!customDevRequired) {
      if (!lead.website_url) {
        // Sin sitio web previo: Caso ideal para Landing Page con plantilla probada
        complexity = "low";
      } else if (audit && audit.pagespeed.mobile.performance !== null && audit.pagespeed.mobile.performance < 50) {
        // Sitio lento o desactualizado: Reemplazo con Landing Page o Fix de rendimiento
        complexity = "low";
      } else if (lead.industry === "events_hospitality" || lead.industry === "med_spas_wellness") {
        // Múltiples páginas o catálogo informativo
        complexity = "medium";
      }
    }

    return {
      passed: reasonsToReject.length === 0,
      reasonsToReject,
      complexity,
      customDevRequired,
    };
  }
}
