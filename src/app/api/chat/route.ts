import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import SiteConfig from "@/models/SiteConfig";

// System Instructions for Gemini 1.5 Flash AI Agent
const SYSTEM_PROMPT = `
Eres el asistente virtual oficial de Alonso Ríos (alonsorios.dev).
Alonso Ríos es un desarrollador de software experto en:
1. Creación y Diseño de Páginas Web profesionales, rápidas y adaptadas a móviles.
2. Urgencias y Recuperación de Sitios Web caídos, infectados con virus/malware o con errores de servidor.
3. Desarrollo de Aplicaciones Móviles Android con publicación oficial en Google Play Store.
4. SEO Local y optimización para aparecer en los primeros lugares de Google.
5. Venta de Libros Digitales (PDF) y Cursos en Video HD paso a paso en español claro sin tecnicismos.

Datos Oficiales de Contacto:
- WhatsApp Directo: +58 412 991 2840 (https://wa.me/584129912840)
- Correo Electrónico: iirockalonso@gmail.com

Instrucciones de Respuesta:
- Sé siempre amable, educado, claro y profesional.
- Responde de forma concisa y amigable (máximo 3 párrafos cortos).
- Si el usuario consulta sobre precios, menciona que las webs parten en $190 USD, las urgencias entre $80 y $150 USD, y los libros desde $14.99 USD.
- Invita siempre al usuario a hablar directamente con Alonso por WhatsApp cuando requiera una cotización o atención personal.
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
        "¡Hola! 👋 Qué gusto saludarte. Soy el asistente virtual de Alonso Ríos. ¿En qué te puedo ayudar hoy? Desarrollamos páginas web, recuperamos sitios caídos o infectados, creamos apps Android y ofrecemos cursos/libros de programación.",
      suggestWhatsapp: false,
    };
  }

  if (text.includes("precio") || text.includes("cuanto cuesta") || text.includes("valor") || text.includes("cotiz")) {
    return {
      reply:
        "Los valores dependen de lo que necesites: un sitio web corporativo sencillo comienza desde los $190 USD, una recuperación de urgencia por hackeo suele tardar 24h y rondar entre $80 y $150 USD, y los libros/cursos están desde $14.99 USD. ¿Te gustaría que Alonso te cotice tu caso exacto por WhatsApp?",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("recupera") || text.includes("caida") || text.includes("hackea") || text.includes("virus") || text.includes("error")) {
    return {
      reply:
        "🚑 Si tu sitio web se cayó o fue infectado, estás en el lugar correcto. Alonso realiza desinfección profunda, limpia el código malicioso, restaura copias de seguridad y solicita el desbloqueo urgente en Google en menos de 24-48 horas. ¿Cuál es la dirección de tu página afectada?",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("app") || text.includes("android") || text.includes("celular") || text.includes("movil")) {
    return {
      reply:
        "📱 Creamos aplicaciones nativas para Android ultraligeras y fáciles de usar, ideales para que tus clientes o usuarios agenden citas, hagan pedidos o accedan a tus servicios. Incluye la publicación oficial en la tienda Google Play Store.",
      suggestWhatsapp: true,
    };
  }

  if (text.includes("libro") || text.includes("curso") || text.includes("aprender") || text.includes("estudiar")) {
    return {
      reply:
        "📚 ¡Excelente! Alonso ha escrito libros y cursos en video explicados paso a paso sin tecnicismos innecesarios. En la sección 'Cursos y Libros' puedes leer capítulos de muestra totalmente gratis o descargarlos en PDF.",
      suggestWhatsapp: false,
    };
  }

  if (text.includes("humano") || text.includes("alonso") || text.includes("persona") || text.includes("whatsapp")) {
    return {
      reply:
        "¡Por supuesto! Si prefieres hablar directamente con Alonso Ríos de persona a persona, puedes presionar el botón de WhatsApp a continuación para enviarle un mensaje directo.",
      suggestWhatsapp: true,
    };
  }

  return {
    reply:
      "Entiendo tu consulta. Alonso estará encantado de ayudarte a resolver esto sin complicaciones. ¿Quieres que te conecte con él por WhatsApp o prefieres dejar tu correo para que te contacte?",
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
      { sessionId: "s1", sender: "user", text: "Hola, ¿cuánto cuesta una página web?", timestamp: new Date() },
      { sessionId: "s1", sender: "bot", text: "Hola! Un sitio corporativo básico parte en $190 USD...", timestamp: new Date() },
    ],
  });
}
