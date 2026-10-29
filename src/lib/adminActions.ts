import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";
import BlogPost from "@/models/BlogPost";
import { cleanLockedContentForExternal } from "@/lib/crosspost";

const CURATED_TECH_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    alt: "Código limpio y optimización de arquitectura en entorno de desarrollo moderno",
  },
  {
    url: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1200&auto=format&fit=crop&q=80",
    alt: "Desarrollo de aplicaciones móviles Android nativas de alto rendimiento",
  },
  {
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    alt: "Infraestructura de servidores en la nube y despliegue continuo",
  },
  {
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    alt: "Ciberseguridad web, desinfección de malware y protección de bases de datos",
  },
  {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    alt: "Auditoría de rendimiento Core Web Vitals y métricas de velocidad",
  },
  {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
    alt: "Estación de trabajo de ingeniería de software y desarrollo fullstack",
  },
];

function sanitizeKebabCase(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const CASCADE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

async function callGeminiAi(prompt: string, maxTokens = 1200): Promise<string | null> {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  )?.trim();
  if (!apiKey) return null;

  for (const model of CASCADE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.7,
            },
          }),
          signal: AbortSignal.timeout(6000),
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) return text.trim();
    } catch {}
  }
  return null;
}

export interface ActionResult {
  success: boolean;
  message: string;
  refreshConfigNeeded?: boolean;
  data?: any;
}

export async function executeAdminAction(actionType: string, payload: any): Promise<ActionResult> {
  await connectToDatabase();

  switch (actionType) {
    case "CREATE_BLOG_POST": {
      const { topic, keywords = "", publishNow = false, category = "Desarrollo Web & Arquitectura" } = payload;
      if (!topic) return { success: false, message: "Falta el tema del artículo para generar el post." };

      const randomImage = CURATED_TECH_IMAGES[Math.floor(Math.random() * CURATED_TECH_IMAGES.length)];

      const prompt = `Eres Alonso Ríos, ingeniero de software senior y creador de alonsorios.dev.
Escribe un artículo técnico en español claro, persuasivo, con arquitectura moderna y ejemplos de código reales.
Tema: "${topic}". Palabras clave sugeridas: "${keywords}". Categoría: "${category}".

Devuelve OBLIGATORIAMENTE un objeto JSON válido con la siguiente estructura (sin rodeos, solo el bloque JSON):
{
  "title": "Título técnico llamativo y profesional",
  "slug": "slug-en-kebab-case",
  "excerpt": "Extracto conciso de 2 líneas para SEO y tarjetas",
  "category": "${category}",
  "readingTime": "5 min de lectura",
  "content": "Contenido completo en Markdown. Debe incluir subtítulos H2 (##), párrafos bien estructurados, bloques de código con lenguaje especificado (ej: \`\`\`typescript), buenas prácticas y consejos arquitectónicos.",
  "telemetry": {
    "beforeTime": "3.2s",
    "afterTime": "0.8s",
    "score": "98/100",
    "label": "Rendimiento LCP"
  }
}`;

      const aiResponse = await callGeminiAi(prompt, 1800);
      let postData: any = null;

      if (aiResponse) {
        try {
          const cleaned = aiResponse.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
          postData = JSON.parse(cleaned);
        } catch {
          const titleMatch = aiResponse.match(/"title"\s*:\s*"([^"]+)"/);
          postData = {
            title: titleMatch ? titleMatch[1] : topic,
            slug: sanitizeKebabCase(topic),
            excerpt: `Artículo técnico sobre ${topic} por Alonso Ríos.`,
            category,
            readingTime: "5 min de lectura",
            content: aiResponse,
            telemetry: { beforeTime: "2.8s", afterTime: "0.9s", score: "99/100", label: "Optimización" },
          };
        }
      } else {
        // Resilient fallback draft
        postData = {
          title: topic,
          slug: sanitizeKebabCase(topic) + "-" + Date.now().toString().slice(-4),
          excerpt: `Análisis y arquitectura sobre ${topic}.`,
          category,
          readingTime: "4 min de lectura",
          content: `## Introducción a ${topic}\n\nEn este artículo exploramos cómo implementar soluciones eficientes y escalables para ${topic}.\n\n### Arquitectura Recomendada\n\n- Desacoplamiento modular\n- Optimización en Vercel Serverless\n- Buenas prácticas con TypeScript`,
          telemetry: { beforeTime: "3.0s", afterTime: "1.0s", score: "95/100", label: "Eficiencia" },
        };
      }

      const slug = sanitizeKebabCase(postData.slug || postData.title);
      const isPublished = Boolean(publishNow);

      const savedPost = await BlogPost.findOneAndUpdate(
        { slug },
        {
          $set: {
            title: postData.title,
            slug,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category || category,
            readingTime: postData.readingTime || "5 min de lectura",
            coverImage: randomImage.url,
            telemetry: postData.telemetry,
            published: isPublished,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      const statusText = isPublished ? "publicado en vivo" : "guardado como borrador";
      return {
        success: true,
        message: `✍️ **Artículo ${statusText}:** [${savedPost.title}](/blog/${savedPost.slug}). Puedes gestionarlo en [/admin/blog](/admin/blog).`,
        data: savedPost,
      };
    }

    case "PUBLISH_BLOG_POST": {
      const { slug } = payload;
      if (!slug) return { success: false, message: "Falta el slug del artículo para publicar." };

      const post = await BlogPost.findOneAndUpdate(
        { slug },
        { $set: { published: true, updatedAt: new Date() } },
        { new: true }
      );

      if (!post) {
        return { success: false, message: `No se encontró ningún artículo con el slug "${slug}".` };
      }

      return {
        success: true,
        message: `🚀 **Artículo publicado exitosamente:** [${post.title}](/blog/${post.slug}). Ya está accesible al público.`,
        data: post,
      };
    }

    case "UPDATE_THEME": {
      const validThemeKeys = [
        "backgroundColor",
        "textColor",
        "cardBackgroundColor",
        "cardBorderColor",
        "buttonColor",
        "buttonTextColor",
        "buttonBorderRadius",
        "accentColor",
        "fontSizeScale",
      ];

      const updateObj: Record<string, any> = {};
      const changesList: string[] = [];

      for (const key of validThemeKeys) {
        if (payload[key] !== undefined) {
          updateObj[`theme.${key}`] = payload[key];
          changesList.push(`${key}: \`${payload[key]}\``);
        }
      }

      if (changesList.length === 0) {
        return { success: false, message: "No se proporcionaron atributos de diseño válidos para actualizar." };
      }

      await SiteConfig.findOneAndUpdate(
        { key: "main_config" },
        { $set: { ...updateObj, updatedAt: new Date() } },
        { upsert: true }
      );

      return {
        success: true,
        refreshConfigNeeded: true,
        message: `🎨 **Diseño y estilos actualizados en vivo:** ${changesList.join(", ")}. Los cambios se reflejarán instantáneamente.`,
      };
    }

    case "UPDATE_COPY": {
      const { section = "hero", field, value } = payload;
      if (!field || value === undefined) {
        return { success: false, message: "Se requiere especificar el campo y el nuevo valor del texto." };
      }

      const pathKey = `sections.${section}.${field}`;
      await SiteConfig.findOneAndUpdate(
        { key: "main_config" },
        { $set: { [pathKey]: value, updatedAt: new Date() } },
        { upsert: true }
      );

      return {
        success: true,
        refreshConfigNeeded: true,
        message: `📝 **Texto actualizado en ${section} (${field}):** "${value}". Aplicado inmediatamente.`,
      };
    }

    case "UPDATE_SEO": {
      const { metaTitle, metaDescription, keywords } = payload;
      const setObj: Record<string, any> = { updatedAt: new Date() };

      const changes: string[] = [];
      if (metaTitle) {
        setObj["seo.metaTitle"] = metaTitle;
        changes.push(`Título: "${metaTitle}"`);
      }
      if (metaDescription) {
        setObj["seo.metaDescription"] = metaDescription;
        changes.push(`Descripción: "${metaDescription.slice(0, 60)}..."`);
      }
      if (Array.isArray(keywords)) {
        setObj["seo.keywords"] = keywords;
        changes.push(`Keywords: ${keywords.join(", ")}`);
      }

      await SiteConfig.findOneAndUpdate({ key: "main_config" }, { $set: setObj }, { upsert: true });

      return {
        success: true,
        refreshConfigNeeded: true,
        message: `🔍 **Metatags y SEO optimizados:** ${changes.join(" | ")}. Guardados en la configuración global.`,
      };
    }

    case "ADVISE_CROSSPOST": {
      const { slug, platform = "medium" } = payload;
      if (!slug) return { success: false, message: "Especifica el slug del artículo para crossposting." };

      const post = await BlogPost.findOne({ slug });
      if (!post) return { success: false, message: `No se encontró el artículo "${slug}".` };

      const canonicalUrl = `https://alonsorios.dev/blog/${post.slug}`;
      const preparedContent = cleanLockedContentForExternal(post.content, canonicalUrl);

      return {
        success: true,
        message: `🌐 **Estrategia de Crossposting para ${platform.toUpperCase()}:**
* **Artículo:** [${post.title}](/blog/${post.slug})
* **Canonical URL (Vital para SEO):** \`${canonicalUrl}\`
* **Preparación:** El contenido ha sido formateado con los tags canónicos hacia tu dominio oficial para proteger tu autoridad en Google.
* **Tags recomendados:** \`Web Development\`, \`Next.js\`, \`Software Architecture\`, \`TypeScript\`.
* Para publicar en 1 clic, puedes ir a [/admin/blog](/admin/blog) y usar el botón de crossposting con tu token configurado.`,
        data: { canonicalUrl, preparedLength: preparedContent.length },
      };
    }

    case "UPDATE_STATUS": {
      const project = payload.project || "alonsoriosdev";
      const activity = payload.activity || "Desarrollo en curso";

      await SiteConfig.findOneAndUpdate(
        { key: "main_config" },
        {
          $set: {
            "sections.developerStatus.isManualOverride": true,
            "sections.developerStatus.project": project,
            "sections.developerStatus.cleanRepoName": project,
            "sections.developerStatus.activity": activity,
            "sections.developerStatus.updatedAt": new Date(),
          },
        },
        { upsert: true }
      );

      try {
        const dataDir = path.join(process.cwd(), "src", "data");
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(
          path.join(dataDir, "live_workstation_status.json"),
          JSON.stringify(
            {
              activeProject: project,
              cleanRepoName: project,
              currentFocus: activity,
              branch: "main",
              lastPulse: new Date().toISOString(),
            },
            null,
            2
          ),
          "utf8"
        );
      } catch {}

      return {
        success: true,
        refreshConfigNeeded: true,
        message: `✅ **Telemetría de trabajo actualizada:** Proyecto: **${project}** | Tarea: **${activity}**. Ya está visible en vivo en el footer y en [/roadmap](/roadmap).`,
      };
    }

    default:
      return { success: false, message: `Acción desconocida: ${actionType}` };
  }
}
