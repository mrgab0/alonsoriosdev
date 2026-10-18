import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";
import CaseStudy from "@/models/CaseStudy";

export const runtime = "nodejs";

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

function parseAiJsonSafely(rawJson: string, fallbackImage: string): any {
  try {
    // Attempt standard parse first
    const cleaned = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    // Regex-based resilient field extraction in case of minor truncation
    const titleMatch = rawJson.match(/"title"\s*:\s*"([^"]+)"/);
    const slugMatch = rawJson.match(/"slug"\s*:\s*"([^"]+)"/);
    const excerptMatch = rawJson.match(/"excerpt"\s*:\s*"([^"]+)"/);
    const categoryMatch = rawJson.match(/"category"\s*:\s*"([^"]+)"/);
    const readingTimeMatch = rawJson.match(/"readingTime"\s*:\s*"([^"]+)"/);

    // Try extracting content between quotes or markdown
    let content = "";
    const contentMatch = rawJson.match(/"content"\s*:\s*"([\s\S]*?)(?=",\s*"(?:tags|category|telemetry|suggestedImage))/);
    if (contentMatch) {
      content = contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    } else {
      content = rawJson.slice(0, 1500);
    }

    const title = titleMatch ? titleMatch[1] : "Artículo Técnico - Alonso Ríos";
    const slug = slugMatch ? sanitizeKebabCase(slugMatch[1]) : sanitizeKebabCase(title);

    return {
      title,
      slug,
      excerpt: excerptMatch ? excerptMatch[1] : "Artículo sobre arquitectura de software, rendimiento web y desarrollo por Alonso Ríos.",
      content,
      category: categoryMatch ? categoryMatch[1] : "Desarrollo Web & Rendimiento",
      readingTime: readingTimeMatch ? readingTimeMatch[1] : "6 min de lectura",
      tags: ["Desarrollo Web", "Next.js", "Arquitectura", "SEO"],
      suggestedImage: fallbackImage,
      telemetry: {
        beforeTime: "3.2s",
        afterTime: "0.8s",
        score: "98/100",
        label: "Velocidad LCP",
      },
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, keywords = "", category = "Desarrollo Web & Rendimiento", language = "es" } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Por favor ingresa un tema o idea técnica para generar el artículo." },
        { status: 400 }
      );
    }

    let siteConfig: any = null;
    let portfolioProjects: any[] = [];

    try {
      if (process.env.MONGODB_URI) {
        await connectToDatabase();
        const [configDoc, projects] = await Promise.all([
          SiteConfig.findOne({ key: "main_config" }).lean(),
          CaseStudy.find({ featured: true }).limit(5).lean(),
        ]);
        siteConfig = configDoc;
        portfolioProjects = projects || [];
      }
    } catch (dbErr) {
      console.warn("DB lookup error in blog generate, using fallbacks:", dbErr);
    }

    const apiKey = (
      siteConfig?.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    )?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "No se encontró GEMINI_API_KEY. Configúrala en Vercel o en el archivo .env.local para activar el Autopilot.",
        },
        { status: 400 }
      );
    }

    const isEn = language === "en";

    // Build image pool combining curated tech photos and real portfolio items
    const availableImages: Array<{ url: string; alt: string }> = [...CURATED_TECH_IMAGES];
    if (portfolioProjects && Array.isArray(portfolioProjects)) {
      portfolioProjects.forEach((p: any) => {
        if (p.beforeAfterImage?.after) {
          availableImages.push({
            url: p.beforeAfterImage.after,
            alt: `Caso de éxito: ${p.title} (${p.category}) - Alonso Ríos Dev`,
          });
        }
      });
    }

    const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
    const coverImage = shuffled[0]?.url || CURATED_TECH_IMAGES[0].url;
    const contentImg1 = shuffled[1] || CURATED_TECH_IMAGES[1];
    const contentImg2 = shuffled[2] || CURATED_TECH_IMAGES[2];
    const contentImg3 = shuffled[3] || CURATED_TECH_IMAGES[3];

    const systemPrompt = `Eres Alonso Ríos, ingeniero de software senior, arquitecto de sistemas web y móviles (alonsorios.dev).
Escribes artículos de blog técnicos, cautivadores, profundos y altamente optimizados para Google Search (SEO técnico), desarrolladores y clientes potenciales que buscan soluciones de ingeniería seria.

Perfil y Servicios de Alonso Ríos a integrar naturalmente:
- Tarifa de ingeniería: $19 USD / hora con transparencia absoluta.
- Especialidades: Creación de Páginas Web ultrarrápidas (Next.js, React, Tailwind, SSR/ISR), Aplicaciones Nativas Android (Kotlin, Jetpack Compose), Ciberseguridad y Recuperación de Sitios Hackeados o Caídos (10-20 horas de trabajo), Optimización Core Web Vitals (puntuaciones 95-100 en PageSpeed), y Venta de Cursos/Libros prácticos en video y PDF.
- Contacto directo: WhatsApp (+58 412 991 2840) y sitio oficial (alonsorios.dev).

Instrucciones estrictas de estructura y maquetación Markdown:
1. Longitud ideal: Entre 750 y 1,200 palabras de contenido técnico denso, didáctico y sin relleno superfluo.
2. SUBTÍTULOS OBLIGATORIOS (H2 y H3): Cada nueva sección DEBE comenzar estrictamente con '## ' (ejemplo: '## 1. El cuello de botella en la renderización', '## 2. Implementación de Server Components paso a paso'). NUNCA dejes subtítulos sin '## '.
3. BLOQUES DE CÓDIGO REALES: Incluye al menos 2 bloques de código funcional y bien comentado usando sintaxis Markdown (\`\`\`typescript, \`\`\`bash o \`\`\`kotlin).
4. MAQUETACIÓN CON IMÁGENES: En el campo "content", DEBES insertar de 2 a 3 imágenes ilustrativas usando Markdown ![Texto descriptivo](URL), ubicándolas estratégicamente entre las secciones del texto:
   - Imagen 1 (en la primera sección de arquitectura o problema): ![${contentImg1.alt}](${contentImg1.url})
   - Imagen 2 (en la sección de optimización o código): ![${contentImg2.alt}](${contentImg2.url})
   - Imagen 3 (antes de la conclusión): ![${contentImg3.alt}](${contentImg3.url})
5. FORMATO DE VIÑETAS: Cuando uses listas con guiones (-), inicia siempre con el concepto en negrita (ejemplo: '- **Optimización de Caché ISR:** Permite revalidar datos estáticos en segundo plano sin saturar el servidor...').
6. LLAMADO A LA ACCIÓN FINAL: La última sección '## Conclusión y Soporte de Ingeniería' debe invitar al lector a contactar a Alonso Ríos vía WhatsApp (+58 412 991 2840) para auditar o desarrollar su proyecto con la tarifa transparente de $19 USD/h.
7. RESPUESTA ESTRICTAMENTE EN JSON: Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código Markdown externos, con la siguiente estructura:
{
  "title": "Título SEO de alto impacto técnico (máximo 70 caracteres)",
  "slug": "slug-kebab-case-limpio-sin-acentos-ni-espacios",
  "excerpt": "Meta descripción resumida de 145 a 160 caracteres lista para indexar en Google.",
  "content": "Contenido completo en Markdown con subtítulos (##), bloques de código con sintaxis, viñetas enriquecidas, las 3 imágenes integradas y llamado a la acción.",
  "category": "${category}",
  "readingTime": "6 min de lectura",
  "tags": ["Next.js", "Arquitectura", "TypeScript", "Rendimiento"],
  "suggestedImage": "${coverImage}",
  "telemetry": {
    "beforeTime": "3.8s",
    "afterTime": "0.7s",
    "score": "99/100",
    "label": "Rendimiento LCP"
  }
}

Idioma del artículo: ${isEn ? "Inglés (English)" : "Español"}.`;

    const userPrompt = `Genera un post de blog técnico completo, profesional y optimizado para SEO sobre el siguiente tema: "${topic.trim()}".
${keywords ? `Palabras clave técnicas a incluir: "${keywords.trim()}".` : ""}
Categoría sugerida: ${category}.`;

    const CASCADE_MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
    ];

    let rawAiText = "";
    let lastError: any = null;

    for (const model of CASCADE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(18000), // 18s timeout per model
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            rawAiText = candidateText.trim();
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`[Autopilot Cascade] Model ${model} failed with HTTP ${response.status}:`, errText);
          lastError = errText;
        }
      } catch (err: any) {
        console.warn(`[Autopilot Cascade] Network or timeout error on ${model}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!rawAiText) {
      return NextResponse.json(
        {
          error: "No se pudo generar el post con la IA en este momento. Verifica tu API Key en Vercel o intenta de nuevo.",
          detail: lastError?.toString?.() || "Timeout",
        },
        { status: 502 }
      );
    }

    const postData = parseAiJsonSafely(rawAiText, coverImage);

    // Sanitize slug to ensure kebab-case
    if (postData.slug) {
      postData.slug = sanitizeKebabCase(postData.slug);
    }

    return NextResponse.json({ success: true, post: postData });
  } catch (error: any) {
    console.error("Error en API /api/admin/blog/generate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la solicitud de Autopilot.", detail: error?.message },
      { status: 500 }
    );
  }
}
