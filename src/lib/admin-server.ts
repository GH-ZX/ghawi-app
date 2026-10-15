import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  ADMIN_COOKIE,
  createSessionToken,
  parseStoredHash,
  sessionCookieOptions,
  verifyPassword,
  verifySessionToken,
} from "@/lib/admin-auth";

/**
 * Resolves the Worker environment, or null when running outside the adapter
 * (`next dev`, a test runner). Every caller degrades rather than throwing.
 */
export async function getEnv(): Promise<Record<string, unknown> | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export type AdminEnv = {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
  CONTACT_DB?: D1Database;
};

/** True only when a valid, unexpired, correctly-signed session cookie exists. */
export async function isAuthenticated(
  cookieValue: string | undefined,
  env: AdminEnv,
): Promise<boolean> {
  if (!env.ADMIN_SESSION_SECRET) return false;
  return verifySessionToken(env.ADMIN_SESSION_SECRET, cookieValue);
}

export {
  ADMIN_COOKIE,
  createSessionToken,
  parseStoredHash,
  sessionCookieOptions,
  verifyPassword,
};