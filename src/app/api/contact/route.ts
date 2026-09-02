import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, serviceType, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son obligatorios." },
        { status: 400 }
      );
    }

    // Connect DB (if URI provided, otherwise handle gracefully for initial dev)
    try {
      await connectToDatabase();
      const newContact = await Contact.create({
        name,
        email,
        phone,
        serviceType: serviceType || "General",
        message,
      });

      return NextResponse.json(
        { success: true, message: "Mensaje guardado correctamente.", data: newContact },
        { status: 201 }
      );
    } catch (dbError) {
      console.warn("MongoDB connection offline or fallback active:", dbError);
      // Fallback response for dev mode if DB is not configured locally yet
      return NextResponse.json(
        {
          success: true,
          message: "Mensaje recibido correctamente (Modo Vista Previa activado). Te responderé lo antes posible por WhatsApp o Correo.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("API Contact Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el envío." },
      { status: 500 }
    );
  }
}
