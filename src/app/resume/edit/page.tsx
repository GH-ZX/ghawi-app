import { cookies } from "next/headers";
import { LoginForm } from "@/components/admin/login-form";
import { CvBuilder } from "@/components/cv/cv-builder";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

/** cv.ghawi.app/edit — the admin's own sign-in, then the builder. */
export default async function BuilderPage() {
  const env = ((await getEnv()) ?? {}) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
  if (!configured) return <LoginForm locked note="Your CV builder." />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);
  return authed ? <CvBuilder /> : <LoginForm locked={false} note="Your CV builder. Sign in with the ghawi.app admin account." />;
}
