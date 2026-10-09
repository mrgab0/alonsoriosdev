import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import DynamicQR from "@/models/DynamicQR";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.redirect(new URL("/herramientas/creador-qr-dinamico", request.url));
    }

    await connectToDatabase();
    const qr = await DynamicQR.findOne({ code: code.toLowerCase(), active: true });

    if (!qr) {
      return NextResponse.redirect(
        new URL(`/herramientas/creador-qr-dinamico?error=not-found&code=${encodeURIComponent(code)}`, request.url)
      );
    }

    // Incrementar contador de escaneos de forma atómica
    await DynamicQR.findByIdAndUpdate(qr._id, {
      $inc: { scans: 1 },
      $set: { lastScannedAt: new Date() },
    });

    // Asegurar protocolo https:// si falta
    let destination = qr.targetUrl.trim();
    if (!destination.startsWith("http://") && !destination.startsWith("https://") && !destination.startsWith("whatsapp://") && !destination.startsWith("mailto:")) {
      destination = `https://${destination}`;
    }

    // Redirección 307 temporal para evitar que el navegador la cachee y así contar cada escaneo
    const response = NextResponse.redirect(destination, 307);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Error en redirección de QR dinámico:", error);
    return NextResponse.redirect(new URL("/herramientas/creador-qr-dinamico", request.url));
  }
}
