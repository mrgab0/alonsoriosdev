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
        "Hola, soy Alonso Ríos. Ayudo a personas y negocios a crear sitios web profesionales ($760 USD), recuperar páginas caídas ($190 USD), desarrollar aplicaciones Android ($1,140 USD) y aprender programación.",
      avatarUrl: "",
      avatarInitials: "AR",
      profileName: "Alonso Ríos",
      profileRole: "Desarrollador Web, Android & Creador de Contenido",
      profileBio: "Resolver problemas técnicos complejos en lenguaje amigable y sin enredos.",
      primaryCtaText: "Ver Servicios y Precios",
      primaryCtaUrl: "#servicios",
      secondaryCtaText: "Hablar por WhatsApp",
      secondaryCtaUrl: "https://wa.me/584129912840?text=Hola%20Alonso",
    },
    services: {
      title: "Servicios Principales",
      subtitle: "Tarifa transparente de $19 USD / hora. Selecciona lo que necesitas:",
      items: [
        {
          icon: "Globe",
          badge: "Páginas Web",
          priceTag: "Desde $760 USD (40 hrs x $19/h)",
          title: "Creación y Diseño de Sitios Web",
          description: "Sitios profesionales, ultrarrápidos y fáciles de usar en cualquier teléfono o computador.",
          benefits: ["Adaptado a celulares", "Botón directo de WhatsApp", "Sin costos ocultos"],
        },
        {
          icon: "RefreshCw",
          badge: "Urgencias",
          priceTag: "Desde $190 USD (10 hrs x $19/h)",
          title: "Recuperación de Sitios Web",
          description: "Si tu página se cayó, fue infectada con virus o tiene errores de servidor, la recupero de inmediato.",
          benefits: ["Desinfección de malware", "Restauración de copias", "Protección anti-hackeo"],
        },
        {
          icon: "Smartphone",
          badge: "Android Apps",
          priceTag: "Desde $1,140 USD (60 hrs x $19/h)",
          title: "Aplicaciones Móviles Android",
          description: "Desarrollo de aplicaciones nativas para el sistema Android con publicación en Google Play Store.",
          benefits: ["Publicación en Play Store", "Uso fluido y fácil", "Soporte personalizado"],
        },
      ],
    },
    coursesAndBooks: {
      title: "Mis Libros y Cursos de Aprendizaje",
      subtitle: "Material educativo pensado para enseñar tecnología de forma amigable, paso a paso y sin tecnicismos innecesarios.",
    },
    contact: {
      title: "Contacto Directo",
      subtitle: "Respuestas en menos de 24 horas. Atención directa y en español claro por Alonso Ríos.",
      whatsappNumber: "+584129912840",
      email: "iirockalonso@gmail.com",
      location: "Chile • Proyectos para todo el mundo hispanohablante",
      telegramWebhookUrl: "",
      discordWebhookUrl: "",
      resendApiKey: "",
    },
  },
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      let config = await SiteConfig.findOne({ key: "main_config" });
      if (config) {
        // If config has old prices, update it in MongoDB
        if (config.sections?.hero?.subtitle?.includes("$190 USD") && !config.sections?.hero?.subtitle?.includes("$760 USD")) {
          config.sections.hero.subtitle = DEFAULT_CONFIG.sections.hero.subtitle;
          config.sections.services = DEFAULT_CONFIG.sections.services;
          await config.save();
        }
        return NextResponse.json({ success: true, data: config });
      }
    }
  } catch {
    // Database fallback
  }
  return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
}
