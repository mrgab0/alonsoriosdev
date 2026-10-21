import { NextResponse } from 'next/server';
import connectMongo from '../../../../utils/mongo';
import EmailTemplate from '../../../../models/EmailTemplate';

/**
 * CRUD API for EmailTemplate.
 *   GET    -> list all templates
 *   POST   -> create new template (requires slug, name, subject, html, account)
 *   PUT    -> update existing template by slug
 *   DELETE -> delete template by slug
 */
export async function GET() {
  await connectMongo();
  const templates = await EmailTemplate.find({}).lean();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  await connectMongo();
  const { slug, name, subject, html, plainText, account } = await request.json();
  if (!slug || !name || !subject || !html || !account) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const existing = await EmailTemplate.findOne({ slug }).lean();
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
  }
  const tmpl = new EmailTemplate({ slug, name, subject, html, plainText, account });
  await tmpl.save();
  return NextResponse.json({ created: true, tmpl }, { status: 201 });
}

export async function PUT(request: Request) {
  await connectMongo();
  const { slug, updates } = await request.json();
  if (!slug || !updates) {
    return NextResponse.json({ error: 'slug and updates required' }, { status: 400 });
  }
  const tmpl = await EmailTemplate.findOneAndUpdate({ slug }, updates, { new: true }).lean();
  if (!tmpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json({ updated: true, tmpl });
}

export async function DELETE(request: Request) {
  await connectMongo();
  const { slug } = await request.json();
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const result = await EmailTemplate.deleteOne({ slug });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
