import { cookies } from "next/headers";
import { AdminConsole } from "@/components/admin/admin-console";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminSection } from "@/lib/admin-sections";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

/** `?tab=site|stats|theme` opens on that section (the links back from /admin/other). */
export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);

  if (!configured) return <LoginForm locked />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);

  const { tab } = await searchParams;
  return authed ? <AdminConsole initialSection={isAdminSection(tab) ? tab : "inbox"} /> : <LoginForm locked={false} />;
}
