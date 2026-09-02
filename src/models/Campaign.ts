import mongoose, { Schema, Document, models } from "mongoose";

export interface ICampaign extends Document {
  subject: string;
  content: string;
  recipientCount: number;
  status: "draft" | "sent" | "failed";
  sentAt?: Date;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  recipientCount: { type: Number, default: 0 },
  status: { type: String, enum: ["draft", "sent", "failed"], default: "draft" },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
