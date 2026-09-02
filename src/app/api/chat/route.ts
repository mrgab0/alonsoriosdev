import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import SiteConfig from "@/models/SiteConfig";

// Smart human-like knowledge base response generator for Alonso Ríos
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId = "session_default" } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const { reply, suggestWhatsapp } = generateHumanLikeResponse(message);

    // Get config for webhooks
    let config = null;
    try {
      await connectToDatabase();
      config = await SiteConfig.findOne({ key: "main_config" });

      // Save chat log to MongoDB for admin viewing
      await ChatMessage.create({ sessionId, sender: "user", text: message });
      await ChatMessage.create({ sessionId, sender: "bot", text: reply, escalatedToWhatsapp: suggestWhatsapp });
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

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const history = await ChatMessage.find().sort({ timestamp: -1 }).limit(50);
    return NextResponse.json({ success: true, data: history });
  } catch {
    return NextResponse.json({
      success: true,
      data: [
        { sessionId: "s1", sender: "user", text: "Hola, ¿cuánto cuesta una página web?", timestamp: new Date() },
        { sessionId: "s1", sender: "bot", text: "Hola! Un sitio corporativo básico parte en $190 USD...", timestamp: new Date() },
      ],
    });
  }
}
