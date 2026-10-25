import mongoose, { Schema, Document } from "mongoose";

export interface IAppPermission {
  name: string;
  description: string;
}

export interface IAppProject extends Document {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  content: string;
  icon?: string;
  version: string;
  platform: string;
  category: string;
  status: "upcoming" | "beta" | "published";
  githubUrl?: string;
  playStoreUrl?: string;
  downloadUrl?: string;
  privacyPolicyUrl?: string;
  permissions: IAppPermission[];
  features: string[];
  techStack: string[];
  featured?: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppPermissionSchema = new Schema<IAppPermission>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const AppProjectSchema = new Schema<IAppProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, default: "" },
    icon: { type: String, default: "" },
    version: { type: String, default: "1.0.0" },
    platform: { type: String, default: "Android" },
    category: { type: String, default: "Herramientas & Utilidades" },
    status: {
      type: String,
      enum: ["upcoming", "beta", "published"],
      default: "upcoming",
    },
    githubUrl: { type: String, default: "" },
    playStoreUrl: { type: String, default: "" },
    downloadUrl: { type: String, default: "" },
    privacyPolicyUrl: { type: String, default: "/privacy-remote-keyboard.html" },
    permissions: [AppPermissionSchema],
    features: [{ type: String }],
    techStack: [{ type: String }],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AppProject ||
  mongoose.model<IAppProject>("AppProject", AppProjectSchema);
