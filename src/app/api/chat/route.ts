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
          // --- MODO ADMIN CO-PILOT ---
          const [totalContacts, totalViews, totalPosts] = await Promise.all([
            Contact.countDocuments(),
            PageView.countDocuments(),
            BlogPost.countDocuments({ published: true }),
          ]);

          const devStatus = config?.sections?.developerStatus;
          const currentProject = devStatus?.project || "alonsoriosdev";
          const currentTask = devStatus?.activity || "Mantenimiento y nuevas funciones";

          dynamicPrompt = `Eres "Alonso Co-Pilot", el copiloto inteligente de inteligencia artificial para la administración de alonsorios.dev.
Tu misión es asistir a Alonso Ríos en la gestión operativa, desarrollo, analíticas y redacción técnica de su plataforma.

Ruta actual del administrador en pantalla: ${currentPath}

Módulos del Administrador y Enlaces Directos:
1. Blog & Autopilot: [Gestionar Blog y Autopilot](/admin/blog) (Crear artículos técnicos en 1 clic con Gemini, traducir a inglés y editar contenido).
2. Telemetría & Diseño: [Editor del Sitio y Roadmap](/admin/editor) (Configurar perfil, tarifas de $19/h, héroe y telemetría de trabajo).
3. Analíticas & Leads: [Panel de Analíticas](/admin/analytics) y [Bandeja de Contactos](/admin/leads).
4. Herramientas QR & Pagos: [Suite QR](/admin/qr) y [Configuración de Pagos](/admin/pagos).
5. Roadmap Público: [Roadmap & Mirror GitHub](/roadmap).

TELEMETRÍA Y MÉTRICAS EN VIVO DEL SISTEMA:
- Leads / Contactos registrados: ${totalContacts}
- Visitas acumuladas: ${totalViews}
- Artículos técnicos publicados: ${totalPosts}
- Proyecto activo actual: "${currentProject}" (Tarea: "${currentTask}")

CAPACIDADES ACCIONABLES (TOOL CALLING):
Si Alonso te solicita cambiar su estado o en qué está trabajando (ej: "pon que ando en...", "actualiza mi estado a...", "estoy programando en..."), extrae el nombre del proyecto y la tarea, y DEBES añadir OBLIGATORIAMENTE al final de tu respuesta el siguiente bloque de acción:
[ACTION:UPDATE_STATUS:{"project":"NombreDelProyecto","activity":"DescripcionDeLaTarea"}]

Reglas de Estilo Co-Pilot:
- Sé directo, profesional, técnico y ágil (estilo Obsidian Cinema).
- Responde siempre con formato Markdown y enlaces útiles hacia los módulos.
- Nunca inventes datos: si te preguntan por métricas, usa los números en vivo provistos arriba.`;
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
        reply = "⚡ **Alonso Co-Pilot:** Se agotaron los modelos de IA momentáneamente. Puedes acceder directamente a tus módulos en [Blog](/admin/blog) o [Editor](/admin/editor).";
        suggestWhatsapp = false;
      } else {
        const fallbackResult = generateHumanLikeResponse(message);
        reply = fallbackResult.reply;
        suggestWhatsapp = fallbackResult.suggestWhatsapp;
      }
    }

    // Intercept and execute Action Tags if present in Admin mode
    if (isAdmin && reply.includes("[ACTION:UPDATE_STATUS:")) {
      try {
        const match = reply.match(/\[ACTION:UPDATE_STATUS:(\{.*?\})\]/);
        if (match && match[1]) {
          const actionData = JSON.parse(match[1]);
          const project = actionData.project || "alonsoriosdev";
          const activity = actionData.activity || "Desarrollo en curso";

          // Update MongoDB SiteConfig
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

          // Update local workstation status file if accessible
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

          // Remove raw action tag and append nice feedback badge
          reply = reply.replace(/\[ACTION:UPDATE_STATUS:\{.*?\}\]/, "").trim() +
            `\n\n✅ **Telemetría de trabajo actualizada:** Proyecto: **${project}** | Tarea: **${activity}**. Ya está visible en vivo en el footer y en [/roadmap](/roadmap).`;
        }
      } catch (actionErr) {
        console.warn("Error executing Co-Pilot action:", actionErr);
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
