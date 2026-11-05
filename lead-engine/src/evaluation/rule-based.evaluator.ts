/**
 * lead-engine/src/evaluation/rule-based.evaluator.ts
 * Evaluador comercial determinista y reproducible (Sección 10 y 11.4 de LEAD_ENGINE_SPEC.md).
 * No depende de modelos de IA externos.
 */

import type {
  NormalizedLead,
  AuditResult,
  VerificationResult,
  EvaluationResult,
  ScoreBreakdown,
  EvidenceItem,
} from "../schemas/contracts.ts";
import { validateEvaluation } from "../schemas/contracts.ts";
import { HardFilters } from "./hard-filters.ts";

export class RuleBasedEvaluator {
  private rubricVersion = "1.0";

  public evaluate(
    lead: NormalizedLead,
    verification?: VerificationResult,
    audit?: AuditResult
  ): EvaluationResult {
    // 1. Evaluación de filtros obligatorios
    const filter = HardFilters.evaluate(lead, verification, audit);

    // 2. Cálculo determinista de las 5 dimensiones
    const breakdown: ScoreBreakdown = {
      commercial_need: this.calculateNeed(lead, audit),
      product_fit: this.calculateProductFit(lead, filter.customDevRequired),
      implementation_ease: this.calculateEase(filter.complexity),
      conversion_potential: this.calculateConversionPotential(lead),
      evidence_activity: this.calculateEvidence(lead, verification),
    };

    const totalScore =
      breakdown.commercial_need +
      breakdown.product_fit +
      breakdown.implementation_ease +
      breakdown.conversion_potential +
      breakdown.evidence_activity;

    // 3. Determinación de la decisión comercial
    let decision: "priority" | "interesting" | "research" | "reject";

    if (!filter.passed || filter.customDevRequired) {
      decision = "reject";
    } else if (totalScore >= 80) {
      decision = "priority";
    } else if (totalScore >= 65) {
      decision = "interesting";
    } else if (totalScore >= 45) {
      decision = "research";
    } else {
      decision = "reject";
    }

    // 4. Recomendación de producto según necesidad
    let recommendedProduct: "landing_page" | "business_website" | "seo_speed_fix" | null = null;
    let commercialProblem = "Presencia digital básica funcional.";
    let outreachAngle = "Presentar propuesta de optimización de conversión y presencia web.";
    const reusableComponents: string[] = ["responsive_design", "contact_form"];

    if (!lead.website_url) {
      recommendedProduct = "landing_page";
      commercialProblem = "El negocio no tiene página web propia para recibir tráfico y convertir llamadas.";
      outreachAngle = "Crear una página web rápida y profesional que posicione en Google y facilite llamadas desde celulares.";
      reusableComponents.push("hero_section", "click_to_call", "services_grid");
    } else if (audit && audit.pagespeed.mobile.performance !== null && audit.pagespeed.mobile.performance < 50) {
      recommendedProduct = "landing_page";
      commercialProblem = "El sitio web móvil actual es lento y no cuenta con llamadas a la acción claras.";
      outreachAngle = "Modernizar el sitio para cargar en menos de un segundo y duplicar las llamadas de clientes.";
      reusableComponents.push("core_web_vitals_speed", "mobile_layout");
    } else if (lead.industry === "events_hospitality" || lead.industry === "med_spas_wellness") {
      recommendedProduct = "business_website";
      commercialProblem = "Requiere mostrar catálogo estructurado de servicios, testimonios y panel de contenidos.";
      outreachAngle = "Implementar un sitio web administrable para exhibir servicios, testimonios y recibir consultas.";
      reusableComponents.push("admin_dashboard", "gallery_slider", "lead_capture");
    } else {
      recommendedProduct = "seo_speed_fix";
      commercialProblem = "Optimización técnica y SEO local.";
      outreachAngle = "Mejorar la velocidad de carga y posicionamiento orgánico en su ciudad.";
    }

    // 5. Evidencias
    const evidence: EvidenceItem[] = [];
    if (!lead.website_url) {
      evidence.push({
        claim: "Sin sitio web oficial registrado en fuentes públicas",
        source_url: lead.sources[0]?.url || "public_registry",
        evidence_type: "public_observation",
        confidence: "high",
      });
    }
    if (lead.public_contact?.phone) {
      evidence.push({
        claim: `Teléfono comercial público disponible: ${lead.public_contact.phone}`,
        source_url: lead.sources[0]?.url || "public_registry",
        evidence_type: "contact_verification",
        confidence: "high",
      });
    }

    const result: EvaluationResult = {
      lead_id: lead.lead_id,
      decision,
      score: totalScore,
      score_breakdown: breakdown,
      confidence: "high",
      commercial_problem: commercialProblem,
      recommended_product: filter.passed ? recommendedProduct : null,
      estimated_complexity: filter.complexity,
      existing_components_reusable: reusableComponents,
      custom_development_required: filter.customDevRequired,
      reasons_to_reject: filter.reasonsToReject,
      outreach_angle: outreachAngle,
      evidence,
      missing_information: [],
      rubric_version: this.rubricVersion,
      evaluated_at: new Date().toISOString(),
    };

    // Validación estricta del contrato
    const val = validateEvaluation(result);
    if (!val.success) {
      throw new Error(`Error interno en RuleBasedEvaluator: ${val.errors.join(", ")}`);
    }

    return result;
  }

  private calculateNeed(lead: NormalizedLead, audit?: AuditResult): number {
    // Si no tiene web, la necesidad comercial es máxima (25 pts)
    if (!lead.website_url) return 25;

    // Si tiene web pero la auditoría detecta problemas de CTA o velocidad
    if (audit) {
      if (audit.website_features?.clear_primary_cta === "missing") return 20;
      if (audit.pagespeed.mobile.performance !== null && audit.pagespeed.mobile.performance < 45) return 18;
      if (audit.website_features?.click_to_call === "missing") return 15;
    }

    return 10;
  }

  private calculateProductFit(lead: NormalizedLead, customDevRequired: boolean): number {
    if (customDevRequired) return 0;
    // Si es un nicho de servicios directos que encaja 100% con landing page
    if (lead.industry === "home_services" || lead.industry === "auto_services") return 25;
    // Si encaja con sitio administrable
    if (lead.industry === "med_spas_wellness" || lead.industry === "events_hospitality") return 22;
    return 18;
  }

  private calculateEase(complexity: "low" | "medium" | "high" | "unknown"): number {
    switch (complexity) {
      case "low":
        return 20;
      case "medium":
        return 14;
      case "high":
        return 0;
      default:
        return 10;
    }
  }

  private calculateConversionPotential(lead: NormalizedLead): number {
    // Servicios de alta urgencia/demanda directa
    if (lead.subindustry === "hvac" || lead.subindustry === "plumbing" || lead.subindustry === "roofing") {
      return 15;
    }
    if (lead.industry === "home_services" || lead.industry === "auto_services") {
      return 13;
    }
    return 11;
  }

  private calculateEvidence(lead: NormalizedLead, verification?: VerificationResult): number {
    let score = 5;
    if (lead.business_status === "operational") score += 4;
    if (lead.public_contact?.phone) score += 3;
    if (verification && verification.website_reachable) score += 3;
    return Math.min(15, score);
  }
}
