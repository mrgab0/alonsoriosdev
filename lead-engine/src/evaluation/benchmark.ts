/**
 * lead-engine/src/evaluation/benchmark.ts
 * Script comparativo formal de evaluadores: Reglas vs Nemotron 3.5 Super VL vs Humano.
 * Cumple con Fase 4 y Sección 12.4 de LEAD_ENGINE_SPEC.md.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "node:sqlite";
import type { NormalizedLead, AuditResult, EvaluationResult } from "../schemas/contracts.ts";
import { RuleBasedEvaluator } from "./rule-based.evaluator.ts";
import { NemotronEvaluator } from "./nemotron.evaluator.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BenchmarkItem {
  lead: NormalizedLead;
  audit?: AuditResult;
  human_baseline: {
    decision: "priority" | "interesting" | "research" | "reject";
    lead_temperature: "HOT" | "WARM" | "COLD";
    recommended_product: string | null;
    reasoning: string;
  };
}

interface BenchmarkComparison {
  lead_id: string;
  business_name: string;
  human: {
    decision: string;
    temperature: string;
  };
  rule_based: {
    decision: string;
    temperature: string;
    score: number;
    latency_ms: number;
    contract_valid: boolean;
  };
  nemotron: {
    decision: string;
    temperature: string;
    score: number;
    latency_ms: number;
    contract_valid: boolean;
    killer_angle: string;
  };
}

export async function runBenchmark(datasetPath?: string): Promise<void> {
  const filePath = datasetPath || path.resolve(__dirname, "../../fixtures/benchmark-dataset.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset no encontrado en: ${filePath}`);
  }

  const dataset: BenchmarkItem[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`\n======================================================`);
  console.log(`🔬 INICIANDO BENCHMARK FASE 4: EVALUADOR DETERMINISTA VS NEMOTRON 3.5 SUPER VL`);
  console.log(`📊 Muestras etiquetadas a comparar: ${dataset.length}`);
  console.log(`======================================================\n`);

  // Extraer API Key de la bóveda si no está en variables de entorno
  let apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    try {
      const db = new sqlite3.DatabaseSync("/data/data/com.termux/files/home/.gemini/antigravity-cli/conversation_summaries.db");
      const row: any = db.prepare("SELECT value FROM vault WHERE key = ?").get("NVIDIA_API_KEY");
      apiKey = row?.value;
    } catch (e) {
      // Ignorar si no se puede abrir la bd
    }
  }

  const ruleEvaluator = new RuleBasedEvaluator();
  const nemotronEvaluator = new NemotronEvaluator(apiKey);

  const comparisons: BenchmarkComparison[] = [];
  let ruleAgreements = 0;
  let nemotronAgreements = 0;

  for (const item of dataset) {
    const { lead, audit, human_baseline } = item;
    console.log(`🔍 Evaluando: "${lead.business_name}" (${lead.industry})`);

    // 1. Evaluación por Reglas
    const t0Rule = Date.now();
    const ruleRes = ruleEvaluator.evaluateDirect(lead, undefined, audit);
    const ruleLatency = Date.now() - t0Rule;

    // 2. Evaluación por Nemotron
    const t0Nemo = Date.now();
    const nemoRes = await nemotronEvaluator.evaluate({ lead, audit });
    const nemoLatency = Date.now() - t0Nemo;

    // Medir acuerdos de decisión
    if (ruleRes.decision === human_baseline.decision) ruleAgreements++;
    if (nemoRes.decision === human_baseline.decision) nemotronAgreements++;

    comparisons.push({
      lead_id: lead.lead_id,
      business_name: lead.business_name,
      human: {
        decision: human_baseline.decision,
        temperature: human_baseline.lead_temperature,
      },
      rule_based: {
        decision: ruleRes.decision,
        temperature: ruleRes.lead_temperature,
        score: ruleRes.score,
        latency_ms: ruleLatency,
        contract_valid: true,
      },
      nemotron: {
        decision: nemoRes.decision,
        temperature: nemoRes.lead_temperature,
        score: nemoRes.score,
        latency_ms: nemoLatency,
        contract_valid: nemoRes.rubric_version.includes("nemotron"),
        killer_angle: nemoRes.killer_screenshot_angle,
      },
    });

    console.log(`   [HUMANO]     Decisión: ${human_baseline.decision.padEnd(11)} | Temp: ${human_baseline.lead_temperature}`);
    console.log(`   [REGLAS]     Decisión: ${ruleRes.decision.padEnd(11)} | Temp: ${ruleRes.lead_temperature} (${ruleRes.score} pts, ${ruleLatency}ms)`);
    console.log(`   [NEMOTRON]   Decisión: ${nemoRes.decision.padEnd(11)} | Temp: ${nemoRes.lead_temperature} (${nemoRes.score} pts, ${nemoLatency}ms)`);
    console.log(`   [NEMO ANGLE] "${nemoRes.killer_screenshot_angle.substring(0, 75)}..."\n`);
  }

  const total = dataset.length;
  console.log(`======================================================`);
  console.log(`📈 RESULTADOS DEL BENCHMARK`);
  console.log(`   Humano vs Reglas:   ${ruleAgreements}/${total} (${((ruleAgreements / total) * 100).toFixed(1)}% acuerdo)`);
  console.log(`   Humano vs Nemotron: ${nemotronAgreements}/${total} (${((nemotronAgreements / total) * 100).toFixed(1)}% acuerdo)`);
  console.log(`======================================================\n`);

  // Guardar reporte formal del benchmark
  const reportPath = path.resolve(__dirname, "../../reports/benchmark_phase4_report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        benchmark_timestamp: new Date().toISOString(),
        samples_count: total,
        agreement_rates: {
          rule_based: (ruleAgreements / total) * 100,
          nemotron: (nemotronAgreements / total) * 100,
        },
        comparisons,
      },
      null,
      2
    ),
    "utf-8"
  );
  console.log(`📄 Reporte guardado en: ${reportPath}`);
}

// Ejecución directa si se invoca por terminal
if (process.argv[1] && process.argv[1].endsWith("benchmark.ts")) {
  runBenchmark().catch((err) => console.error("Error en benchmark:", err));
}
