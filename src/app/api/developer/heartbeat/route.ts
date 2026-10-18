import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SiteConfig from "@/models/SiteConfig";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project,
      cleanRepoName,
      activity,
      branch = "main",
      url,
      isManualOverride = true,
    } = body;

    if (!activity) {
      return NextResponse.json(
        { error: "El campo 'activity' es obligatorio." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const config = await SiteConfig.findOne({ key: "main_config" });
    if (!config) {
      return NextResponse.json(
        { error: "Configuración del sitio no encontrada." },
        { status: 404 }
      );
    }

    if (!config.sections) {
      config.sections = {} as any;
    }

    config.sections.developerStatus = {
      isManualOverride: Boolean(isManualOverride),
      project: project || "alonsorios.dev",
      cleanRepoName: cleanRepoName || project || "alonsorios.dev",
      activity,
      branch,
      url: url || `https://github.com/mrgab0/${cleanRepoName || "alonsoriosdev"}`,
      updatedAt: new Date(),
    };

    config.updatedAt = new Date();
    await config.save();

    return NextResponse.json({
      success: true,
      message: "Estado de desarrollo actualizado con éxito.",
      developerStatus: config.sections.developerStatus,
    });
  } catch (error) {
    console.error("Error updating developer heartbeat:", error);
    return NextResponse.json(
      { error: "Error al actualizar la telemetría de desarrollo." },
      { status: 500 }
    );
  }
}
