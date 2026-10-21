import { EmailTemplate } from '../models/EmailTemplate';
import { EmailAccount } from '../models/EmailAccount';

/**
 * Lightweight wrapper around Resend's REST API.
 * No external SDK is used – we rely on the built‑in fetch (available in
 * Next.js server‑side). All calls are async and return the JSON response
 * from Resend.
 */
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  plainText?: string;
  /**
   * Name of the EmailAccount to use for the `from` address. If omitted the
   * global RESEND_API_KEY will be used and the default verified sender
   * configured in the Resend dashboard.
   */
  accountId?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const { to, subject, html, plainText, accountId } = params;

  // Resolve the `from` address if a specific account is requested.
  let fromEmail: string | undefined;
  let apiKey = process.env.RESEND_API_KEY;
  if (accountId) {
    const account = await EmailAccount.findById(accountId).lean();
    if (!account) throw new Error('Email account not found');
    fromEmail = account.email;
    if (account.resendApiKey) apiKey = account.resendApiKey; // override per account
  }

  const payload: any = {
    from: fromEmail || undefined, // Resend will fallback to default if undefined
    to,
    subject,
    html,
  };
  if (plainText) payload.text = plainText;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Resend error: ${data.error || response.statusText}`);
  }
  return data; // contains {id, from, to, subject, ...}
}
