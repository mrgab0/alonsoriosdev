import { Schema, model, Document } from 'mongoose';

/**
 * EmailAccount represents a sending identity (e.g., contacto@miempresa.com).
 * We store the display name, the actual email address and optionally a custom
 * Resend API key if the account uses a distinct sub‑account. If the key is not
 * provided, the global RESEND_API_KEY env variable is used.
 */
export interface IEmailAccount extends Document {
  name: string;
  email: string;
  resendApiKey?: string;
}

const EmailAccountSchema = new Schema<IEmailAccount>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resendApiKey: { type: String },
});

export const EmailAccount = model<IEmailAccount>('EmailAccount', EmailAccountSchema);
