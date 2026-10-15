"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ locked }: { locked: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };

      if (response.ok && body.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      setError(
        body.error === "locked"
          ? "Too many attempts. Wait 15 minutes and try again."
          : body.error === "not_configured"
            ? "Admin auth is not configured on this deployment."
            : "Incorrect username or password.",
      );
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="relative grid size-7 place-items-center border border-line-2 bg-bg-2 font-mono text-[11px] text-fg">
            GH
            <span className="absolute -end-px -bottom-px size-1.5 bg-acc" />
          </span>
          <span className="mono text-xs tracking-[0.14em] text-fg-2 uppercase">
            ghawi<span className="text-fg-3">.app</span>
            <span className="text-fg-3"> / admin</span>
          </span>
        </div>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-fg">Sign in</h1>
        <p className="mt-2 text-[13.5px] text-fg-3">Restricted area. Sessions expire after 8 hours.</p>

        {locked ? (
          <div className="mt-8 border-s-2 border-acc bg-acc-soft/20 px-4 py-3 text-[13px] text-fg">
            This deployment is missing <code className="mono">ADMIN_PASSWORD_HASH</code> or{" "}
            <code className="mono">ADMIN_SESSION_SECRET</code>.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mono mb-2 block text-[10.5px] tracking-[0.14em] text-fg-3 uppercase">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                className="w-full border border-line bg-bg-1 px-4 py-3 text-[14px] text-fg focus:border-acc focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mono mb-2 block text-[10.5px] tracking-[0.14em] text-fg-3 uppercase">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border border-line bg-bg-1 px-4 py-3 text-[14px] text-fg focus:border-acc focus:outline-none"
              />
            </div>

            {error ? (
              <p role="alert" className="border-s-2 border-acc bg-acc-soft/20 px-4 py-3 text-[13px] text-fg">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="sweep mono h-11 w-full border border-line-2 text-[12px] tracking-[0.12em] text-fg uppercase transition-colors duration-200 hover:text-bg disabled:opacity-50"
            >
              <span className="relative z-10">{busy ? "Checking" : "Sign in"}</span>
            </button>
          </form>
        )}

        <a
          href="/en"
          className="mono mt-10 inline-block text-[11px] text-fg-3 transition-colors hover:text-acc"
        >
          ← Back to the site
        </a>
      </div>
    </div>
  );
}