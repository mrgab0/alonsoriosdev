import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  mediumUrl: { type: String },
  devtoUrl: { type: String },
  hashnodeUrl: { type: String },
  steemUrl: { type: String },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
