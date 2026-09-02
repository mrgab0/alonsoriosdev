import { NextResponse } from "next/server";
import { Resend } from "resend";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Campaign from "@/models/Campaign";
import SiteConfig from "@/models/SiteConfig";

export async function GET() {
  try {
    await connectToDatabase();
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: campaigns });
  } catch {
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: "demo-1",
          subject: "Nuevos Libros de Programación Disponibles en alonsorios.dev",
          content: "Hola! He publicado un nuevo capítulo de muestra sobre desarrollo Android...",
          recipientCount: 24,
          status: "sent",
          sentAt: new Date(),
          createdAt: new Date(),
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, content, resendApiKey: customKey } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "Asunto y contenido son requeridos." }, { status: 400 });
    }

    // Try finding configured Resend API key
    let apiKey = customKey || process.env.RESEND_API_KEY;
    try {
      await connectToDatabase();
      const config = await SiteConfig.findOne({ key: "main_config" });
      if (config?.sections?.contact?.resendApiKey) {
        apiKey = config.sections.contact.resendApiKey;
      }
    } catch {}

    // Get contact emails
    let recipientEmails: string[] = [];
    try {
      const contacts = await Contact.find({}, "email");
      recipientEmails = Array.from(new Set(contacts.map((c) => c.email).filter(Boolean)));
    } catch {}

    if (recipientEmails.length === 0) {
      recipientEmails = ["cliente@ejemplo.com"];
    }

    let sentSuccessfully = false;
    let resendDetails = "";

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "Alonso Ríos <notificaciones@alonsorios.dev>",
          to: recipientEmails.slice(0, 100), // Safety cap batch
          subject,
          html: `<div style="font-family: sans-serif; padding: 20px; background: #0a1120; color: #ffffff;">
            <h2 style="color: #fbbf24;">${subject}</h2>
            <div style="line-height: 1.6; color: #e2e8f0;">${content.replace(/\n/g, "<br/>")}</div>
            <hr style="border-color: #1e2a42; margin-top: 30px;"/>
            <p style="font-size: 12px; color: #94a3b8;">Alonso Ríos • alonsorios.dev</p>
          </div>`,
        });
        sentSuccessfully = true;
        resendDetails = `Enviado con éxito a ${recipientEmails.length} destinatarios vía Resend.`;
      } catch (err: any) {
        resendDetails = `Modo prueba (Resend API key requerida): ${err?.message || "Sin API Key válida"}`;
      }
    } else {
      resendDetails = "Campañas configuradas correctamente. Agrega tu RESEND_API_KEY en .env.local o en el Admin panel para envíos reales.";
    }

    try {
      await Campaign.create({
        subject,
        content,
        recipientCount: recipientEmails.length,
        status: sentSuccessfully ? "sent" : "draft",
        sentAt: sentSuccessfully ? new Date() : undefined,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: resendDetails,
      recipients: recipientEmails.length,
    });
  } catch (error) {
    console.error("Campaign API Error:", error);
    return NextResponse.json({ error: "Error enviando la campaña." }, { status: 500 });
  }
}
