/**
 * lead-engine/src/discovery/sources/web-search.source.ts
 * Adaptador de descubrimiento basado en búsqueda web y APIs de directorios públicos.
 */

import type { NormalizedLead } from "../../schemas/contracts.ts";
import type { DiscoverySource, DiscoveryQuery } from "../discovery.interface.ts";

export class WebSearchSource implements DiscoverySource {
  id = "web-search";
  name = "Public Directory & Web Search Adapter";

  async discover(query: DiscoveryQuery): Promise<NormalizedLead[]> {
    const leads: NormalizedLead[] = [];
    const limit = query.limit || 5;

    // Consulta formateada
    const searchTerm = `${query.subindustry || query.niche} ${query.city} ${query.state}`;
    const encodedQuery = encodeURIComponent(searchTerm);

    try {
      // Usar servicio público de búsqueda geográfica Nominatim / OpenStreetMap
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=${limit}`;
      const response = await fetch(osmUrl, {
        headers: {
          "User-Agent": "AlonsoRiosLeadEngine/1.0 (contact@alonsorios.dev)",
        },
      });

      if (response.ok) {
        const results = await response.json();
        for (const res of results) {
          const name = res.name || res.display_name.split(",")[0].trim();
          const city = res.address?.city || res.address?.town || query.city;
          const state = res.address?.state || query.state;
          const country = res.address?.country_code ? res.address.country_code.toUpperCase() : query.country;

          const leadId = `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          leads.push({
            lead_id: leadId,
            business_name: name,
            industry: query.niche,
            subindustry: query.subindustry || query.niche,
            country,
            state,
            city,
            website_url: null, // Descubierto sin web previa (candidato potencial)
            domain: null,
            public_contact: {
              phone: null,
              email: null,
              contact_page: null,
              instagram: null,
            },
            business_status: "operational",
            sources: [
              {
                url: `https://www.openstreetmap.org/${res.osm_type}/${res.osm_id}`,
                type: "osm_directory",
                retrieved_at: new Date().toISOString(),
              },
            ],
            discovered_at: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      console.warn(`[WEB_SEARCH DISCOVERY]: No se pudo completar consulta automática: ${err.message}`);
    }

    return leads;
  }
}
