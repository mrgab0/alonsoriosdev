import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

interface GithubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  payload?: {
    commits?: Array<{
      sha: string;
      message: string;
    }>;
    ref?: string;
  };
  created_at: string;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  homepage: string | null;
}

export async function GET() {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "AlonsoRiosDev-Portfolio",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch Events and Repos concurrently
    const [eventsRes, reposRes] = await Promise.allSettled([
      fetch("https://api.github.com/users/mrgab0/events?per_page=10", {
        headers,
        next: { revalidate: 60 },
      }),
      fetch("https://api.github.com/users/mrgab0/repos?sort=pushed&direction=desc&per_page=8", {
        headers,
        next: { revalidate: 60 },
      }),
    ]);

    let rawEvents: GithubEvent[] = [];
    if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
      rawEvents = await eventsRes.value.json();
    }

    let rawRepos: GithubRepo[] = [];
    if (reposRes.status === "fulfilled" && reposRes.value.ok) {
      rawRepos = await reposRes.value.json();
    }

    // Parse latest push activity
    const pushEvents = rawEvents.filter((e) => e.type === "PushEvent");
    const latestPush = pushEvents[0] || null;

    let latestActivity = {
      repoName: "alonsoriosdev",
      cleanRepoName: "alonsorios.dev",
      message: "Suite de Códigos QR, Pago Móvil Suiche 7B & Rediseño Obsidian Cinema",
      timestamp: new Date().toISOString(),
      url: "https://github.com/mrgab0/alonsoriosdev",
      branch: "main",
    };

    if (latestPush) {
      const commit = latestPush.payload?.commits?.[latestPush.payload.commits.length - 1];
      const repoClean = latestPush.repo.name.replace("mrgab0/", "");
      latestActivity = {
        repoName: latestPush.repo.name,
        cleanRepoName: repoClean,
        message: commit?.message?.split("\n")[0] || "Actualización de código y nuevas características",
        timestamp: latestPush.created_at,
        url: `https://github.com/${latestPush.repo.name}`,
        branch: latestPush.payload?.ref?.replace("refs/heads/", "") || "main",
      };
    }

    // Clean active repos list
    const activeRepos = rawRepos.map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description || "Proyecto de desarrollo e ingeniería de software.",
      language: r.language || "TypeScript",
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
      homepage: r.homepage,
    }));

    // Curated Roadmap items
    const roadmap = [
      {
        id: "rm-1",
        title: "Suite de Herramientas QR & Pago Móvil Suiche 7B",
        description: "Generador de QR Estáticos, QR Dinámicos redirigibles con token y plantillas de acrílico para comercios en Venezuela.",
        category: "Web Utilities",
        status: "completed",
        progress: 100,
        shippedDate: "Octubre 2026",
      },
      {
        id: "rm-2",
        title: "Rediseño Obsidian Cinema & Tipografía Editorial",
        description: "Modernización de la Home, Blog y editor con diseño Stitch de alto contraste, cero fuentes grises y Google Fonts Newsreader.",
        category: "Design System",
        status: "completed",
        progress: 100,
        shippedDate: "Octubre 2026",
      },
      {
        id: "rm-3",
        title: "GitHub Live Mirror & Engineering Walkthrough",
        description: "Transparencia radical: bitácora en vivo de repositorios, commits de hoy y roadmap público sincronizado con la API de GitHub.",
        category: "DevOps & Portfolio",
        status: "completed",
        progress: 100,
        shippedDate: "Octubre 2026",
      },
      {
        id: "rm-4",
        title: "Herramienta de Fusión de PDFs en el Navegador",
        description: "Unión y reordenamiento de documentos PDF directamente en el cliente (WASM/PDF-Lib) sin subir datos a servidores ajenos.",
        category: "Client-Side Tools",
        status: "in_progress",
        progress: 65,
        eta: "Q4 2026",
      },
      {
        id: "rm-5",
        title: "Servidor & Cliente Android Remote Keyboard Pro",
        description: "Control remoto de pulsaciones vía WiFi con latencia sub-milisegundo y cifrado local para periféricos en Android.",
        category: "Android & Native",
        status: "in_progress",
        progress: 80,
        eta: "Q4 2026",
      },
      {
        id: "rm-6",
        title: "Plataforma Educativa con Reproductor Propio",
        description: "Área privada de alumnos para los cursos de Android y Páginas Web con seguimiento de lecciones y descarga de certificados.",
        category: "EdTech",
        status: "planned",
        progress: 25,
        eta: "Q1 2027",
      },
    ];

    // Detailed engineering walkthrough entries (Devlog)
    const walkthrough = [
      {
        date: "Hoy",
        title: "Balance Tipográfico, Cero Fuentes Grises & GitHub Activity Mirror",
        badge: "v2.6",
        highlights: [
          "Eliminación de tipografía gris opaca en favor de blanco puro bold y acentos solares",
          "Titular armónico proporcional en Hero para 'Páginas Web, Apps Android y SEO Profesionales'",
          "Integración de foto de perfil y monitor de actividad de repositorios en tiempo real",
          "Franja modesta en el footer con el status en vivo del trabajo del día",
        ],
      },
      {
        date: "Octubre 2026",
        title: "Lanzamiento de Creador QR de Pago Móvil para Venezuela",
        badge: "v2.5",
        highlights: [
          "Estandarización bajo especificación Suiche 7B para los 22 bancos nacionales",
          "Maquetador de cartel vertical en acrílico de alta resolución (300 DPI, 1200x1800 px)",
          "Soporte de subida de logotipo comercial y enlace de pedidos directos por WhatsApp",
          "Sistema de rescate de token de edición por correo con Resend",
        ],
      },
      {
        date: "Octubre 2026",
        title: "Suite de Códigos QR Públicos y Dinámicos",
        badge: "v2.4",
        highlights: [
          "Generador de QR Estáticos multi-formato (URL, texto, WhatsApp, WiFi)",
          "Servicio de QR Dinámico editable sin reimpresión mediante token de seguridad",
          "Dropdown interactivo de herramientas en el Navbar y Drawer móvil",
        ],
      },
      {
        date: "Octubre 2026",
        title: "Rediseño Integral Obsidian Cinema con Stitch",
        badge: "v2.3",
        highlights: [
          "Carga de Google Fonts Newsreader e Inter sin librerías pesadas",
          "Modernización de /blog con tarjeta Hero, filtros por categoría y telemetría Core Web Vitals",
          "Vista de artículo individual con barra sticky de lectura y soporte para shortcodes técnicos",
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      latestActivity,
      activeRepos: activeRepos.slice(0, 6),
      roadmap,
      walkthrough,
    });
  } catch (error) {
    console.error("Error fetching developer activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo sincronizar la actividad de GitHub",
        latestActivity: {
          repoName: "alonsoriosdev",
          cleanRepoName: "alonsorios.dev",
          message: "Suite de Herramientas QR & Rediseño Obsidian Cinema",
          timestamp: new Date().toISOString(),
          url: "https://github.com/mrgab0/alonsoriosdev",
          branch: "main",
        },
        activeRepos: [],
        roadmap: [],
        walkthrough: [],
      },
      { status: 200 }
    );
  }
}
