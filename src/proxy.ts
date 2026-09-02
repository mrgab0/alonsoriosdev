import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas internas de Next.js, _not-found, _global-error, _next, assets o prerender
  if (pathname.startsWith("/_") || pathname.includes("not-found") || pathname.includes("error")) {
    return NextResponse.next();
  }

  // Si no es una ruta de administración, retornar inmediatamente
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Excepciones públicas dentro del área de administración
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { success: false, message: "No autorizado. Inicia sesión como administrador." },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isValid = await verifySessionToken(sessionCookie);

    if (!isValid) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { success: false, message: "No autorizado. Inicia sesión como administrador." },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  } catch {
    // Si ocurre un error al acceder a cookies durante el build estático, continuar
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
  ],
};
