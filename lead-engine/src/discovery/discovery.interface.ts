/**
 * lead-engine/src/discovery/discovery.interface.ts
 * Interfaz y contratos para adaptadores de descubrimiento de prospectos.
 */

import type { NormalizedLead } from "../schemas/contracts.ts";

export interface DiscoveryQuery {
  niche: string;
  subindustry: string;
  city: string;
  state: string;
  country: string;
  limit?: number;
}

export interface DiscoverySource {
  id: string;
  name: string;
  discover(query: DiscoveryQuery): Promise<NormalizedLead[]>;
}
