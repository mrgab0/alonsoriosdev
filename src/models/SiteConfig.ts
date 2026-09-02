import mongoose, { Schema, Document, models } from "mongoose";

export interface ISiteConfig extends Document {
  key: string;
  theme: {
    backgroundColor: string;
    textColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    buttonColor: string;
    buttonTextColor: string;
    buttonBorderRadius: "none" | "rounded" | "rounded-xl" | "rounded-full";
    accentColor: string;
    fontSizeScale: "normal" | "large" | "xlarge";
  };
  sections: {
    hero: {
      statusBadge: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      primaryCtaText: string;
      primaryCtaUrl: string;
      secondaryCtaText: string;
      secondaryCtaUrl: string;
    };
    services: {
      title: string;
      subtitle: string;
      items: Array<{
        icon: string;
        badge: string;
        title: string;
        description: string;
        benefits: string[];
      }>;
    };
    coursesAndBooks: {
      title: string;
      subtitle: string;
    };
    contact: {
      title: string;
      subtitle: string;
      whatsappNumber: string;
      email: string;
      location: string;
      telegramWebhookUrl?: string;
      discordWebhookUrl?: string;
      resendApiKey?: string;
    };
  };
  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: "main_config" },
  theme: {
    backgroundColor: { type: String, default: "#0a1120" },
    textColor: { type: String, default: "#ffffff" },
    cardBackgroundColor: { type: String, default: "#121b2d" },
    cardBorderColor: { type: String, default: "#1e2a42" },
    buttonColor: { type: String, default: "#fbbf24" },
    buttonTextColor: { type: String, default: "#0a1120" },
    buttonBorderRadius: { type: String, default: "rounded-xl" },
    accentColor: { type: String, default: "#fbbf24" },
    fontSizeScale: { type: String, default: "normal" },
  },
  sections: {
    hero: {
      statusBadge: { type: String, default: "Disponible para Sitios Web, Apps Android y Cursos" },
      title: { type: String, default: "Páginas Web, Apps Android y SEO" },
      titleHighlight: { type: String, default: "sin complicaciones" },
      subtitle: {
        type: String,
        default:
          "Hola, soy Alonso Ríos. Ayudo a personas y negocios a crear sitios web profesionales, recuperar páginas caídas y aprender programación.",
      },
      primaryCtaText: { type: String, default: "Ver Servicios y Precios" },
      primaryCtaUrl: { type: String, default: "#servicios" },
      secondaryCtaText: { type: String, default: "Hablar por WhatsApp" },
      secondaryCtaUrl: { type: String, default: "https://wa.me/" },
    },
    services: {
      title: { type: String, default: "Servicios Principales" },
      subtitle: { type: String, default: "Soluciones transparentes y eficientes para tu negocio." },
      items: [
        {
          icon: { type: String, default: "Globe" },
          badge: { type: String, default: "Páginas Web" },
          title: { type: String, default: "Creación y Diseño de Sitios Web" },
          description: { type: String, default: "Sitios profesionales, ultrarrápidos y adaptados a cualquier dispositivo." },
          benefits: [{ type: String }],
        },
      ],
    },
    coursesAndBooks: {
      title: { type: String, default: "Mis Libros y Cursos de Aprendizaje" },
      subtitle: { type: String, default: "Material educativo en lenguaje sencillo y paso a paso." },
    },
    contact: {
      title: { type: String, default: "Contacto Directo" },
      subtitle: { type: String, default: "Respuestas en menos de 24 horas." },
      whatsappNumber: { type: String, default: "+56900000000" },
      email: { type: String, default: "contacto@alonsorios.dev" },
      location: { type: String, default: "Chile • Proyectos Internacionales" },
      telegramWebhookUrl: { type: String, default: "" },
      discordWebhookUrl: { type: String, default: "" },
      resendApiKey: { type: String, default: "" },
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
