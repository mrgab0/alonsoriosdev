import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import SiteConfig from "@/models/SiteConfig";
import CourseBook from "@/models/CourseBook";
import CaseStudy from "@/models/CaseStudy";
import Contact from "@/models/Contact";
import PageView from "@/models/PageView";
import BlogPost from "@/models/BlogPost";
import { executeAdminAction } from "@/lib/adminActions";


// System Instructions for Gemini 1.5 Flash AI Agent
const SYSTEM_PROMPT = `
Eres el asistente virtual oficial de Alonso Ríos (alonsorios.dev).
Alonso Ríos es un desarrollador de software experto con tarifa transparente de $19 USD / hora:
1. Creación y Diseño de Páginas Web normales: 40 horas de trabajo ($760 USD).
2. Desarrollo de Aplicaciones Móviles Android nativas: 60 horas de trabajo ($1,140 USD) con publicación en Google Play Store.
3. Sistemas Complejos o Plataformas a Medida: 180 horas de trabajo ($3,420 USD).
4. Urgencias y Recuperación de Sitios Web caídos o infectados: 10 a 20 horas ($190 a $380 USD).
5. Venta de Libros Digitales (PDF) y Cursos en Video HD paso a paso: desde $14.99 USD hasta $29.99 USD.

Datos Oficiales de Contacto:
- WhatsApp Directo: +58 412 991 2840 (https://wa.me/584129912840)
- Correo Electrónico: iirockalonso@gmail.com

Instrucciones de Respuesta:
- Sé siempre amable, educado, claro y profesional.
- Explica los precios basándote en la tarifa horaria de $19 USD/h y las horas requeridas.
- Invita siempre al usuario a hablar directamente con Alonso por WhatsApp para cotizar su proyecto.
`;

// Model Cascade configuration (Ordered by speed, reliability, and capability)
const CASCADE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

// Gemini AI API Call with multi-tier failover cascade and per-model timeout
async function getGeminiAiResponse(userMessage: string, dynamicPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (const model of CASCADE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${dynamicPrompt}\n\nConsulta del usuario: ${userMessage}` }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 350,
              temperature: 0.7,
            },
          }),
          signal: AbortSignal.timeout(4500), // 4.5s timeout per model before cascading
        }
      );

      // If status is not 200 (429 rate limit, 404 deprecated, 503 overloaded), cascade to next
      if (!res.ok) {
        console.warn(`[AI Cascade] Model ${model} returned HTTP ${res.status}. Cascading to next candidate...`);
        continue;
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];

      // Verify valid text was produced and not blocked by safety
      const candidateText = candidate?.content?.parts?.[0]?.text;
      if (candidateText && candidateText.trim().length > 0) {
        return candidateText.trim();
      }

      console.warn(`[AI Cascade] Model ${model} returned empty or filtered content (${candidate?.finishReason}). Cascading...`);
    } catch (err: any) {
      console.warn(`[AI Cascade] Model ${model} error: ${err?.message || err}. Cascading to next candidate...`);
    }
  }

  // All models in the cascade failed or timed out
  console.warn("[AI Cascade] All models in cascade exhausted. Falling back to rule engine.");
  return null;
}

// Smart human-like fallback knowledge base for Alonso Ríos
function generateHumanLikeResponse(userText: string): { reply: string; suggestWhatsapp: boolean } {
  const text = userText.toLowerCase().trim();

  if (text.includes("hola") || text.includes("buenas") || text.includes("saludos")) {
    return {
      reply:
        "¡Hola! 👋 Qué gusto saludarte. Soy el asistente virtual de Alonso Ríos. ¿En qué te puedo ayudar hoy? Mi tarifa transparente es de $19 USD/hora. Desarrollamos páginas web normales, apps Android, trabajos complejos y recuperamos sitios caídos.",
      suggestWhatsapp: false,
    };
  }

  if (text.includes("precio") || text.includes("cuanto cuesta") || text.includes("valor") || text.includes("cotiz") || text.includes("tarifa")) {
    return {
      reply:
        "La hora de trabajo de Alonso vale $19 USD/h. Los valores calculados son:\n• Página Web Normal (40 hrs): $760 USD\n• App Android (60 hrs): $1,140 USD\n• Trabajo Complejo / Sistema (180 hrs): $3,420 USD\n• Urgencia por Hackeo (10-20 hrs): $190 - $380 USD\n• Libros/Cursos: desde $14.99 USD.\n¿Te gustaría cotizar tu caso por WhatsApp?",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("recupera") || text.includes("caida") || text.includes("hackea") || text.includes("virus") || text.includes("error")) {
    return {
      reply:
        "🚑 Si tu sitio web se cayó o fue infectado, una recuperación toma entre 10 y 20 horas ($190 a $380 USD a $19/h). Alonso desinfecta el código, restaura copias y solicita el desbloqueo urgente en Google. ¿Cuál es la URL afectada?",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("app") || text.includes("android") || text.includes("celular") || text.includes("movil")) {
    return {
      reply:
        "📱 Desarrollo de aplicaciones nativas Android: toma aproximadamente 60 horas de trabajo ($1,140 USD a $19/h) e incluye la publicación oficial en Google Play Store.",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("libro") || text.includes("curso") || text.includes("aprender") || text.includes("estudiar")) {
    return {
      reply:
        "📚 ¡Excelente! Tienes a tu disposición:\n• Libro Digital PDF 'Páginas Web Sin Dolor de Cabeza': $14.99 USD\n• Curso en Video 'Crea tu Primera App Android en 7 Días': $29.99 USD\n• Manual Digital 'SEO & Reputación Digital': $19.99 USD.",
      suggestWhatsapp: false,
    };
  }

  if (text.includes("humano") || text.includes("alonso") || text.includes("persona") || text.includes("whatsapp")) {
    return {
      reply:
        "¡Por supuesto! Para hablar directo con Alonso Ríos por WhatsApp y definir los detalles de tu proyecto, presiona el botón a continuación.",
      suggestWhatsapp: true,
    };
  }

  return {
    reply:
      "Entiendo tu consulta. Alonso estará encantado de ayudarte a resolver esto sin complicaciones a $19 USD/hora. ¿Quieres hablar directamente con él por WhatsApp?",
    suggestWhatsapp: true,
  };
}

// Send real-time webhook notification to Telegram or Discord
async function sendLiveNotification(userMessage: string, botReply: string, config: any) {
  const telegramUrl = config?.sections?.contact?.telegramWebhookUrl || process.env.TELEGRAM_WEBHOOK_URL;
  const discordUrl = config?.sections?.contact?.discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL;

  const notifyText = `💬 *NUEVA CONVERSACIÓN CHATBOT* (alonsorios.dev)\n👤 *Cliente:* ${userMessage}\n🤖 *Asistente:* ${botReply}`;

  // 1. Telegram Notification (Free & Instant on Mobile)
  if (telegramUrl && telegramUrl.startsWith("http")) {
    try {
      await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notifyText, parse_mode: "Markdown" }),
      });
    } catch {}
  }

  // 2. Discord Notification (Free & Instant)
  if (discordUrl && discordUrl.startsWith("http")) {
    try {
      await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notifyText }),
      });
    } catch {}
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId = "session_default", isAdmin = false, currentPath = "/" } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    let config: any = null;
    let dynamicPrompt = SYSTEM_PROMPT; // fallback to the static prompt
    let suggestWhatsapp = !isAdmin;

    try {
      if (process.env.MONGODB_URI) {
        await connectToDatabase();
        config = await SiteConfig.findOne({ key: "main_config" });

        if (isAdmin) {
          // --- MODO ADMIN MAYORDOMO INTELIGENTE (ALONSO AI BUTLER) ---
          const [totalContacts, totalViews, totalPosts, recentViews, recentContacts] = await Promise.all([
            Contact.countDocuments(),
            PageView.countDocuments(),
            BlogPost.countDocuments({ published: true }),
            PageView.find().sort({ timestamp: -1 }).limit(6).lean(),
            Contact.find().sort({ createdAt: -1 }).limit(3).lean(),
          ]);

          const devStatus = config?.sections?.developerStatus;
          const currentProject = devStatus?.project || "alonsoriosdev";
          const currentTask = devStatus?.activity || "Mantenimiento y nuevas funciones";
          const currentTheme = config?.theme || {};
          const currentHero = config?.sections?.hero || {};
          const currentSeo = config?.seo || {};

          const trafficSummary = recentViews.map((v: any) => `• [${v.referrer || 'Directo'}] -> ${v.path} (${new Date(v.timestamp).toLocaleTimeString()})`).join("\n");
          const contactsSummary = recentContacts.map((c: any) => `• ${c.name} (${c.email}): "${c.serviceType}" (${new Date(c.createdAt).toLocaleDateString()})`).join("\n");

          dynamicPrompt = `Eres "Alonso Butler", el Mayordomo Inteligente y Asistente Ejecutivo personal de Alonso Ríos para la administración y evolución total de alonsorios.dev.
Tu carácter es devoto, refinado, técnico, proactivo y altamente resolutivo ("A su servicio, Alonso").
Cuando Alonso te pide una tarea, meditas el ángulo técnico o de negocio, explicas tu razonamiento y ejecutas la acción precisa de inmediato mediante Tool Calling.

RUTA ACTUAL EN PANTALLA: ${currentPath}

ESTADO ACTUAL DE LA PLATAFORMA (DATOS EN VIVO):
- Leads / Contactos: ${totalContacts}
- Visitas acumuladas: ${totalViews}
- Artículos publicados: ${totalPosts}
- Proyecto activo en telemetría: "${currentProject}" (Tarea: "${currentTask}")
- Tema actual: Fondo: ${currentTheme.backgroundColor || '#0a1120'}, Acento: ${currentTheme.accentColor || '#fbbf24'}, Escala texto: ${currentTheme.fontSizeScale || 'normal'}
- Título Hero: "${currentHero.title || 'Páginas Web, Apps Android y SEO'} ${currentHero.titleHighlight || 'sin complicaciones'}"
- Subtítulo Hero: "${currentHero.subtitle || ''}"
- SEO MetaTitle: "${currentSeo.metaTitle || 'Alonso Ríos | Soluciones Web'}"

TRÁFICO RECIENTE EN TIEMPO REAL:
${trafficSummary || "Sin registros recientes de tráfico."}

ÚLTIMOS CONTACTOS RECIBIDOS:
${contactsSummary || "Sin mensajes de contacto recientes."}

CATÁLOGO DE ACCIONES (TOOL CALLING):
Cuando Alonso te ordene realizar una tarea, añade al final de tu respuesta el tag correspondiente (uno o más según corresponda):

1. GENERAR ARTÍCULO PARA EL BLOG:
   [ACTION:CREATE_BLOG_POST:{"topic":"Tema o título técnico","keywords":"palabras clave","publishNow":false,"category":"Desarrollo Web & Arquitectura"}]
   (Nota: Si Alonso te pide publicarlo de una vez, pon "publishNow": true; si pide redactarlo o prepararlo, pon false).

2. PUBLICAR UN ARTÍCULO EXISTENTE:
   [ACTION:PUBLISH_BLOG_POST:{"slug":"slug-del-articulo"}]

3. EDITAR ESTILOS Y TEMA (Colores, botones, escala de fuente):
   [ACTION:UPDATE_THEME:{"backgroundColor":"#hex","accentColor":"#hex","cardBackgroundColor":"#hex","fontSizeScale":"normal"|"large"|"xlarge"}]

4. EDITAR TEXTOS Y COPY DE LA PÁGINA (Quitar frases, cambiar títulos o bio):
   [ACTION:UPDATE_COPY:{"section":"hero"|"services"|"contact","field":"title"|"titleHighlight"|"subtitle"|"statusBadge"|"profileBio","value":"Nuevo texto redactado"}]

5. OPTIMIZAR SEO Y METATAGS:
   [ACTION:UPDATE_SEO:{"metaTitle":"Título SEO optimizado","metaDescription":"Descripción de 150 caracteres","keywords":["keyword1","keyword2"]}]

6. ASESORÍA Y PREPARACIÓN DE CROSSPOSTING (MEDIUM, DEV.TO):
   [ACTION:ADVISE_CROSSPOST:{"slug":"slug-del-articulo","platform":"medium"}]

7. ACTUALIZAR ESTADO DE TELEMETRÍA EN VIVO:
   [ACTION:UPDATE_STATUS:{"project":"NombreProyecto","activity":"DescripcionDeLaTarea"}]

Directrices de Respuesta del Mayordomo:
- Dirígete a Alonso con respeto profesional ("A su servicio, Alonso", "Con gusto procedo...").
- Razona brevemente antes de actuar: si te pide un post, medita el enfoque de arquitectura, el valor para el lector y el SEO.
- Si te pregunta por quién ha entrado o contactos, usa los datos en vivo listados arriba.`;
        } else {
          // --- MODO CLIENTE / VISITANTE ---
          const courses = await CourseBook.find();
          const projects = await CaseStudy.find({ featured: true });

          const whatsapp = config?.sections?.contact?.whatsappNumber || "+58 412 991 2840";
          const email = config?.sections?.contact?.email || "iirockalonso@gmail.com";

          const coursesText = courses.map((c: any) => `- [${c.type.toUpperCase()}] ${c.title}: Precio ${c.price}. Detalles: ${c.description}. LINK DE COMPRA: ${c.purchaseUrl || 'Pedir por WhatsApp'}`).join('\n');
          const projectsText = projects.map((p: any) => `- Proyecto ${p.title} (${p.category}): Problema: ${p.problemDescription}. Solución: ${p.solutionDescription}. Cliente: ${p.clientName}`).join('\n');

          dynamicPrompt = `Eres el asistente virtual oficial de Alonso Ríos (alonsorios.dev), diseñado para VENDER y AYUDAR proactivamente.
Aquí está tu base de conocimientos actualizada en tiempo real con lo que ofrecemos:

PRECIOS Y SERVICIOS BASE:
- Tarifa de ingeniería transparente: $19 USD / hora
- Página Web Normal (40 hrs): $760 USD
- App Móvil Nativa Android (60 hrs): $1,140 USD con publicación en Google Play
- Sistemas Complejos a Medida (180 hrs): $3,420 USD
- Recuperación urgente de sitios caídos o hackeados (10 a 20 hrs): $190 a $380 USD

MIS REDES Y CONTACTO DIRECTO:
- WhatsApp: ${whatsapp}
- Email: ${email}

LIBROS Y CURSOS DISPONIBLES PARA VENDER:
${coursesText || "Sin cursos registrados en este momento."}

PROYECTOS Y CASOS DE ÉXITO (Úsalos para dar confianza cuando pregunten por servicios):
${projectsText || "Sin proyectos destacados por ahora."}

INSTRUCCIONES DE VENTA:
1. Si preguntan por aprender, ofrece inmediatamente el libro o curso relacionado e incluye explícitamente el LINK DE COMPRA para que lo adquieran.
2. Si preguntan por servicios o si has hecho cosas parecidas, menciona un Caso de Éxito relevante para dar confianza y ofréceles hablar por WhatsApp para cotizar.
3. Sé persuasivo, amable y muy profesional.`;
        }
      }
    } catch (e) {
      console.warn("Error fetching dynamic context for chatbot:", e);
    }

    // Try Gemini AI Cascade first
    let reply = await getGeminiAiResponse(message, dynamicPrompt);

    if (!reply) {
      if (isAdmin) {
        reply = "🎩 **Alonso Butler:** Mil disculpas, Alonso. Se ha presentado una sobrecarga momentánea en la cascada de modelos neuronales. Quedo a su disposición para reintentar la acción o puede gestionar los módulos directamente en [Blog](/admin/blog) o [Editor](/admin/editor).";
        suggestWhatsapp = false;
      } else {
        const fallbackResult = generateHumanLikeResponse(message);
        reply = fallbackResult.reply;
        suggestWhatsapp = fallbackResult.suggestWhatsapp;
      }
    }

    let refreshConfigNeeded = false;

    // Intercept and execute Action Tags if present in Admin mode
    if (isAdmin && reply.includes("[ACTION:")) {
      try {
        const actionRegex = /\[ACTION:([A-Z_]+):(\{[\s\S]*?\})\]/g;
        const matches = [...reply.matchAll(actionRegex)];

        for (const match of matches) {
          const actionTag = match[0];
          const actionType = match[1];
          try {
            const actionPayload = JSON.parse(match[2]);
            const result = await executeAdminAction(actionType, actionPayload);
            if (result.refreshConfigNeeded) {
              refreshConfigNeeded = true;
            }
            reply = reply.replace(actionTag, `\n\n${result.message}`);
          } catch (execErr: any) {
            console.warn(`Error running action ${actionType}:`, execErr);
            reply = reply.replace(actionTag, `\n\n⚠️ Error ejecutando ${actionType}: ${execErr?.message || execErr}`);
          }
        }
      } catch (actionErr) {
        console.warn("Error parsing Butler actions:", actionErr);
      }
    }

    try {
      if (process.env.MONGODB_URI) {
        await ChatMessage.create({ sessionId, sender: "user", text: message });
        await ChatMessage.create({ sessionId, sender: "bot", text: reply, escalatedToWhatsapp: suggestWhatsapp });
      }
    } catch {}

    // Only notify phone webhook for visitor messages (not admin sessions)
    if (!isAdmin) {
      sendLiveNotification(message, reply, config).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      reply,
      suggestWhatsapp,
      refreshConfig: refreshConfigNeeded,
      whatsappNumber: config?.sections?.contact?.whatsappNumber || "+584129912840",
    });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ error: "Error procesando el mensaje." }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const history = await ChatMessage.find().sort({ timestamp: -1 }).limit(50);
      return NextResponse.json({ success: true, data: history });
    }
  } catch {}

  return NextResponse.json({
    success: true,
    data: [
      { sessionId: "s1", sender: "user", text: "Hola, ¿cuánto cuesta una página web normal?", timestamp: new Date() },
      { sessionId: "s1", sender: "bot", text: "Una página web normal toma 40h de trabajo a $19/h = $760 USD...", timestamp: new Date() },
    ],
  });
}
