import { Schema, model, Document } from 'mongoose';

/**
 * EmailTemplate stores reusable email content.
 * `slug` is a unique identifier used when sending (e.g., "welcome",
 * "abandoned-1", "newsletter-monthly").
 * `subject` can contain mustache placeholders (e.g., {{name}}).
 * `html` and `plainText` hold the body; both can use the same placeholders.
 * `account` references the EmailAccount that will be used for sending.
 */
export interface IEmailTemplate extends Document {
  slug: string;
  name: string; // friendly display name
  subject: string;
  html: string;
  plainText?: string;
  account: string; // ObjectId reference to EmailAccount
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  plainText: { type: String },
  account: { type: Schema.Types.ObjectId, ref: 'EmailAccount', required: true },
});

export const EmailTemplate = model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
