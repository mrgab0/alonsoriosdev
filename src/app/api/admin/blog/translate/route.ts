import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";
import BlogPost from "@/models/BlogPost";

export const runtime = "nodejs";

function sanitizeKebabCase(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(req: Request) {
  try {
    const { postId, targetLanguage = "en" } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Falta el ID del artículo a traducir." }, { status: 400 });
    }

    await connectToDatabase();
    const [configDoc, post] = await Promise.all([
      SiteConfig.findOne({ key: "main_config" }).lean(),
      BlogPost.findById(postId).lean(),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
    }

    const apiKey = (
      configDoc?.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    )?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "No se encontró GEMINI_API_KEY configurada." }, { status: 400 });
    }

    const isTargetEn = targetLanguage === "en";
    const targetLabel = isTargetEn ? "English" : "Spanish (Español)";

    const systemPrompt = `You are a professional technical translator and software engineering editor for Alonso Ríos (alonsorios.dev).
Your job is to translate technical software engineering blog posts between Spanish and English.

Rules:
1. Preserve all Markdown formatting exactly (## headers, bold text, bullet points, numbered lists).
2. NEVER modify or translate code inside code blocks (\`\`\`typescript, \`\`\`bash, \`\`\`kotlin, etc.) or variable/file names (\`app.tsx\`, \`routes\`, etc.).
3. Preserve all image links ![Alt](URL) and markdown links [text](URL) exactly.
4. Output STRICT JSON format with this structure:
{
  "title": "Translated technical title",
  "slug": "translated-kebab-case-slug",
  "excerpt": "Translated meta description",
  "content": "Fully translated Markdown content"
}`;

    const userPrompt = `Translate this technical article to ${targetLabel}:
Title: ${post.title}
Excerpt: ${post.excerpt || ""}
Content:
${post.content}`;

    const CASCADE_MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];

    let rawAiText = "";

    for (const model of CASCADE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(18000),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            rawAiText = candidateText.trim();
            break;
          }
        }
      } catch (err) {
        console.warn(`[Translate Cascade] Model ${model} failed:`, err);
      }
    }

    if (!rawAiText) {
      return NextResponse.json({ error: "No se pudo traducir el post con la IA." }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawAiText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
    } catch {
      return NextResponse.json({ error: "Error al decodificar la traducción de la IA." }, { status: 500 });
    }

    if (parsed.slug) {
      parsed.slug = sanitizeKebabCase(parsed.slug);
    }

    return NextResponse.json({ success: true, translation: parsed });
  } catch (error: any) {
    console.error("Error en API /api/admin/blog/translate:", error);
    return NextResponse.json({ error: "Error interno al traducir artículo.", detail: error?.message }, { status: 500 });
  }
}
