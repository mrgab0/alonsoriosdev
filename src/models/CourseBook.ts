import mongoose, { Schema, Document, models } from "mongoose";

export interface ICourseBook extends Document {
  title: string;
  type: "book" | "course";
  subtitle: string;
  description: string;
  price: string;
  features: string[];
  coverUrl?: string;
  previewSampleUrl?: string;
  purchaseUrl?: string;
  badge?: string;
  createdAt: Date;
}

const CourseBookSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["book", "course"], required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  features: [{ type: String }],
  coverUrl: { type: String },
  previewSampleUrl: { type: String },
  purchaseUrl: { type: String },
  badge: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default models.CourseBook || mongoose.model<ICourseBook>("CourseBook", CourseBookSchema);
