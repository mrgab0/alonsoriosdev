/**
 * lead-engine/src/discovery/discovery.service.ts
 * Servicio orquestador de descubrimiento de prospectos.
 */

import type { NormalizedLead } from "../schemas/contracts.ts";
import type { DiscoverySource, DiscoveryQuery } from "./discovery.interface.ts";
import { ManualFeedSource } from "./sources/manual-feed.source.ts";
import { WebSearchSource } from "./sources/web-search.source.ts";
import { OpenDataSource } from "./sources/open-data.source.ts";

export class DiscoveryService {
  private sources: Map<string, DiscoverySource> = new Map();

  constructor() {
    this.registerSource(new ManualFeedSource());
    this.registerSource(new WebSearchSource());
    this.registerSource(new OpenDataSource());
  }

  public registerSource(source: DiscoverySource): void {
    this.sources.set(source.id, source);
  }

  public getSource(id: string): DiscoverySource | undefined {
    return this.sources.get(id);
  }

  public async discover(sourceId: string, query: DiscoveryQuery): Promise<NormalizedLead[]> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Fuente de descubrimiento no registrada: ${sourceId}`);
    }

    console.log(`📡 [DISCOVERY] Ejecutando búsqueda vía fuente "${source.name}" para: ${query.niche}/${query.subindustry} en ${query.city}, ${query.state}`);
    const results = await source.discover(query);
    console.log(`🎯 [DISCOVERY] ${results.length} prospectos candidatos encontrados.`);
    return results;
  }
}
