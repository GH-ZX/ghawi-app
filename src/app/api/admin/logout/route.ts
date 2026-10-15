import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-server";

export async function POST() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}