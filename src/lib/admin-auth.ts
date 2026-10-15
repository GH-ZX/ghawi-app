/**
 * Admin authentication.
 *
 * Passwords are stored as PBKDF2-SHA256 (210k iterations) and verified with
 * Web Crypto so the same code runs in `next dev` and on workerd.
 * Sessions are stateless HMAC-signed tokens in an HttpOnly cookie — no server
 * session store to keep alive or invalidate on restart.
 */

export const ADMIN_COOKIE = "ghawi_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/* ------------------------------------------------------------------ *
 *  Base64 / bytes (must work identically in Node and workerd)
 * ------------------------------------------------------------------ */

function toBase64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(value, "base64"));
}

/** URL-safe base64 — survives being placed in a cookie value. */
function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return new TextDecoder().decode(fromBase64(padded));
}

const encoder = new TextEncoder();

/* ------------------------------------------------------------------ *
 *  Passwords
 * ------------------------------------------------------------------ */

interface StoredHash {
  iterations: number;
  salt: Uint8Array;
  hash: Uint8Array;
}

export function parseStoredHash(encoded: string): StoredHash | null {
  const [scheme, iterationText, saltText, hashText] = encoded.trim().split("$");
  if (scheme !== "pbkdf2" || !iterationText || !saltText || !hashText) return null;

  const iterations = Number(iterationText);
  if (!Number.isFinite(iterations) || iterations < 1) return null;

  try {
    return {
      iterations,
      salt: fromBase64(saltText),
      hash: fromBase64(hashText),
    };
  } catch {
    return null;
  }
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );

  return new Uint8Array(bits);
}

/** Constant-time comparison so a wrong prefix cannot be probed. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= (a[i] as number) ^ (b[i] as number);
  return diff === 0;
}

/**
 * Cloudflare Workers' Web Crypto rejects PBKDF2 above 100,000 iterations, so
 * that is the ceiling. The stored hash records its own iteration count, which
 * means raising this later does not invalidate existing credentials.
 */
export async function verifyPassword(
  password: string,
  storedHash: string | undefined,
): Promise<boolean> {
  if (!storedHash) return false;
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return false;

  try {
    const candidate = await derive(password, parsed.salt, parsed.iterations);
    return timingSafeEqual(candidate, parsed.hash);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 *  Sessions
 * ------------------------------------------------------------------ */

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
}

/** `base64url(payload).base64url(signature)` — tamper-evident, no storage needed. */
export async function createSessionToken(secret: string, username: string): Promise<string> {
  const payload = `${username}.${Date.now() + SESSION_TTL_SECONDS * 1000}`;
  const encodedPayload = toBase64Url(encoder.encode(payload));
  const signature = toBase64Url(await hmac(secret, encodedPayload));
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  secret: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = toBase64Url(await hmac(secret, payload));
  if (!timingSafeEqual(encoder.encode(signature), encoder.encode(expected))) return false;

  const [username, expiresAt] = fromBase64Url(payload).split(".");
  if (!username || !expiresAt) return false;
  return Number(expiresAt) > Date.now();
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};