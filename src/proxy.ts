import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Security Headers Response base
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Excepciones públicas dentro del área de administración
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return response;
  }

  // Check para Rutas de UI del Panel de Administración (/admin/...)
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!verifySessionToken(sessionCookie)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check para Rutas de API de Administración (/api/admin/...)
  if (pathname.startsWith("/api/admin")) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!verifySessionToken(sessionCookie)) {
      return NextResponse.json(
        { success: false, message: "No autorizado. Inicia sesión como administrador." },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
