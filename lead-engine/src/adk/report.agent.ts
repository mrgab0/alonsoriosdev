/**
 * lead-engine/src/adk/report.agent.ts
 * Componente ADK: Generación de reportes ejecutivos en CSV y JSON con telemetría de conversión.
 */

import type { StoredRecord } from "../storage/json-store.ts";
import { Exporter } from "../reporting/exporter.ts";
import type { BaseAgentComponent, ComponentMetadata, ComponentExecutionResult, ExecutionContext } from "./component.interface.ts";

export interface ReportAgentInput {
  records: StoredRecord[];
  customPath?: string;
}

export interface ReportSummary {
  jsonPath: string;
  csvPath: string;
  totalLeads: number;
  priorityCount: number;
  interestingCount: number;
  rejectedCount: number;
}

export class ReportAgent implements BaseAgentComponent<ReportAgentInput, ReportSummary> {
  readonly metadata: ComponentMetadata = {
    name: "ReportAgent",
    version: "1.0",
    responsibility: "Generar reportes listos para prospección humana y exportables.",
    timeoutMs: 5000,
  };

  private internalExporter: Exporter;

  constructor(baseDir?: string) {
    this.internalExporter = new Exporter(baseDir);
  }

  async execute(
    input: ReportAgentInput,
    context?: Partial<ExecutionContext>
  ): Promise<ComponentExecutionResult<ReportSummary>> {
    const t0 = Date.now();

    try {
      const paths = this.internalExporter.exportReports(input.records);

      let priorityCount = 0;
      let interestingCount = 0;
      let rejectedCount = 0;

      for (const r of input.records) {
        if (r.evaluation?.decision === "priority" || r.state === "PRIORITY") priorityCount++;
        else if (r.evaluation?.decision === "interesting" || r.state === "INTERESTING") interestingCount++;
        else rejectedCount++;
      }

      return {
        success: true,
        data: {
          jsonPath: paths.jsonPath,
          csvPath: paths.csvPath,
          totalLeads: input.records.length,
          priorityCount,
          interestingCount,
          rejectedCount,
        },
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: "REPORT_GENERATION_FAILED",
          message: err.message || "Error al generar reportes",
          fatal: true,
        },
        durationMs: Date.now() - t0,
        metadata: this.metadata,
      };
    }
  }
}
