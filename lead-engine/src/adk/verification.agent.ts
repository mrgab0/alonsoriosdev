/**
 * lead-engine/src/adk/verification.agent.ts
 * Componente ADK: Encapsula la verificación técnica de dominio, conectividad y consistencia de datos.
 */

import type { NormalizedLead, VerificationResult } from "../schemas/contracts.ts";
import { Verifier } from "../verification/verifier.ts";
import type { BaseAgentComponent, ComponentMetadata, ComponentExecutionResult, ExecutionContext } from "./component.interface.ts";

export class VerificationAgent implements BaseAgentComponent<NormalizedLead, VerificationResult> {
  readonly metadata: ComponentMetadata = {
    name: "VerificationAgent",
    version: "1.0",
    responsibility: "Comprobar alcance HTTP/HTTPS, DNS y coincidencia de identidad técnica.",
    timeoutMs: 8000,
  };

  private internalVerifier = new Verifier();

  async execute(
    lead: NormalizedLead,
    context?: Partial<ExecutionContext>
  ): Promise<ComponentExecutionResult<VerificationResult>> {
    const t0 = Date.now();

    try {
      // Wrapper con timeout estricto
      const verificationPromise = this.internalVerifier.verify(lead);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout de verificación excedido (${this.metadata.timeoutMs}ms)`)), this.metadata.timeoutMs)
      );

      const result = await Promise.race([verificationPromise, timeoutPromise]);

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
          code: "VERIFICATION_FAILED",
          message: err.message || "Fallo en verificación técnica",
          fatal: false,
        },
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    }
  }
}
