import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

const INITIAL_REVIEWS = [
  {
    authorName: "Carlos Méndez",
    authorRole: "Propietario de Negocio Local",
    serviceType: "Recuperación de Sitio Web",
    rating: 5,
    comment: "Mi página web dejó de funcionar por un virus y no sabía qué hacer. Alonso la recuperó en menos de 24 horas y me explicó todo con una paciencia increíble. ¡Totalmente recomendado!",
    approved: true,
  },
  {
    authorName: "Dra. Elena Ramos",
    authorRole: "Consultorio Médico",
    serviceType: "Diseño Web + SEO",
    rating: 5,
    comment: "Quería una página sencilla pero elegante para mis pacientes. Alonso se encargó de todo, la página carga al instante y ahora aparecemos en los primeros lugares de Google en nuestra ciudad.",
    approved: true,
  },
  {
    authorName: "Roberto Silva",
    authorRole: "Estudiante de Programación",
    serviceType: "Libro & Curso de Desarrollo",
    rating: 5,
    comment: "Había intentado aprender a programar con muchos tutoriales confusos. Los libros de Alonso explican todo sin rodeos técnicos ni palabras raras. Por fin pude crear mi primera app Android.",
    approved: true,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const dbReviews = await Review.find({ approved: true }).sort({ createdAt: -1 });

    if (dbReviews.length > 0) {
      return NextResponse.json({ success: true, data: dbReviews });
    }
  } catch (error) {
    console.warn("MongoDB fallback active for reviews:", error);
  }

  return NextResponse.json({ success: true, data: INITIAL_REVIEWS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authorName, authorRole, serviceType, rating, comment } = body;

    if (!authorName || !rating || !comment) {
      return NextResponse.json(
        { error: "Nombre, valoración y comentario son obligatorios." },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      const newReview = await Review.create({
        authorName,
        authorRole: authorRole || "Cliente",
        serviceType: serviceType || "Servicios Web",
        rating: Number(rating),
        comment,
        approved: true,
      });

      return NextResponse.json(
        { success: true, message: "¡Gracias por tu opinión!", data: newReview },
        { status: 201 }
      );
    } catch {
      return NextResponse.json(
        { success: true, message: "Opinión recibida con éxito (Modo Vista Previa)." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error submit review:", error);
    return NextResponse.json({ error: "Error al enviar la reseña." }, { status: 500 });
  }
}
