import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import SiteConfig from "@/models/SiteConfig";

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

// Gemini 1.5 Flash AI API Call (Free Tier: 1,500 requests/day)
async function getGeminiAiResponse(userMessage: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\nConsulta del usuario: ${userMessage}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch (err) {
    console.warn("Gemini API Fallback to rule engine:", err);
    return null;
  }
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
    const { message, sessionId = "session_default" } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    // Try Gemini AI first (if API key configured), fallback to knowledge base
    let reply = await getGeminiAiResponse(message);
    let suggestWhatsapp = true;

    if (!reply) {
      const fallbackResult = generateHumanLikeResponse(message);
      reply = fallbackResult.reply;
      suggestWhatsapp = fallbackResult.suggestWhatsapp;
    }

    // Get config for webhooks
    let config = null;
    try {
      if (process.env.MONGODB_URI) {
        await connectToDatabase();
        config = await SiteConfig.findOne({ key: "main_config" });

        // Save chat log to MongoDB for admin viewing
        await ChatMessage.create({ sessionId, sender: "user", text: message });
        await ChatMessage.create({ sessionId, sender: "bot", text: reply, escalatedToWhatsapp: suggestWhatsapp });
      }
    } catch {}

    // Send real-time notification to Telegram / Discord for mobile live viewing!
    sendLiveNotification(message, reply, config).catch(() => {});

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
