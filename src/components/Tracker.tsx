"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Evitar rastrear el panel de administración
    if (pathname?.startsWith("/admin")) return;

    const referrer = document.referrer || "direct";
    let formattedReferrer = "direct";

    if (referrer !== "direct") {
      try {
        const url = new URL(referrer);
        // Si el referrer es del mismo dominio, no queremos contarlo como una fuente de tráfico externa
        if (!url.hostname.includes(window.location.hostname)) {
          formattedReferrer = url.hostname;
        } else {
          return; // Es una navegación interna, no enviar hit
        }
      } catch (e) {
        formattedReferrer = referrer;
      }
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: formattedReferrer,
      }),
    }).catch(console.error);
    
    // Solo enviamos una vez por carga o cambio de ruta gracias al array de dependencias
  }, [pathname]);

  return null;
}
