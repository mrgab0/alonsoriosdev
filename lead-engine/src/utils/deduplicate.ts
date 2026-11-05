/**
 * lead-engine/src/utils/deduplicate.ts
 * Deduplicación determinista e idempotente para evitar colisiones en prospección.
 */

import type { NormalizedLead } from "../schemas/contracts.ts";
import { generateDeduplicationKey, normalizeDomain, normalizePhone } from "./normalize.ts";

export interface DeduplicationIndex {
  keys: Map<string, string>; // DeduplicationKey -> lead_id
}

export class Deduplicator {
  private index: Map<string, string> = new Map();

  /**
   * Carga llaves existentes en el índice para comprobación
   */
  public seed(leads: NormalizedLead[]): void {
    for (const lead of leads) {
      this.register(lead);
    }
  }

  /**
   * Registra un prospecto en el índice
   */
  public register(lead: NormalizedLead): void {
    const key = generateDeduplicationKey(
      lead.domain || lead.website_url,
      lead.public_contact?.phone,
      lead.business_name,
      lead.city
    );
    this.index.set(key, lead.lead_id);

    // Registro secundario por teléfono si tiene dominio
    const phone = normalizePhone(lead.public_contact?.phone);
    if (phone) {
      this.index.set(`tel:${phone}`, lead.lead_id);
    }
  }

  /**
   * Verifica si un candidato ya existe
   */
  public findDuplicate(candidate: NormalizedLead): { isDuplicate: boolean; originalLeadId?: string; matchedKey?: string } {
    const primaryKey = generateDeduplicationKey(
      candidate.domain || candidate.website_url,
      candidate.public_contact?.phone,
      candidate.business_name,
      candidate.city
    );

    if (this.index.has(primaryKey)) {
      return {
        isDuplicate: true,
        originalLeadId: this.index.get(primaryKey),
        matchedKey: primaryKey,
      };
    }

    const phone = normalizePhone(candidate.public_contact?.phone);
    if (phone && this.index.has(`tel:${phone}`)) {
      return {
        isDuplicate: true,
        originalLeadId: this.index.get(`tel:${phone}`),
        matchedKey: `tel:${phone}`,
      };
    }

    return { isDuplicate: false };
  }
}
