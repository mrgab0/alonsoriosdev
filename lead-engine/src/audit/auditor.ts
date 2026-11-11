/**
 * lead-engine/src/audit/auditor.ts
 * Auditoría web no intrusiva y PageSpeed Insights (Sección 7.4 de LEAD_ENGINE_SPEC.md).
 * Analiza llamadas a la acción, click-to-call, formularios y rendimiento.
 */

import type {
  NormalizedLead,
  VerificationResult,
  AuditResult,
  WebsiteFeatures,
  EvidenceItem,
} from "../schemas/contracts.ts";

export class WebsiteAuditor {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PAGESPEED_API_KEY || null;
  }

  /**
   * Ejecuta la auditoría no invasiva de señales comerciales y rendimiento
   */
  public async audit(lead: NormalizedLead, verification?: VerificationResult): Promise<AuditResult> {
    const auditedAt = new Date().toISOString();

    // Si no tiene sitio web o no fue accesible, omitir auditoría técnica profunda
    if (!lead.website_url || (verification && !verification.website_reachable)) {
      return {
        lead_id: lead.lead_id,
        audit_status: "skipped",
        pagespeed: {
          mobile: { performance: null, accessibility: null, best_practices: null, seo: null },
          desktop: { performance: null, accessibility: null, best_practices: null, seo: null },
        },
        website_features: {
          clear_primary_cta: "unknown",
          click_to_call: "missing",
          contact_form: "unknown",
          online_booking: "not_detected",
          online_catalog: "not_detected",
          online_checkout: "not_detected",
          mobile_navigation: "unknown",
        },
        observations: ["Auditoría web omitida: Negocio sin sitio web activo."],
        evidence: [
          {
            claim: "Negocio sin presencia web oficial propia para captar clientes en Google",
            source_url: lead.sources[0]?.url || "registro_publico",
            evidence_type: "absence_observation",
            confidence: "high",
          },
        ],
        audited_at: auditedAt,
      };
    }

    const observations: string[] = [];
    const evidence: EvidenceItem[] = [];

    // 1. Análisis estático de elementos HTML públicos
    const features = await this.inspectHtmlFeatures(lead.website_url, observations, evidence);

    // 2. Consulta de rendimiento (Google PageSpeed API o medición de latencia)
    const pagespeedScores = await this.queryPerformance(lead.website_url, observations, evidence);

    return {
      lead_id: lead.lead_id,
      audit_status: "completed",
      pagespeed: pagespeedScores,
      website_features: features,
      observations,
      evidence,
      audited_at: auditedAt,
    };
  }

  private async inspectHtmlFeatures(
    url: string,
    observations: string[],
    evidence: EvidenceItem[]
  ): Promise<WebsiteFeatures> {
    const features: WebsiteFeatures = {
      clear_primary_cta: "unknown",
      click_to_call: "missing",
      contact_form: "missing",
      online_booking: "not_detected",
      online_catalog: "not_detected",
      online_checkout: "not_detected",
      mobile_navigation: "unknown",
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const html = (await res.text()).toLowerCase();

        // Detección de Click-to-Call (tel:)
        if (html.includes("href=\"tel:") || html.includes("href='tel:")) {
          features.click_to_call = "present";
          observations.push("El sitio cuenta con enlace directo click-to-call para teléfonos móviles.");
        } else {
          features.click_to_call = "missing";
          observations.push("No se encontró enlace click-to-call directo en el sitio móvil.");
          evidence.push({
            claim: "El sitio carece de botón 'Click-to-Call' para llamar directamente con un toque",
            source_url: url,
            evidence_type: "html_inspection",
            confidence: "high",
          });
        }

        // Detección de Formulario
        if (html.includes("<form") && (html.includes("type=\"submit\"") || html.includes("<button"))) {
          features.contact_form = "present";
        } else {
          features.contact_form = "missing";
          observations.push("No se detectó formulario de contacto o solicitud de cotización en la página principal.");
        }

        // Detección de Llamada a la Acción (CTA)
        const ctaKeywords = ["quote", "presupuesto", "estimate", "call now", "llamar", "contact us", "agenda"];
        const hasCta = ctaKeywords.some((kw) => html.includes(kw));
        features.clear_primary_cta = hasCta ? "present" : "missing";

        // Detección de Menú móvil
        if (html.includes("hamburger") || html.includes("menu-toggle") || html.includes("navbar-toggler")) {
          features.mobile_navigation = "present";
        }

        // Detección de Booking de terceros (ej. Calendly, Fresha, Mindbody)
        if (html.includes("calendly") || html.includes("fresha") || html.includes("square.site") || html.includes("schedul")) {
          features.online_booking = "third_party";
          observations.push("Utiliza sistema de reservas de un tercero integrado.");
        }
      }
    } catch {
      observations.push("No fue posible inspeccionar el HTML debido a bloqueo o tiempo de espera.");
    }

    return features;
  }

  private async queryPerformance(
    url: string,
    observations: string[],
    evidence: EvidenceItem[]
  ): Promise<AuditResult["pagespeed"]> {
    const defaultScores: AuditResult["pagespeed"] = {
      mobile: { performance: 50, accessibility: null, best_practices: null, seo: null },
      desktop: { performance: 65, accessibility: null, best_practices: null, seo: null },
    };

    // Si hay API key disponible, consultar PageSpeed Insights
    if (this.apiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
          url
        )}&strategy=mobile&key=${this.apiKey}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data: any = await res.json();
          const perf = Math.round(data?.lighthouseResult?.categories?.performance?.score * 100) || null;
          const seo = Math.round(data?.lighthouseResult?.categories?.seo?.score * 100) || null;

          defaultScores.mobile.performance = perf;
          defaultScores.mobile.seo = seo;

          if (perf !== null && perf < 50) {
            observations.push(`Rendimiento móvil crítico según PageSpeed: ${perf}/100.`);
            evidence.push({
              claim: `Puntaje Google PageSpeed móvil deficiente (${perf}/100)`,
              source_url: url,
              evidence_type: "lighthouse_audit",
              confidence: "high",
            });
          }
          return defaultScores;
        }
      } catch {
        // Fallback silencioso si la API falla
      }
    }

    // Medición ligera de TTFB (Time to First Byte) local sin dependencias
    try {
      const start = Date.now();
      await fetch(url, { method: "HEAD" });
      const duration = Date.now() - start;

      let estimatedScore = 80;
      if (duration > 1500) estimatedScore = 35;
      else if (duration > 800) estimatedScore = 55;

      defaultScores.mobile.performance = estimatedScore;
      defaultScores.desktop.performance = Math.min(100, estimatedScore + 15);

      if (estimatedScore < 50) {
        observations.push(`Tiempo de respuesta inicial lento: ${duration}ms.`);
      }
    } catch {
      // Dejar valores estimados
    }

    return defaultScores;
  }
}
