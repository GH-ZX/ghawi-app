import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

type MessageRow = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  topic: string | null;
  message: string;
  locale: string | null;
  ip: string | null;
  user_agent: string | null;
  notified: number;
  archived: number;
};

async function guard() {
  const env = (await getEnv()) as AdminEnv;
  if (!env.ADMIN_SESSION_SECRET) return { error: "not_configured" as const };
  const jar = await cookies();
  const ok = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  if (!ok) return { error: "unauthorized" as const };
  return { env };
}

export async function GET(request: Request) {
  const auth = await guard();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "unauthorized" ? 401 : 503 });
  }

  const db = auth.env.CONTACT_DB;
  if (!db) return NextResponse.json({ messages: [], stats: { total: 0, unread: 0, undelivered: 0 } });

  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("archived") === "1";

  try {
    const rows = await db
      .prepare(
        `SELECT id, created_at, name, email, topic, message, locale, ip, user_agent, notified, archived
         FROM contact_messages
         WHERE (?1 = 1 OR archived = 0)
         ORDER BY id DESC
         LIMIT 200`,
      )
      .bind(includeArchived ? 1 : 0)
      .all<MessageRow>();

    const stats = await db
      .prepare(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN archived = 0 THEN 1 ELSE 0 END) AS unread,
           SUM(CASE WHEN notified = 0 THEN 1 ELSE 0 END) AS undelivered
         FROM contact_messages`,
      )
      .first<{ total: number; unread: number; undelivered: number }>();

    return NextResponse.json({
      messages: rows.results ?? [],
      stats: {
        total: stats?.total ?? 0,
        unread: stats?.unread ?? 0,
        undelivered: stats?.undelivered ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await guard();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "unauthorized" ? 401 : 503 });
  }

  const db = auth.env.CONTACT_DB;
  if (!db) return NextResponse.json({ error: "no_database" }, { status: 503 });

  let body: { id?: number; archived?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  try {
    await db
      .prepare(`UPDATE contact_messages SET archived = ?1 WHERE id = ?2`)
      .bind(body.archived ? 1 : 0, id)
      .run();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await guard();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "unauthorized" ? 401 : 503 });
  }

  const db = auth.env.CONTACT_DB;
  if (!db) return NextResponse.json({ error: "no_database" }, { status: 503 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  try {
    await db.prepare(`DELETE FROM contact_messages WHERE id = ?1`).bind(id).run();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}