import { cookies } from "next/headers";
import { LoginForm } from "@/components/admin/login-form";
import { BotiConsole } from "@/components/boti/boti-console";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

/** boti.ghawi.app — the ghawi.app admin's sign-in, then the client control panel. */
export default async function BotiPage() {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
  if (!configured) return <LoginForm locked note="boti, the Plus Store X client panel." />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  return authed ? <BotiConsole /> : <LoginForm locked={false} note="boti, the Plus Store X client panel. Sign in with the ghawi.app admin account." />;
}
