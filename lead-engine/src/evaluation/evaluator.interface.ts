import type { NormalizedLead, AuditResult, EvaluationResult } from "../schemas/contracts.ts";

export interface EvaluatorInput {
  lead: NormalizedLead;
  audit?: AuditResult;
  screenshotBase64?: string;
}

export interface LeadEvaluator {
  name: string;
  evaluate(input: EvaluatorInput): Promise<EvaluationResult>;
}
