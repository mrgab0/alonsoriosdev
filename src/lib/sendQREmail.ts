import { Resend } from "resend";
import SiteConfig from "@/models/SiteConfig";

interface SendQREmailParams {
  email: string;
  code: string;
  editToken: string;
  shortUrl: string;
  targetUrl: string;
  title: string;
  host?: string;
}

/**
 * Envía un correo electrónico con el Token de Edición Secreto y los datos del código QR.
 * Es tolerante a fallos: si Resend no está configurado aún o la key es inválida,
 * captura el error silenciosamente y no interrumpe el flujo de la aplicación.
 */
export async function sendQREditTokenEmail({
  email,
  code,
  editToken,
  shortUrl,
  targetUrl,
  title,
  host = "alonsorios.dev",
}: SendQREmailParams): Promise<{ success: boolean; message?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Correo inválido" };
  }

  try {
    // 1. Obtener API key de variables de entorno o de la configuración del panel Admin
    let apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      try {
        const config = await SiteConfig.findOne().lean();
        if ((config as any)?.sections?.contact?.resendApiKey) {
          apiKey = (config as any).sections.contact.resendApiKey;
        }
      } catch (e) {
        // Ignorar si la base de datos no tiene la colección todavía
      }
    }

    if (!apiKey) {
      console.warn(
        "⚠️ [Resend] RESEND_API_KEY no encontrada. El correo para el QR no fue enviado, pero el código se creó con éxito."
      );
      return { success: false, message: "Resend no configurado" };
    }

    const protocol = host.includes("localhost") ? "http" : "https";
    const directManageUrl = `${protocol}://${host}/herramientas/creador-qr-dinamico?code=${encodeURIComponent(code)}&token=${encodeURIComponent(editToken)}`;

    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Alonso Ríos <onboarding@resend.dev>";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070d19; color: #ffffff; padding: 40px 20px; line-height: 1.6;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; rounded-radius: 9999px; border-radius: 20px; margin-bottom: 12px;">
              Código QR Dinámico Creado
            </div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; line-height: 1.2;">
              ${title || "Tu Código QR"}
            </h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">
              Aquí tienes tu clave secreta para cambiar el destino cuando quieras.
            </p>
          </div>

          <!-- Datos del QR -->
          <div style="background-color: #090f1d; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Enlace Corto (Impreso en el QR)</span>
              <a href="${shortUrl}" style="color: #38bdf8; font-family: monospace; font-size: 14px; font-weight: bold; text-decoration: none;" target="_blank">
                ${shortUrl}
              </a>
            </div>

            <div>
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Destino Actual</span>
              <span style="color: #cbd5e1; font-family: monospace; font-size: 13px; word-break: break-all;">
                ${targetUrl}
              </span>
            </div>
          </div>

          <!-- Token de Edición Secreto -->
          <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              🔑 Tu Token de Edición Secreto
            </span>
            <div style="font-family: monospace; font-size: 18px; font-weight: 900; color: #fbbf24; background-color: #090f1d; padding: 10px 16px; border-radius: 10px; display: inline-block; letter-spacing: 1px; border: 1px dashed rgba(245, 158, 11, 0.4);">
              ${editToken}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
              Guarda este token. Lo necesitarás si deseas cambiar la URL de destino de tu código QR en el futuro sin reimprimir.
            </p>
          </div>

          <!-- Botón de Acción Directo -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${directManageUrl}" style="background-color: #10b981; color: #000000; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
              Gestionar y Cambiar Destino en 1 Clic
            </a>
            <p style="color: #64748b; font-size: 11px; margin-top: 8px;">
              Este enlace abrirá tu panel con el token ya cargado.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px 0; font-weight: bold; color: #94a3b8;">
              Alonso Ríos — Desarrollo Web, Apps & Soluciones Tecnológicas
            </p>
            <p style="margin: 0;">
              ¿Tienes preguntas o necesitas un sistema a medida? Escríbeme directamente por <a href="https://wa.me/584129912840" style="color: #10b981; text-decoration: none; font-weight: bold;">WhatsApp</a>.
            </p>
          </div>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: fromAddress,
      to: email.trim(),
      subject: `🔑 Token de Edición de tu Código QR: ${title || code}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error("⚠️ Error enviando correo con Resend:", err.message);
    // No arrojamos excepción para no romper la creación del QR
    return { success: false, message: err.message };
  }
}
