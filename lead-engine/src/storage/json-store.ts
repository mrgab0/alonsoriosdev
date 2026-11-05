/**
 * lead-engine/src/storage/json-store.ts
 * Persistencia local transaccional e idempotente en JSON (0 dependencias externas, ideal para Termux).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { NormalizedLead, EvaluationResult } from "../schemas/contracts.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StoredRecord {
  lead: NormalizedLead;
  state: string;
  evaluation?: EvaluationResult;
  updatedAt: string;
}

export interface StoredEvent {
  eventId: string;
  leadId: string;
  eventType: string;
  payload: any;
  timestamp: string;
}

export class JsonStore {
  private dataDir: string;
  private leadsFile: string;
  private eventsFile: string;

  constructor(baseDir?: string) {
    this.dataDir = baseDir || path.resolve(__dirname, "../../data");
    this.leadsFile = path.join(this.dataDir, "leads.json");
    this.eventsFile = path.join(this.dataDir, "events.json");
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.leadsFile)) {
      fs.writeFileSync(this.leadsFile, JSON.stringify([], null, 2), "utf-8");
    }
    if (!fs.existsSync(this.eventsFile)) {
      fs.writeFileSync(this.eventsFile, JSON.stringify([], null, 2), "utf-8");
    }
  }

  public getAllLeads(): StoredRecord[] {
    try {
      const data = fs.readFileSync(this.leadsFile, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveLead(lead: NormalizedLead, state: string, evaluation?: EvaluationResult): void {
    const records = this.getAllLeads();
    const existingIndex = records.findIndex((r) => r.lead.lead_id === lead.lead_id);

    const record: StoredRecord = {
      lead,
      state,
      evaluation,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    fs.writeFileSync(this.leadsFile, JSON.stringify(records, null, 2), "utf-8");
  }

  public recordEvent(leadId: string, eventType: string, payload: any): void {
    try {
      const data = fs.readFileSync(this.eventsFile, "utf-8");
      const events: StoredEvent[] = JSON.parse(data);

      events.push({
        eventId: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        leadId,
        eventType,
        payload,
        timestamp: new Date().toISOString(),
      });

      fs.writeFileSync(this.eventsFile, JSON.stringify(events, null, 2), "utf-8");
    } catch (err) {
      console.error("Error al registrar evento:", err);
    }
  }
}
