import { NextResponse } from 'next/server';
import { sendEmail, SendEmailParams } from '../../../../lib/emailService';
import { EmailTemplate } from '../../../../models/EmailTemplate';
import { connectMongo } from '../../../../utils/mongo'; // assume existing helper

/**
 * POST /api/email/send
 * Body: { templateSlug: string, to: string|string[], data?: Record<string,any>, accountId?: string }
 * Finds the template, interpolates placeholders with `data` (simple {{key}} replace),
 * then calls Resend via emailService.
 */
export async function POST(request: Request) {
  await connectMongo();
  const { templateSlug, to, data = {}, accountId } = await request.json();
  const tmpl = await EmailTemplate.findOne({ slug: templateSlug }).lean();
  if (!tmpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  // Simple interpolation – replace {{key}} with data[key]
  const interpolate = (src: string) =>
    src.replace(/{{\s*(\w+)\s*}}/g, (_, k) => (data[k] ?? ''));

  const subject = interpolate(tmpl.subject);
  const html = interpolate(tmpl.html);
  const plainText = tmpl.plainText ? interpolate(tmpl.plainText) : undefined;

  const params: SendEmailParams = { to, subject, html, plainText, accountId };
  try {
    const result = await sendEmail(params);
    return NextResponse.json({ sent: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
