/**
 * lead-engine/src/reporting/exporter.ts
 * Generación de reportes ejecutivos en JSON y CSV listos para revisión humana (Sección 2.1 y 18 de LEAD_ENGINE_SPEC.md).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { StoredRecord } from "../storage/json-store.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Exporter {
  private reportsDir: string;

  constructor(baseDir?: string) {
    this.reportsDir = baseDir || path.resolve(__dirname, "../../reports");
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  public exportReports(records: StoredRecord[]): { jsonPath: string; csvPath: string } {
    const timestamp = new Date().toISOString().split("T")[0];
    const jsonPath = path.join(this.reportsDir, `leads_report_${timestamp}.json`);
    const csvPath = path.join(this.reportsDir, `leads_priority_${timestamp}.csv`);

    // 1. Export JSON detallado
    fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2), "utf-8");

    // 2. Export CSV para revisión rápida
    const headers = [
      "Decision",
      "Score",
      "Business Name",
      "Industry",
      "Subindustry",
      "City",
      "State",
      "Phone",
      "Website",
      "Recommended Product",
      "Complexity",
      "Outreach Angle",
      "Reasons To Reject",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return "";
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = records.map((r) => {
      const e = r.evaluation;
      const l = r.lead;
      return [
        escapeCsv(e?.decision || r.state),
        escapeCsv(e?.score ?? ""),
        escapeCsv(l.business_name),
        escapeCsv(l.industry),
        escapeCsv(l.subindustry),
        escapeCsv(l.city),
        escapeCsv(l.state),
        escapeCsv(l.public_contact?.phone || ""),
        escapeCsv(l.website_url || "SIN_WEB"),
        escapeCsv(e?.recommended_product || "ninguno"),
        escapeCsv(e?.estimated_complexity || "unknown"),
        escapeCsv(e?.outreach_angle || ""),
        escapeCsv(e?.reasons_to_reject?.join("; ") || ""),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    fs.writeFileSync(csvPath, csvContent, "utf-8");

    return { jsonPath, csvPath };
  }
}
