import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import { github, type Github } from "./github";

export type BotiEnv = AdminEnv & {
  /** Fine-grained token for BOTI_REPO: Contents RW, Actions RW, Secrets RW, Metadata R. */
  GITHUB_TOKEN?: string;
  /** "owner/name" of the Plus Store X repo. */
  BOTI_REPO?: string;
};

export const noStore = { "Cache-Control": "no-store" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** The signed-in admin's environment, or a ready error response. */
export async function botiGuard(): Promise<{ env: BotiEnv } | { response: NextResponse }> {
  const env = ((await getEnv()) ?? {}) as BotiEnv;
  if (!env.ADMIN_SESSION_SECRET) return { response: json({ error: "not_configured" }, 503) };
  const jar = await cookies();
  if (!(await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env))) return { response: json({ error: "unauthorized" }, 401) };
  return { env };
}

/** The GitHub client, or an error response when the token or repo isn't set. */
export function githubFor(env: BotiEnv): Github | NextResponse {
  if (!env.GITHUB_TOKEN || !env.BOTI_REPO) return json({ error: "github_not_configured" }, 503);
  return github(env.GITHUB_TOKEN, env.BOTI_REPO);
}

/** Appends to the activity log; never fails the request. */
export async function logEvent(env: BotiEnv, kind: string, client: string | null, data: unknown): Promise<void> {
  try {
    await env.CONTACT_DB?.prepare(`INSERT INTO boti_events (kind, client, data) VALUES (?1, ?2, ?3)`)
      .bind(kind, client, JSON.stringify(data ?? null))
      .run();
  } catch {
    // The log is a convenience.
  }
}

/** Error text safe to show (GitHub errors carry status + message, never the token). */
export function errorText(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 300) : "Unexpected error";
}

export const CLIENT_NAME = /^[a-z0-9][a-z0-9-]{1,30}$/;
