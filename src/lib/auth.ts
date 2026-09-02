const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || "alonsorios_dev_secure_session_key_2026";
export const AUTH_COOKIE_NAME = "admin_session";

/**
 * Firma un timestamp usando Web Crypto API (100% compatible con Edge Runtime y Node.js).
 */
async function computeSignature(timestamp: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const msgData = encoder.encode(timestamp);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const signature = await computeSignature(timestamp);
  return `${timestamp}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const tokenAgeMs = Date.now() - parseInt(timestamp, 10);
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 días

  if (isNaN(tokenAgeMs) || tokenAgeMs < 0 || tokenAgeMs > maxAgeMs) {
    return false;
  }

  try {
    const expectedSignature = await computeSignature(timestamp);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
