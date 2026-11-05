/**
 * lead-engine/src/schemas/contracts.ts
 * Contratos JSON y validadores deterministas estrictos según LEAD_ENGINE_SPEC.md (Sección 11).
 */

export interface PublicContact {
  phone: string | null;
  email: string | null;
  contact_page: string | null;
  instagram: string | null;
}

export interface LeadSource {
  url: string;
  type: string;
  retrieved_at: string;
}

export interface NormalizedLead {
  lead_id: string;
  business_name: string;
  industry: string;
  subindustry: string;
  country: string;
  state: string;
  city: string;
  website_url: string | null;
  domain: string | null;
  public_contact: PublicContact;
  business_status: "operational" | "closed" | "unknown";
  sources: LeadSource[];
  discovered_at: string;
  // Campos operacionales añadidos por auditoría/evaluación si aplican
  known_tech_stack?: string[];
  requires_custom_app?: boolean;
  requires_complex_booking?: boolean;
}

export interface VerificationResult {
  lead_id: string;
  verification_status: "verified" | "failed" | "unverified";
  website_reachable: boolean;
  http_status: number | null;
  https_enabled: boolean;
  redirect_target: string | null;
  business_identity_match: "likely" | "mismatch" | "unknown";
  contact_data_verified: {
    phone: boolean;
    email: boolean;
    contact_page: boolean;
  };
  issues: string[];
  checked_at: string;
}

export interface WebsiteFeatures {
  clear_primary_cta: "present" | "missing" | "unknown";
  click_to_call: "present" | "missing" | "unknown";
  contact_form: "present" | "missing" | "unknown";
  online_booking: "present" | "not_detected" | "third_party";
  online_catalog: "present" | "not_detected";
  online_checkout: "present" | "not_detected";
  mobile_navigation: "present" | "broken" | "unknown";
}

export interface AuditResult {
  lead_id: string;
  audit_status: "completed" | "skipped" | "failed";
  pagespeed: {
    mobile: {
      performance: number | null;
      accessibility: number | null;
      best_practices: number | null;
      seo: number | null;
    };
    desktop: {
      performance: number | null;
      accessibility: number | null;
      best_practices: number | null;
      seo: number | null;
    };
  };
  website_features: WebsiteFeatures;
  observations: string[];
  evidence: Array<{
    claim: string;
    source_url: string;
    evidence_type: string;
    confidence: "high" | "medium" | "low";
  }>;
  audited_at: string;
}

export interface ScoreBreakdown {
  commercial_need: number;     // Máx: 25
  product_fit: number;         // Máx: 25
  implementation_ease: number; // Máx: 20
  conversion_potential: number;// Máx: 15
  evidence_activity: number;   // Máx: 15
}

export interface EvidenceItem {
  claim: string;
  source_url: string;
  evidence_type: string;
  confidence: "high" | "medium" | "low";
}

export interface EvaluationResult {
  lead_id: string;
  decision: "priority" | "interesting" | "research" | "reject";
  score: number; // 0 a 100
  score_breakdown: ScoreBreakdown;
  confidence: "high" | "medium" | "low";
  commercial_problem: string;
  recommended_product: "landing_page" | "business_website" | "seo_speed_fix" | null;
  estimated_complexity: "low" | "medium" | "high" | "unknown";
  existing_components_reusable: string[];
  custom_development_required: boolean;
  reasons_to_reject: string[];
  outreach_angle: string;
  evidence: EvidenceItem[];
  missing_information: string[];
  rubric_version: string;
  evaluated_at: string;
}

export interface ValidationOutput<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

/**
 * Validador estricto para NormalizedLead
 */
export function validateLead(input: any): ValidationOutput<NormalizedLead> {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { success: false, errors: ["El objeto prospecto no es válido o está vacío."] };
  }

  if (!input.lead_id || typeof input.lead_id !== "string") errors.push("lead_id es requerido y debe ser string.");
  if (!input.business_name || typeof input.business_name !== "string") errors.push("business_name es requerido.");
  if (!input.industry || typeof input.industry !== "string") errors.push("industry es requerida.");
  if (!input.country || typeof input.country !== "string") errors.push("country es requerido.");
  if (!input.sources || !Array.isArray(input.sources)) errors.push("sources debe ser un array con al menos una fuente.");

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: input as NormalizedLead,
    errors: [],
  };
}

/**
 * Validador estricto para EvaluationResult (cumpliendo Sección 11.4)
 */
export function validateEvaluation(res: any): ValidationOutput<EvaluationResult> {
  const errors: string[] = [];
  if (!res || typeof res !== "object") {
    return { success: false, errors: ["El resultado de evaluación es nulo."] };
  }

  if (!res.lead_id) errors.push("lead_id es requerido.");
  if (!["priority", "interesting", "research", "reject"].includes(res.decision)) {
    errors.push(`Decisión inválida: ${res.decision}`);
  }

  if (typeof res.score !== "number" || res.score < 0 || res.score > 100) {
    errors.push(`El score debe estar entre 0 y 100. Recibido: ${res.score}`);
  }

  const b = res.score_breakdown;
  if (!b) {
    errors.push("score_breakdown es requerido.");
  } else {
    if (b.commercial_need < 0 || b.commercial_need > 25) errors.push("commercial_need debe estar entre 0 y 25.");
    if (b.product_fit < 0 || b.product_fit > 25) errors.push("product_fit debe estar entre 0 y 25.");
    if (b.implementation_ease < 0 || b.implementation_ease > 20) errors.push("implementation_ease debe estar entre 0 y 20.");
    if (b.conversion_potential < 0 || b.conversion_potential > 15) errors.push("conversion_potential debe estar entre 0 y 15.");
    if (b.evidence_activity < 0 || b.evidence_activity > 15) errors.push("evidence_activity debe estar entre 0 y 15.");

    const sum = b.commercial_need + b.product_fit + b.implementation_ease + b.conversion_potential + b.evidence_activity;
    if (sum !== res.score) {
      errors.push(`Inconsistencia: La suma de breakdown (${sum}) no coincide con el score total (${res.score}).`);
    }
  }

  if (!["high", "medium", "low"].includes(res.confidence)) {
    errors.push(`Confianza inválida: ${res.confidence}`);
  }

  if (typeof res.custom_development_required !== "boolean") {
    errors.push("custom_development_required debe ser booleano.");
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? (res as EvaluationResult) : undefined,
    errors,
  };
}
