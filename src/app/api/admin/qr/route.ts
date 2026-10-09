import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import DynamicQR from "@/models/DynamicQR";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return await verifySessionToken(token);
}

export async function GET(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    await connectToDatabase();
    const qrs = await DynamicQR.find().sort({ createdAt: -1 });

    const totalScans = qrs.reduce((acc, curr) => acc + (curr.scans || 0), 0);
    const activeCount = qrs.filter((q) => q.active).length;

    return NextResponse.json({
      success: true,
      data: qrs,
      stats: {
        total: qrs.length,
        totalScans,
        activeCount,
      },
    });
  } catch (error: any) {
    console.error("Error en Admin QR GET:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { customCode, targetUrl, title, type = "url", fgColor = "#000000", bgColor = "#ffffff" } = body;

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: "targetUrl es requerida" }, { status: 400 });
    }

    await connectToDatabase();

    let code = (customCode || "").trim().toLowerCase();
    if (code) {
      // Validar slug
      code = code.replace(/[^a-z0-9_-]/g, "");
      const exists = await DynamicQR.findOne({ code });
      if (exists) {
        return NextResponse.json({ success: false, error: "El código personalizado ya está en uso" }, { status: 400 });
      }
    } else {
      code = crypto.randomBytes(4).toString("hex");
    }

    const editToken = crypto.randomBytes(12).toString("hex");

    const newQR = await DynamicQR.create({
      code,
      targetUrl: targetUrl.trim(),
      title: title?.trim() || "QR Admin",
      type,
      editToken,
      scans: 0,
      active: true,
      fgColor,
      bgColor,
    });

    return NextResponse.json({ success: true, data: newQR });
  } catch (error: any) {
    console.error("Error en Admin QR POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, targetUrl, title, active, fgColor, bgColor } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: any = {};
    if (targetUrl !== undefined) updateFields.targetUrl = targetUrl.trim();
    if (title !== undefined) updateFields.title = title.trim();
    if (active !== undefined) updateFields.active = active;
    if (fgColor !== undefined) updateFields.fgColor = fgColor;
    if (bgColor !== undefined) updateFields.bgColor = bgColor;

    const updated = await DynamicQR.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "QR no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error en Admin QR PUT:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    await connectToDatabase();
    await DynamicQR.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Código QR eliminado correctamente" });
  } catch (error: any) {
    console.error("Error en Admin QR DELETE:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
