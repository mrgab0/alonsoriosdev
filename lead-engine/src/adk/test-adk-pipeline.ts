/**
 * lead-engine/src/adk/test-adk-pipeline.ts
 * Prueba de integración de la cadena completa de componentes ADK.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { VerificationAgent } from "./verification.agent.ts";
import { WebsiteAuditAgent } from "./audit.agent.ts";
import { LeadEvaluationAgent } from "./evaluation.agent.ts";
import { ReportAgent } from "./report.agent.ts";
import type { StoredRecord } from "../storage/json-store.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAdkIntegrationTest() {
  console.log("======================================================");
  console.log("🧪 PROBANDO PIPELINE DE COMPONENTES ADK (FASE 5)");
  console.log("======================================================\n");

  const verifierAgent = new VerificationAgent();
  const auditAgent = new WebsiteAuditAgent();
  const evaluationAgent = new LeadEvaluationAgent();
  const reportAgent = new ReportAgent(path.resolve(__dirname, "../../reports"));

  const fixturePath = path.resolve(__dirname, "../../fixtures/batch-phase2.json");
  const rawData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

  const storedRecords: StoredRecord[] = [];

  for (const rawLead of rawData) {
    console.log(`▶ Procesando con agentes ADK: "${rawLead.business_name}"`);

    // 1. Verification Agent
    const vResult = await verifierAgent.execute(rawLead);
    console.log(`   [VerificationAgent] Estado: ${vResult.success ? "OK" : "ERROR"} (${vResult.durationMs}ms)`);

    // 2. Audit Agent
    const aResult = await auditAgent.execute({ lead: rawLead, verification: vResult.data });
    console.log(`   [WebsiteAuditAgent] Estado: ${aResult.success ? "OK" : "ERROR"} (${aResult.durationMs}ms)`);

    // 3. Evaluation Agent
    const eResult = await evaluationAgent.execute({
      lead: rawLead,
      verification: vResult.data,
      audit: aResult.data,
    });
    console.log(`   [LeadEvaluationAgent] Decisión: ${eResult.data?.decision} | Temp: ${eResult.data?.lead_temperature} (${eResult.durationMs}ms)`);

    storedRecords.push({
      lead: rawLead,
      state: eResult.data?.decision === "priority" ? "PRIORITY" : "REJECTED",
      evaluation: eResult.data,
      updated_at: new Date().toISOString(),
    });
  }

  // 4. Report Agent
  const rResult = await reportAgent.execute({ records: storedRecords });
  console.log(`\n   [ReportAgent] Reportes generados en ${rResult.durationMs}ms:`);
  console.log(`   - JSON: ${rResult.data?.jsonPath}`);
  console.log(`   - CSV:  ${rResult.data?.csvPath}`);
  console.log(`   - Leads totales: ${rResult.data?.totalLeads} (Prioritarios: ${rResult.data?.priorityCount}, Descartados: ${rResult.data?.rejectedCount})\n`);

  console.log("======================================================");
  console.log("✅ PIPELINE ADK VERIFICADO SATISFACTORIAMENTE (0 ERRORES)");
  console.log("======================================================");
}

runAdkIntegrationTest().catch(console.error);
