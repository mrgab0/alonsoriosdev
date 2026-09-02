import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || "alonsorios_dev_secure_session_key_2026";
export const AUTH_COOKIE_NAME = "admin_session";

/**
 * Genera un token HMAC firmado para la sesión.
 */
export function generateSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", SECRET_KEY);
  hmac.update(timestamp);
  const signature = hmac.digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Verifica si un token de sesión es válido y no ha expirado.
 * Válido por 7 días.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const tokenAgeMs = Date.now() - parseInt(timestamp, 10);
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 días

  if (isNaN(tokenAgeMs) || tokenAgeMs < 0 || tokenAgeMs > maxAgeMs) {
    return false;
  }

  const hmac = createHmac("sha256", SECRET_KEY);
  hmac.update(timestamp);
  const expectedSignature = hmac.digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Valida la contraseña ingresada por el usuario.
 */
export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
