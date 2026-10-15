import { redirect } from "next/navigation";

/** The gate lives at /admin itself; this is just a friendly alias. */
export default function AdminLoginAlias() {
  redirect("/admin");
}