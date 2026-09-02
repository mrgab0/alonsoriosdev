import mongoose, { Schema, Document, models } from "mongoose";

export interface IReview extends Document {
  authorName: string;
  authorRole: string; // ej: "Dueño de Negocio", "Estudiante de Curso"
  serviceType: string;
  rating: number; // 1 to 5
  comment: string;
  approved: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  authorName: { type: String, required: true, trim: true },
  authorRole: { type: String, required: true, default: "Cliente Satisfecho" },
  serviceType: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  comment: { type: String, required: true },
  approved: { type: Boolean, default: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default models.Review || mongoose.model<IReview>("Review", ReviewSchema);
