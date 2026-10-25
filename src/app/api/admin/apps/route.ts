import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AppProject from "@/models/AppProject";
import { defaultApps } from "@/data/defaultApps";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await connectToDatabase();

    if (id) {
      const app = await AppProject.findById(id);
      return NextResponse.json({ success: true, data: app });
    }

    let apps = await AppProject.find().sort({ order: 1, createdAt: -1 });

    // Auto-seed si la colección está vacía
    if (!apps || apps.length === 0) {
      try {
        await AppProject.insertMany(defaultApps);
        apps = await AppProject.find().sort({ order: 1, createdAt: -1 });
      } catch (seedErr) {
        console.error("Error al sembrar apps por defecto:", seedErr);
      }
    }

    return NextResponse.json({ success: true, data: apps });
  } catch (error: any) {
    console.error("Admin Apps GET Error:", error);
    return NextResponse.json(
      { error: "Error al obtener aplicaciones", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    if (!body.title) {
      return NextResponse.json(
        { error: "El título de la app es obligatorio" },
        { status: 400 }
      );
    }

    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const existing = await AppProject.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe una app con el slug: ${body.slug}` },
        { status: 400 }
      );
    }

    const newApp = await AppProject.create(body);
    return NextResponse.json({ success: true, data: newApp }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Apps POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la app" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "El ID de la app es obligatorio" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    updateData.updatedAt = new Date();

    const updatedApp = await AppProject.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!updatedApp) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedApp });
  } catch (error: any) {
    console.error("Admin Apps PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la app" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la app es obligatorio" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await AppProject.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Aplicación eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Admin Apps DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la app" },
      { status: 500 }
    );
  }
}
