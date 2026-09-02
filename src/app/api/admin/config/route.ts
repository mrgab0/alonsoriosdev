import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";

const DEFAULT_CONFIG = {
  key: "main_config",
  theme: {
    backgroundColor: "#0a1120",
    textColor: "#ffffff",
    cardBackgroundColor: "#121b2d",
    cardBorderColor: "#1e2a42",
    buttonColor: "#fbbf24",
    buttonTextColor: "#0a1120",
    buttonBorderRadius: "rounded-xl",
    accentColor: "#fbbf24",
    fontSizeScale: "normal",
  },
  sections: {
    hero: {
      statusBadge: "Disponible para Sitios Web, Apps Android y Cursos",
      title: "Páginas Web, Apps Android y SEO",
      titleHighlight: "sin complicaciones",
      subtitle:
        "Hola, soy Alonso Ríos. Ayudo a personas y negocios a crear sitios web profesionales, recuperar páginas caídas y aprender programación de forma sencilla.",
      primaryCtaText: "Ver Servicios y Precios",
      primaryCtaUrl: "#servicios",
      secondaryCtaText: "Hablar por WhatsApp",
      secondaryCtaUrl: "https://wa.me/584129912840?text=Hola%20Alonso",
    },
    services: {
      title: "Servicios Principales",
      subtitle: "Soluciones transparentes y eficientes para tu negocio.",
      items: [
        {
          icon: "Globe",
          badge: "Páginas Web",
          title: "Creación y Diseño de Sitios Web",
          description: "Sitios profesionales, ultrarrápidos y adaptados a cualquier dispositivo.",
          benefits: ["Adaptado a celulares", "Botón directo de WhatsApp", "Sin costos ocultos"],
        },
        {
          icon: "RefreshCw",
          badge: "Urgencias",
          title: "Recuperación de Sitios Web",
          description: "Si tu página se cayó, fue infectada o tiene errores, la recupero de inmediato.",
          benefits: ["Desinfección de malware", "Restauración de copias", "Protección anti-hackeo"],
        },
        {
          icon: "Smartphone",
          badge: "Android Apps",
          title: "Aplicaciones Móviles Android",
          description: "Desarrollo de aplicaciones nativas con publicación en Google Play Store.",
          benefits: ["Publicación en Play Store", "Uso fluido y fácil", "Soporte personalizado"],
        },
      ],
    },
    coursesAndBooks: {
      title: "Mis Libros y Cursos de Aprendizaje",
      subtitle: "Material educativo pensado para enseñar tecnología de forma amigable.",
    },
    contact: {
      title: "Contacto Directo",
      subtitle: "Respuestas en menos de 24 horas. Atención directa por Alonso Ríos.",
      whatsappNumber: "+584129912840",
      email: "contacto@alonsorios.dev",
      location: "Chile • Proyectos para todo el mundo hispanohablante",
      telegramWebhookUrl: "",
      discordWebhookUrl: "",
      resendApiKey: "",
    },
  },
};

export async function GET() {
  try {
    await connectToDatabase();
    let config = await SiteConfig.findOne({ key: "main_config" });
    if (!config) {
      config = await SiteConfig.create(DEFAULT_CONFIG);
    }
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.warn("MongoDB offline, returning fallback config:", error);
    return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    try {
      await connectToDatabase();
      const updated = await SiteConfig.findOneAndUpdate(
        { key: "main_config" },
        { ...body, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return NextResponse.json({ success: true, message: "Configuración guardada correctamente.", data: updated });
    } catch {
      return NextResponse.json({ success: true, message: "Guardado en modo vista previa (sin DB activa)." });
    }
  } catch (error) {
    console.error("Config API Error:", error);
    return NextResponse.json({ error: "Error al guardar configuración." }, { status: 500 });
  }
}
