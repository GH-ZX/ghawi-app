import { cookies } from "next/headers";
import { AdminConsole } from "@/components/admin/admin-console";
import { LoginForm } from "@/components/admin/login-form";
import { ADMIN_COOKIE, type AdminEnv, getEnv, isAuthenticated } from "@/lib/admin-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const env = (await getEnv()) as AdminEnv;
  const configured = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);

  if (!configured) return <LoginForm locked />;

  const jar = await cookies();
  const authed = await isAuthenticated(jar.get(ADMIN_COOKIE)?.value, env);

  if (!authed) return <LoginForm locked={false} />;

  return <AdminConsole />;
}