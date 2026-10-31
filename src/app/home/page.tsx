import { cookies } from "next/headers";
import { LoginForm } from "@/components/admin/login-form";
import { HomeConsole } from "@/components/home/home-console";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

/** home.ghawi.app — the ghawi.app admin's sign-in, then every ghawi service. */
export default async function HomePage() {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
  if (!configured) return <LoginForm locked note="home, every ghawi service in one place." />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  return authed ? <HomeConsole /> : <LoginForm locked={false} note="home, every ghawi service in one place. Sign in with the ghawi.app admin account." />;
}
