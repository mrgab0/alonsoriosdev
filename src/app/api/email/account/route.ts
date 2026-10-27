import { NextResponse } from 'next/server';
import connectMongo from '../../../../utils/mongo';
import EmailAccount from '../../../../models/EmailAccount';

/**
 * CRUD API for EmailAccount.
 *   GET    -> list all accounts
 *   POST   -> create new account (requires name and email, optional resendApiKey)
 *   PUT    -> update existing account by email
 *   DELETE -> delete account by email
 */
export async function GET() {
  await connectMongo();
  const accounts = await EmailAccount.find({}).lean();
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  await connectMongo();
  const { name, email, resendApiKey } = await request.json();
  if (!name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const existing = await EmailAccount.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: 'Email account already exists' }, { status: 409 });
  }
  const account = new EmailAccount({ name, email, resendApiKey });
  await account.save();
  return NextResponse.json({ created: true, account }, { status: 201 });
}

export async function PUT(request: Request) {
  await connectMongo();
  const { email, updates } = await request.json();
  if (!email || !updates) {
    return NextResponse.json({ error: 'email and updates required' }, { status: 400 });
  }
  const account = await EmailAccount.findOneAndUpdate({ email }, updates, { new: true }).lean();
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  return NextResponse.json({ updated: true, account });
}

export async function DELETE(request: Request) {
  await connectMongo();
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const result = await EmailAccount.deleteOne({ email });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
