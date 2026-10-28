import { NextResponse } from 'next/server';
import { LeadCapture } from '@/models/LeadCapture';
import { EmailTemplate } from '@/models/EmailTemplate';
import { sendEmail } from '@/lib/emailService';
import { connectMongo } from '@/utils/mongo';

/**
 * POST /api/email/subscribe
 * Body: { email: string, source?: string }
 * Stores lead and returns coupon ALONSO10. Dispatches welcome email if template exists.
 */
export async function POST(request: Request) {
  try {
    await connectMongo();
    const { email, source = 'floating-widget' } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido' }, { status: 400 });
    }

    // Upsert lead in database
    await LeadCapture.updateOne(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim(), source, createdAt: new Date() },
      { upsert: true }
    );

    // Try to send email if welcome template exists
    let sent = false;
    try {
      const tmpl = await EmailTemplate.findOne({ slug: 'welcome' }).lean();
      if (tmpl) {
        const interpolate = (src: string) => src.replace(/{{\s*email\s*}}/g, email);
        const subject = interpolate(tmpl.subject);
        const html = interpolate(tmpl.html);
        const plainText = tmpl.plainText ? interpolate(tmpl.plainText) : undefined;
        await sendEmail({ to: email, subject, html, plainText });
        sent = true;
      }
    } catch (mailErr) {
      console.warn('No se pudo despachar email de bienvenida (Resend pendiente):', mailErr);
    }

    return NextResponse.json({
      success: true,
      saved: true,
      sent,
      coupon: 'ALONSO10',
      discount: '10%',
      message: '¡Cupón activado con éxito! Tienes 10% de descuento en tu proyecto.',
    });
  } catch (error: any) {
    console.error('Error en /api/email/subscribe:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
