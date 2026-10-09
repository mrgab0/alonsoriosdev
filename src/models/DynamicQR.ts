import mongoose, { Schema, Document } from "mongoose";

export interface IDynamicQR extends Document {
  code: string;
  targetUrl: string;
  title: string;
  type: string;
  editToken: string;
  creatorEmail?: string;
  scans: number;
  active: boolean;
  fgColor: string;
  bgColor: string;
  lastScannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicQRSchema = new Schema<IDynamicQR>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "Mi Código QR",
      trim: true,
    },
    type: {
      type: String,
      default: "url",
      enum: ["url", "whatsapp", "wifi", "text", "custom"],
    },
    editToken: {
      type: String,
      required: true,
      index: true,
    },
    creatorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    scans: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    fgColor: {
      type: String,
      default: "#000000",
    },
    bgColor: {
      type: String,
      default: "#ffffff",
    },
    lastScannedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DynamicQR ||
  mongoose.model<IDynamicQR>("DynamicQR", DynamicQRSchema);
