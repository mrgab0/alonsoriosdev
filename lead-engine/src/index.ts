/**
 * lead-engine/src/index.ts
 * Orquestador principal de prospección determinista (Fases 1 y 2).
 * Ejecutable directamente con Node.js / TypeScript.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { NormalizedLead } from "./schemas/contracts.ts";
import { validateLead } from "./schemas/contracts.ts";
import { normalizeDomain, normalizePhone } from "./utils/normalize.ts";
import { Deduplicator } from "./utils/deduplicate.ts";
import { Verifier } from "./verification/verifier.ts";
import { WebsiteAuditor } from "./audit/auditor.ts";
import { RuleBasedEvaluator } from "./evaluation/rule-based.evaluator.ts";
import { JsonStore } from "./storage/json-store.ts";
import { Exporter } from "./reporting/exporter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LeadEngine {
  private deduplicator = new Deduplicator();
  private verifier = new Verifier();
  private auditor = new WebsiteAuditor();
  private evaluator = new RuleBasedEvaluator();
  private store: JsonStore;
  private exporter: Exporter;

  constructor(baseDir?: string) {
    this.store = new JsonStore(baseDir ? path.join(baseDir, "data") : undefined);
    this.exporter = new Exporter(baseDir ? path.join(baseDir, "reports") : undefined);

    // Sembrar deduplicador con los leads ya almacenados
    const existing = this.store.getAllLeads().map((r) => r.lead);
    this.deduplicator.seed(existing);
  }

  public async processBatch(rawLeads: any[]): Promise<void> {
    console.log(`\n======================================================`);
    console.log(`🚀 INICIANDO MOTOR DE PROSPECCIÓN (FASE 2: VERIFICACIÓN & AUDITORÍA)`);
    console.log(`📊 Total de prospectos a procesar: ${rawLeads.length}`);
    console.log(`======================================================\n`);

    let countPriority = 0;
    let countInteresting = 0;
    let countRejected = 0;
    let countDuplicates = 0;

    for (const raw of rawLeads) {
      // 1. Validación de contrato JSON
      const validation = validateLead(raw);
      if (!validation.success) {
        console.warn(`⚠️ [CONTRATO INVÁLIDO] Lead ignorado:`, validation.errors);
        continue;
      }

      const lead: NormalizedLead = validation.data!;
      console.log(`🔍 Procesando: "${lead.business_name}" (${lead.industry}/${lead.subindustry || "general"}) - ${lead.city}, ${lead.state}`);

      // 2. Normalización de campos
      lead.domain = normalizeDomain(lead.website_url || lead.domain);
      if (lead.public_contact?.phone) {
        lead.public_contact.phone = normalizePhone(lead.public_contact.phone);
      }

      // 3. Verificación de duplicados
      const dupCheck = this.deduplicator.findDuplicate(lead);
      if (dupCheck.isDuplicate) {
        console.log(`   🔁 [DUPLICADO DETECTADO] Coincide con lead: ${dupCheck.originalLeadId} (Clave: ${dupCheck.matchedKey})`);
        this.store.saveLead(lead, "DUPLICATE");
        this.store.recordEvent(lead.lead_id, "DUPLICATE_DETECTED", { matchedWith: dupCheck.originalLeadId });
        countDuplicates++;
        continue;
      }

      // Registrar en el índice de deduplicación
      this.deduplicator.register(lead);

      // 4. Verificación técnica (URL, HTTPS, reachable)
      const verification = await this.verifier.verify(lead);
      this.store.recordEvent(lead.lead_id, "VERIFICATION_COMPLETED", verification);

      // 5. Auditoría web no intrusiva (PageSpeed, CTAs, click-to-call)
      const audit = await this.auditor.audit(lead, verification);
      this.store.recordEvent(lead.lead_id, "AUDIT_COMPLETED", audit);

      // 6. Evaluación comercial determinista (5 dimensiones alimentadas con verificación y auditoría)
      const evaluation = this.evaluator.evaluate(lead, verification, audit);

      // 7. Asignación de estado y persistencia
      let finalState = "EVALUATED";
      if (evaluation.decision === "priority") {
        finalState = "PRIORITY";
        countPriority++;
        console.log(`   ⭐ [ALTA PRIORIDAD] Score: ${evaluation.score}/100 | Producto: ${evaluation.recommended_product} | Ángulo: "${evaluation.outreach_angle}"`);
      } else if (evaluation.decision === "interesting") {
        finalState = "INTERESTING";
        countInteresting++;
        console.log(`   💡 [INTERESANTE] Score: ${evaluation.score}/100 | Producto: ${evaluation.recommended_product}`);
      } else if (evaluation.decision === "research") {
        finalState = "RESEARCH";
        console.log(`   🔎 [INVESTIGACIÓN] Score: ${evaluation.score}/100 | Falta evidencia`);
      } else {
        finalState = "REJECTED";
        countRejected++;
        console.log(`   ❌ [DESCARTADO] Motivo: ${evaluation.reasons_to_reject.join(" | ")}`);
      }

      this.store.saveLead(lead, finalState, evaluation);
      this.store.recordEvent(lead.lead_id, "LEAD_EVALUATED", { score: evaluation.score, decision: evaluation.decision });
    }

    // 8. Generación de reportes finales
    const allRecords = this.store.getAllLeads();
    const reports = this.exporter.exportReports(allRecords);

    console.log(`\n======================================================`);
    console.log(`✅ LOTE COMPLETADO CON ÉXITO`);
    console.log(`   ⭐ Prioridad Alta (A): ${countPriority}`);
    console.log(`   💡 Interesantes (B):   ${countInteresting}`);
    console.log(`   🔁 Duplicados:         ${countDuplicates}`);
    console.log(`   ❌ Descartados (D):    ${countRejected}`);
    console.log(`📄 Reporte JSON: ${reports.jsonPath}`);
    console.log(`📊 Reporte CSV:  ${reports.csvPath}`);
    console.log(`======================================================\n`);
  }
}

// Ejecución directa
const inputArg = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(__dirname, "../fixtures/sample-leads.json");
if (fs.existsSync(inputArg)) {
  const sampleData = JSON.parse(fs.readFileSync(inputArg, "utf-8"));
  const engine = new LeadEngine(path.resolve(__dirname, ".."));
  await engine.processBatch(sampleData);
}
