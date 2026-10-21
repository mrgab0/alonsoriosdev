import { NextResponse } from 'next/server';
import { LeadCapture } from '../../../../models/LeadCapture';
import { EmailTemplate } from '../../../../models/EmailTemplate';
import { sendEmail } from '../../../../lib/emailService';
import { connectMongo } from '../../../../utils/mongo';

/**
 * POST /api/email/subscribe
 * Body: { email: string, source?: string }
 * Stores lead, sends welcome email using a template named 'welcome'.
 */
export async function POST(request: Request) {
  await connectMongo();
  const { email, source = 'floating-widget' } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Upsert lead (ignore duplicate errors)
  await LeadCapture.updateOne({ email }, { email, source, createdAt: new Date() }, { upsert: true });

  // Find welcome template
  const tmpl = await EmailTemplate.findOne({ slug: 'welcome' }).lean();
  if (!tmpl) return NextResponse.json({ warning: 'Welcome template missing' }, { status: 200 });

  const interpolate = (src: string) => src.replace(/{{\s*email\s*}}/g, email);
  const subject = interpolate(tmpl.subject);
  const html = interpolate(tmpl.html);
  const plainText = tmpl.plainText ? interpolate(tmpl.plainText) : undefined;

  try {
    await sendEmail({ to: email, subject, html, plainText });
    return NextResponse.json({ sent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
