import mongoose, { Schema, Document, models } from "mongoose";

export interface IChatMessage extends Document {
  sessionId: string;
  sender: "user" | "bot" | "human";
  text: string;
  timestamp: Date;
  escalatedToWhatsapp?: boolean;
}

const ChatMessageSchema: Schema = new Schema({
  sessionId: { type: String, required: true, index: true },
  sender: { type: String, enum: ["user", "bot", "human"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  escalatedToWhatsapp: { type: Boolean, default: false }
});

export default models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
