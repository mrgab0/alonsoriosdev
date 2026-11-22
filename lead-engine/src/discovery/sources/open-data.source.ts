/**
 * lead-engine/src/discovery/sources/open-data.source.ts
 * Adaptador de descubrimiento para registros y permisos públicos oficiales (Socrata Open Data).
 * Cumple con Sección 7.2 ("Sitios oficiales y registros públicos con términos adecuados").
 */

import type { NormalizedLead } from "../../schemas/contracts.ts";
import type { DiscoverySource, DiscoveryQuery } from "../discovery.interface.ts";

export class OpenDataSource implements DiscoverySource {
  id = "open-data";
  name = "Official City Open Data & Permits Registry (Socrata)";

  async discover(query: DiscoveryQuery): Promise<NormalizedLead[]> {
    const leads: NormalizedLead[] = [];
    const limit = query.limit || 5;

    // Solo consultamos si la ciudad es Austin (o ciudades soportadas con portales abiertos)
    if (query.city.toLowerCase() !== "austin") {
      return [];
    }

    try {
      // Filtrar permisos con contratistas comerciales activos y teléfono registrado
      let tradeFilter = "";
      if (query.subindustry === "electrical") {
        tradeFilter = "contractor_trade LIKE '%Electrical%'";
      } else if (query.subindustry === "plumbing") {
        tradeFilter = "contractor_trade LIKE '%Plumbing%'";
      } else if (query.subindustry === "hvac" || query.subindustry === "roofing") {
        tradeFilter = "contractor_trade LIKE '%Mechanical%' OR contractor_trade LIKE '%Roofing%'";
      } else {
        tradeFilter = "contractor_trade IS NOT NULL";
      }

      const whereClause = encodeURIComponent(
        `contractor_company_name IS NOT NULL AND contractor_phone IS NOT NULL AND ${tradeFilter}`
      );
      const url = `https://data.austintexas.gov/resource/3syk-w9eu.json?$limit=${limit}&$where=${whereClause}&$order=issue_date DESC`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "AlonsoRiosLeadEngine/1.0 (contact@alonsorios.dev)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const records = await response.json();
      const seenNames = new Set<string>();

      for (const row of records) {
        const name = (row.contractor_company_name || "").trim();
        if (!name || seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());

        const rawPhone = row.contractor_phone ? String(row.contractor_phone).trim() : null;
        const city = row.contractor_city ? row.contractor_city.trim() : query.city;
        const state = row.contractor_state ? row.contractor_state.trim() : query.state;
        const trade = row.contractor_trade || query.subindustry;

        const leadId = `gov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        leads.push({
          lead_id: leadId,
          business_name: name,
          industry: query.niche,
          subindustry: query.subindustry || trade,
          country: "US",
          state: state.toUpperCase(),
          city,
          website_url: null, // Verificaremos si tienen web o requieren landing de captación
          domain: null,
          public_contact: {
            phone: rawPhone,
            email: null,
            contact_page: null,
            instagram: null,
          },
          business_status: "operational",
          sources: [
            {
              url: row.link?.url || `https://data.austintexas.gov/resource/3syk-w9eu/${row.permit_number || ""}`,
              type: "official_permit_registry",
              retrieved_at: new Date().toISOString(),
            },
          ],
          discovered_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn(`[OPEN_DATA DISCOVERY ERROR]: ${err.message}`);
    }

    return leads;
  }
}
