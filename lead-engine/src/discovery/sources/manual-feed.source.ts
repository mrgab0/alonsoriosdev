/**
 * lead-engine/src/discovery/sources/manual-feed.source.ts
 * Adaptador de descubrimiento para importación estructurada de leads manuales / CSV / JSON.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { NormalizedLead } from "../../schemas/contracts.ts";
import { validateLead } from "../../schemas/contracts.ts";
import type { DiscoverySource, DiscoveryQuery } from "../discovery.interface.ts";

export class ManualFeedSource implements DiscoverySource {
  id = "manual-feed";
  name = "Manual & Directory JSON Feed";
  private feedPath: string;

  constructor(feedPath?: string) {
    this.feedPath = feedPath || "";
  }

  public setFeedPath(filePath: string): void {
    this.feedPath = filePath;
  }

  async discover(query: DiscoveryQuery): Promise<NormalizedLead[]> {
    if (!this.feedPath || !fs.existsSync(this.feedPath)) {
      return [];
    }

    try {
      const rawContent = fs.readFileSync(this.feedPath, "utf-8");
      const rawItems = JSON.parse(rawContent);

      if (!Array.isArray(rawItems)) {
        throw new Error("El archivo de feed debe contener un array de prospectos.");
      }

      const validLeads: NormalizedLead[] = [];

      for (const item of rawItems) {
        const val = validateLead(item);
        if (val.success && val.data) {
          const lead = val.data;

          // Filtrar por consulta si se especifica ciudad o nicho
          const matchesNiche = !query.niche || lead.industry === query.niche;
          const matchesCity = !query.city || lead.city.toLowerCase() === query.city.toLowerCase();

          if (matchesNiche && matchesCity) {
            validLeads.push(lead);
          }
        }
      }

      const limit = query.limit || 50;
      return validLeads.slice(0, limit);
    } catch (err: any) {
      console.warn(`[MANUAL_FEED ERROR]: ${err.message}`);
      return [];
    }
  }
}
