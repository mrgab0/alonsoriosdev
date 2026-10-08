import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    // Obtener contactos ordenados del más reciente al más antiguo
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching contacts data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedContact });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { success: false, error: "Error updating contact" },
      { status: 500 }
    );
  }
}
