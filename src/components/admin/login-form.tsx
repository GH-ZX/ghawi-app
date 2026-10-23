"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

const ERRORS: Record<string, string> = {
  locked: "Too many attempts. Wait 15 minutes and try again.",
  not_configured: "Admin sign-in is not configured on this deployment.",
  unavailable: "Sign-in is briefly unavailable. Try again in a minute.",
  invalid_credentials: "Incorrect username or password.",
};

export function LoginForm({ locked, note = "The ghawi.app inbox. Sessions last 8 hours." }: { locked: boolean; note?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (response.ok && body.ok) {
        router.refresh();
        return;
      }
      setError(ERRORS[body.error ?? ""] ?? ERRORS.invalid_credentials);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <span className="login__blob" aria-hidden="true" />
      <div className="card login__card">
        <Logo draw height={26} />
        <div>
          <h1>Sign in</h1>
          <p>{note}</p>
        </div>

        {locked ? (
          <p className="login__alert" role="alert">
            This deployment is missing <code>ADMIN_PASSWORD_HASH</code> or <code>ADMIN_SESSION_SECRET</code>.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <label className="field">
              <span className="field__label">Username</span>
              <input className="input" name="username" type="text" required autoComplete="username" autoFocus />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input className="input" name="password" type="password" required autoComplete="current-password" />
            </label>
            {error ? (
              <p className="login__alert" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn--block press" disabled={busy}>
              {busy ? <span className="spinner" aria-hidden="true" /> : null}
              {busy ? "Checking" : "Sign in"}
            </button>
          </form>
        )}

        <Link className="login__back" href="/en">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
