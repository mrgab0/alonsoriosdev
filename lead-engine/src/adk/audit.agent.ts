/**
 * lead-engine/src/adk/audit.agent.ts
 * Componente ADK: Encapsula la auditoría no invasiva de características web y Core Web Vitals.
 */

import type { NormalizedLead, VerificationResult, AuditResult } from "../schemas/contracts.ts";
import { WebsiteAuditor } from "../audit/auditor.ts";
import type { BaseAgentComponent, ComponentMetadata, ComponentExecutionResult, ExecutionContext } from "./component.interface.ts";

export interface AuditAgentInput {
  lead: NormalizedLead;
  verification?: VerificationResult;
}

export class WebsiteAuditAgent implements BaseAgentComponent<AuditAgentInput, AuditResult> {
  readonly metadata: ComponentMetadata = {
    name: "WebsiteAuditAgent",
    version: "1.0",
    responsibility: "Inspeccionar señales comerciales web (PageSpeed, CTAs, click-to-call).",
    timeoutMs: 10000,
  };

  private internalAuditor = new WebsiteAuditor();

  async execute(
    input: AuditAgentInput,
    context?: Partial<ExecutionContext>
  ): Promise<ComponentExecutionResult<AuditResult>> {
    const t0 = Date.now();

    try {
      const auditPromise = this.internalAuditor.audit(input.lead, input.verification);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout de auditoría excedido (${this.metadata.timeoutMs}ms)`)), this.metadata.timeoutMs)
      );

      const result = await Promise.race([auditPromise, timeoutPromise]);

      return {
        success: true,
        data: result,
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: "AUDIT_FAILED",
          message: err.message || "Fallo en auditoría de sitio web",
          fatal: false,
        },
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    }
  }
}
