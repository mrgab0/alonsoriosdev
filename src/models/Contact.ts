import mongoose, { Schema, Document, models } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  message: string;
  status: "new" | "contacted" | "completed";
  createdAt: Date;
}

const ContactSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  serviceType: { type: String, required: true, default: "General" },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "contacted", "completed"], default: "new" },
  createdAt: { type: Date, default: Date.now }
});

export default models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
