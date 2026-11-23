/**
 * lead-engine/src/adk/evaluation.agent.ts
 * Componente ADK: Encapsula la evaluación comercial y discriminación (Reglas + Nemotron opcional).
 */

import type { NormalizedLead, VerificationResult, AuditResult, EvaluationResult } from "../schemas/contracts.ts";
import type { LeadEvaluator } from "../evaluation/evaluator.interface.ts";
import { RuleBasedEvaluator } from "../evaluation/rule-based.evaluator.ts";
import { NemotronEvaluator } from "../evaluation/nemotron.evaluator.ts";
import type { BaseAgentComponent, ComponentMetadata, ComponentExecutionResult, ExecutionContext } from "./component.interface.ts";

export interface EvaluationAgentInput {
  lead: NormalizedLead;
  verification?: VerificationResult;
  audit?: AuditResult;
  screenshotBase64?: string;
  preferSemantic?: boolean;
}

export class LeadEvaluationAgent implements BaseAgentComponent<EvaluationAgentInput, EvaluationResult> {
  readonly metadata: ComponentMetadata = {
    name: "LeadEvaluationAgent",
    version: "1.0",
    responsibility: "Puntuar en 5 dimensiones, aplicar filtros duros y generar ángulos de venta.",
    timeoutMs: 35000,
  };

  private ruleEvaluator = new RuleBasedEvaluator();
  private semanticEvaluator?: NemotronEvaluator;

  constructor(apiKey?: string) {
    if (apiKey || process.env.NVIDIA_API_KEY) {
      this.semanticEvaluator = new NemotronEvaluator(apiKey);
    }
  }

  async execute(
    input: EvaluationAgentInput,
    context?: Partial<ExecutionContext>
  ): Promise<ComponentExecutionResult<EvaluationResult>> {
    const t0 = Date.now();

    try {
      let result: EvaluationResult;

      // Si se solicita semántico y está disponible Nemotron
      if (input.preferSemantic && this.semanticEvaluator) {
        const evalPromise = this.semanticEvaluator.evaluate({
          lead: input.lead,
          audit: input.audit,
          screenshotBase64: input.screenshotBase64,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout de evaluación semántica excedido (${this.metadata.timeoutMs}ms)`)), this.metadata.timeoutMs)
        );

        result = await Promise.race([evalPromise, timeoutPromise]);
      } else {
        // Evaluación determinista rápida
        result = this.ruleEvaluator.evaluateDirect(input.lead, input.verification, input.audit);
      }

      return {
        success: true,
        data: result,
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    } catch (err: any) {
      // Fallback determinista garantizado
      const fallbackResult = this.ruleEvaluator.evaluateDirect(input.lead, input.verification, input.audit);
      return {
        success: true,
        data: fallbackResult,
        error: {
          code: "SEMANTIC_EVALUATION_FALLBACK",
          message: err.message,
          fatal: false,
        },
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    }
  }
}
