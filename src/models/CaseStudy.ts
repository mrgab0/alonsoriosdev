import mongoose, { Schema, Document, models } from "mongoose";

export interface ICaseStudy extends Document {
  title: string;
  clientName: string;
  category: "Web" | "Android" | "SEO" | "Recuperación";
  problemDescription: string;
  solutionDescription: string;
  metrics: { label: string; value: string }[];
  beforeAfterImage?: { before: string; after: string };
  testimonialQuote?: string;
  featured: boolean;
  createdAt: Date;
}

const CaseStudySchema: Schema = new Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  category: { type: String, required: true },
  problemDescription: { type: String, required: true },
  solutionDescription: { type: String, required: true },
  metrics: [{ label: String, value: String }],
  beforeAfterImage: { before: String, after: String },
  testimonialQuote: { type: String },
  featured: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default models.CaseStudy || mongoose.model<ICaseStudy>("CaseStudy", CaseStudySchema);
