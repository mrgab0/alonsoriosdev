/**
 * lead-engine/src/evaluation/nemotron.evaluator.ts
 * Evaluador multimodal basado en NVIDIA Nemotron 3.5 Super VL 120B.
 * Realiza discriminación visual y comercial determinista según LEAD_ENGINE_SPEC.md.
 */

import type { NormalizedLead, AuditResult, EvaluationResult } from "../schemas/contracts.ts";
import { validateEvaluation } from "../schemas/contracts.ts";
import type { LeadEvaluator, EvaluatorInput } from "./evaluator.interface.ts";
import { RuleBasedEvaluator } from "./rule-based.evaluator.ts";

export class NemotronEvaluator implements LeadEvaluator {
  name = "nemotron-3.5-super-vl-120b";
  private apiKey: string;
  private endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
  private model = "nvidia/nemotron-3.5-super-vl-120b-a12b";
  private fallbackEvaluator: RuleBasedEvaluator;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || "";
    this.fallbackEvaluator = new RuleBasedEvaluator();
  }

  async evaluate(input: EvaluatorInput): Promise<EvaluationResult> {
    const { lead, audit, screenshotBase64 } = input;

    // Si no hay API key configurada, fallback determinista a reglas
    if (!this.apiKey) {
      console.warn("⚠️ [NEMOTRON] NVIDIA_API_KEY no detectada. Usando fallback RuleBasedEvaluator.");
      return this.fallbackEvaluator.evaluate(lead, audit);
    }

    try {
      const prompt = this.buildPrompt(lead, audit);
      const messages: any[] = [
        {
          role: "system",
          content: `You are an elite B2B Commercial Evaluator analyzing US local small businesses for website web development and speed optimization sales.
You MUST output valid, raw JSON matching the required schema without markdown wrapping, code blocks, or extra text.`,
        },
      ];

      const userContent: any[] = [{ type: "text", text: prompt }];

      if (screenshotBase64) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${screenshotBase64}`,
          },
        });
      }

      messages.push({
        role: "user",
        content: userContent,
      });

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.1,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content || "";
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(cleanedText);
      parsed.lead_id = lead.lead_id;
      parsed.evaluated_at = new Date().toISOString();
      parsed.rubric_version = "nemotron-v1.0";

      const validation = validateEvaluation(parsed);
      if (!validation.success) {
        console.warn("⚠️ [NEMOTRON] Respuesta no pasó validación de contrato:", validation.errors);
        return this.fallbackEvaluator.evaluate(lead, audit);
      }

      return validation.data!;
    } catch (err: any) {
      console.warn(`⚠️ [NEMOTRON ERROR]: ${err.message}. Empleando fallback determinista.`);
      return this.fallbackEvaluator.evaluate(lead, audit);
    }
  }

  private buildPrompt(lead: NormalizedLead, audit?: AuditResult): string {
    return `Analyze this business lead and output JSON strictly conforming to this structure:
{
  "decision": "priority" | "interesting" | "research" | "reject",
  "score": number (0-100),
  "score_breakdown": {
    "commercial_need": number (0-25),
    "product_fit": number (0-25),
    "implementation_ease": number (0-20),
    "conversion_potential": number (0-15),
    "evidence_activity": number (0-15)
  },
  "confidence": "high" | "medium" | "low",
  "lead_temperature": "HOT" | "WARM" | "COLD",
  "outreach_channel": "phone_sms" | "executive_email" | "instagram_dm" | "contact_form" | "none",
  "commercial_problem": string,
  "recommended_product": "landing_page" | "business_website" | "seo_speed_fix" | null,
  "estimated_complexity": "low" | "medium" | "high",
  "existing_components_reusable": string[],
  "custom_development_required": boolean,
  "reasons_to_reject": string[],
  "outreach_angle": string,
  "killer_screenshot_angle": string,
  "closing_argument": string,
  "visual_flaws": string[],
  "evidence": [{"claim": string, "source_url": string, "evidence_type": string, "confidence": "high"}],
  "missing_information": []
}

CRITICAL RULES:
1. sum(score_breakdown) MUST exactly equal score.
2. If business has no website or missing click-to-call, commercial_need >= 20.
3. If business is closed, decision MUST be "reject", score = 0, score_breakdown all 0.
4. Lead Temperature: score >= 80 -> "HOT", >= 65 -> "WARM", else "COLD".

LEAD CONTEXT:
Business Name: ${lead.business_name}
Industry: ${lead.industry} (${lead.subindustry})
Location: ${lead.city}, ${lead.state}, ${lead.country}
Website URL: ${lead.website_url || "NONE (NO WEBSITE)"}
Phone: ${lead.public_contact?.phone || "NONE"}
Email: ${lead.public_contact?.email || "NONE"}
Status: ${lead.business_status}
Audit summary: ${JSON.stringify(audit?.website_features || {})}
Pagespeed Mobile: ${audit?.pagespeed?.mobile?.performance ?? "N/A"}`;
  }
}
