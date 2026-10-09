import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import DynamicQR from "@/models/DynamicQR";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generateShortCode(): string {
  // Generar código amigable de 6 caracteres (alfanumérico sin caracteres confusos como 0, O, 1, l)
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

function generateEditToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUrl, title, creatorEmail, type = "url", fgColor = "#000000", bgColor = "#ffffff" } = body;

    if (!targetUrl || typeof targetUrl !== "string" || targetUrl.trim().length === 0) {
      return NextResponse.json({ success: false, error: "La URL de destino es requerida" }, { status: 400 });
    }

    await connectToDatabase();

    // Generar código único que no colisione
    let code = generateShortCode();
    let attempts = 0;
    while (await DynamicQR.findOne({ code }) && attempts < 5) {
      code = generateShortCode();
      attempts++;
    }

    const editToken = generateEditToken();

    const newQR = await DynamicQR.create({
      code,
      targetUrl: targetUrl.trim(),
      title: title?.trim() || "Mi QR Dinámico",
      type,
      creatorEmail: creatorEmail?.trim() || undefined,
      editToken,
      scans: 0,
      active: true,
      fgColor,
      bgColor,
    });

    const host = request.headers.get("host") || "alonsorios.dev";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/qr/${code}`;

    return NextResponse.json({
      success: true,
      data: {
        code: newQR.code,
        shortUrl,
        editToken: newQR.editToken,
        title: newQR.title,
        targetUrl: newQR.targetUrl,
        scans: newQR.scans,
        fgColor: newQR.fgColor,
        bgColor: newQR.bgColor,
        createdAt: newQR.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error al crear QR dinámico:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al crear QR dinámico" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { code, editToken, targetUrl, title } = body;

    if (!code || !editToken) {
      return NextResponse.json({ success: false, error: "Código y token de edición requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const qr = await DynamicQR.findOne({ code: code.toLowerCase(), editToken });
    if (!qr) {
      return NextResponse.json({ success: false, error: "Código QR o token de edición inválido" }, { status: 404 });
    }

    if (targetUrl) {
      qr.targetUrl = targetUrl.trim();
    }
    if (title) {
      qr.title = title.trim();
    }

    await qr.save();

    const host = request.headers.get("host") || "alonsorios.dev";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/qr/${qr.code}`;

    return NextResponse.json({
      success: true,
      data: {
        code: qr.code,
        shortUrl,
        editToken: qr.editToken,
        title: qr.title,
        targetUrl: qr.targetUrl,
        scans: qr.scans,
        lastScannedAt: qr.lastScannedAt,
        updatedAt: qr.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error al actualizar QR dinámico:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al actualizar QR" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const editToken = searchParams.get("editToken");

    if (!code || !editToken) {
      return NextResponse.json({ success: false, error: "Código y token de edición requeridos" }, { status: 400 });
    }

    await connectToDatabase();

    const qr = await DynamicQR.findOne({ code: code.toLowerCase(), editToken });
    if (!qr) {
      return NextResponse.json({ success: false, error: "QR no encontrado o token inválido" }, { status: 404 });
    }

    const host = request.headers.get("host") || "alonsorios.dev";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/qr/${qr.code}`;

    return NextResponse.json({
      success: true,
      data: {
        code: qr.code,
        shortUrl,
        editToken: qr.editToken,
        title: qr.title,
        targetUrl: qr.targetUrl,
        scans: qr.scans,
        active: qr.active,
        lastScannedAt: qr.lastScannedAt,
        createdAt: qr.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error al obtener QR dinámico:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
