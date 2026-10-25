import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AppProject from "@/models/AppProject";
import { defaultApps } from "@/data/defaultApps";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    await connectToDatabase();

    if (slug) {
      const app = await AppProject.findOne({ slug, published: true }).lean();
      if (app) {
        return NextResponse.json({ success: true, data: app });
      }
      // Fallback a defaultApps si aún no está en MongoDB
      const defaultApp = defaultApps.find((a) => a.slug === slug);
      if (defaultApp) {
        return NextResponse.json({ success: true, data: defaultApp });
      }
      return NextResponse.json({ error: "App no encontrada" }, { status: 404 });
    }

    const apps = await AppProject.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (!apps || apps.length === 0) {
      return NextResponse.json({ success: true, data: defaultApps });
    }

    return NextResponse.json({ success: true, data: apps });
  } catch (error) {
    console.error("Error al obtener apps públicas:", error);
    // Graceful fallback to static data
    return NextResponse.json({ success: true, data: defaultApps });
  }
}
