import mongoose, { Schema, Document, models } from "mongoose";

export interface IPageView extends Document {
  path: string;
  referrer: string;
  userAgent: string;
  ipHash: string;
  timestamp: Date;
}

const PageViewSchema: Schema = new Schema({
  path: { type: String, required: true, default: "/" },
  referrer: { type: String, default: "direct" },
  userAgent: { type: String, default: "unknown" },
  ipHash: { type: String, default: "anonymous" },
  timestamp: { type: Date, default: Date.now }
});

export default models.PageView || mongoose.model<IPageView>("PageView", PageViewSchema);
