import mongoose, { Schema, model, Document, models } from 'mongoose';

/**
 * LeadCapture stores emails collected via the floating widget or other
 * lead‑capture forms. It records the source (e.g., 'floating-widget') and a
 * timestamp so we can later segment the list.
 */
export interface ILeadCapture extends Document {
  email: string;
  source: string;
  createdAt: Date;
}

const LeadCaptureSchema = new Schema<ILeadCapture>({
  email: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LeadCapture =
  models.LeadCapture || model<ILeadCapture>('LeadCapture', LeadCaptureSchema);

export default LeadCapture;
