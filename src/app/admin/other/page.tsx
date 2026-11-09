import { cookies } from "next/headers";
import { LoginForm } from "@/components/admin/login-form";
import { OtherConsole } from "@/components/admin/other-console";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";
import { inviteFontVariables } from "@/lib/invite-fonts";
import "@/styles/admin-invite.css";

export const dynamic = "force-dynamic";

/**
 * /admin/other: what the main admin no longer needs up front. Today that is
 * the wedding invitation's settings, kept with all their data; the
 * invitation's own pages (invite.ghawi.app) keep working regardless.
 */
export default async function AdminOtherPage() {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
  if (!configured) return <LoginForm locked />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  if (!authed) return <LoginForm locked={false} />;

  return (
    <div className={inviteFontVariables}>
      <OtherConsole />
    </div>
  );
}
