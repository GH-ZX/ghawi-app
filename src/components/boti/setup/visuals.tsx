"use client";

import type { ReactNode } from "react";
import type { MockKind } from "@/lib/boti/setup-content";

/** Circular progress, animated by CSS (stroke-dashoffset transition). */
export function ProgressRing({ value, size = 56, stroke = 5, label }: { value: number; size?: number; stroke?: number; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <span className="qs-ring" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="qs-ring__track" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="qs-ring__bar"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="qs-ring__label">{label ?? `${Math.round(pct * 100)}%`}</span>
    </span>
  );
}

/** A checkmark that draws itself when it appears. */
export function DrawnCheck({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="qs-check">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Soft confetti for the final screen (pure CSS; hidden under reduced motion). */
export function Confetti() {
  return (
    <div className="qs-confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} style={{ ["--i" as string]: i, ["--x" as string]: `${(i * 37) % 100}%`, ["--d" as string]: `${(i % 7) * 0.12}s` }} />
      ))}
    </div>
  );
}

/** Tiny mock screens: just enough to show where to look. Labels stay in English (they mirror the real UIs). */
export function Mock({ kind }: { kind: MockKind }) {
  switch (kind) {
    case "botfather":
      return (
        <div className="qs-mock qs-mock--chat" dir="ltr">
          <div className="qs-mock__bar">BotFather</div>
          <p className="qs-mock__out">/newbot</p>
          <p className="qs-mock__in">Alright, a new bot. How are we going to call it?</p>
          <p className="qs-mock__out">My Store</p>
          <p className="qs-mock__in">
            Done! Use this token to access the HTTP API:
            <br />
            <span className="qs-mock__hl">1234567890:AAH…redacted</span>
          </p>
        </div>
      );
    case "deploykey":
      return (
        <div className="qs-mock" dir="ltr">
          <div className="qs-mock__bar">Settings › Deploy keys › Add new</div>
          <div className="qs-mock__field">Title<span>boti</span></div>
          <div className="qs-mock__field qs-mock__field--tall">Key<span>ssh-ed25519 AAAAC3Nza…</span></div>
          <div className="qs-mock__check qs-mock__hl">☑ Allow write access</div>
          <div className="qs-mock__btn">Add key</div>
        </div>
      );
    case "supabase-api":
      return (
        <div className="qs-mock" dir="ltr">
          <div className="qs-mock__bar">Project Settings › API</div>
          <div className="qs-mock__field">Project URL<span className="qs-mock__hl">https://abcd1234.supabase.co</span></div>
          <div className="qs-mock__field">anon public<span>eyJhbGciOi…</span></div>
          <div className="qs-mock__field">service_role (secret)<span>•••••••• → Cloudflare only</span></div>
        </div>
      );
    case "cloudflare-vars":
      return (
        <div className="qs-mock" dir="ltr">
          <div className="qs-mock__bar">Worker › Settings › Variables and Secrets</div>
          {["TELEGRAM_BOT_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "ENCRYPTION_KEY", "TELEGRAM_WEBHOOK_SECRET", "OWNER_EMAILS"].map((k) => (
            <div key={k} className="qs-mock__row">
              <code>{k}</code>
              <span className="qs-mock__pill">Secret</span>
            </div>
          ))}
        </div>
      );
    case "nowpayments":
      return (
        <div className="qs-mock" dir="ltr">
          <div className="qs-mock__bar">NOWPayments › Settings</div>
          <div className="qs-mock__field">Payout wallet<span className="qs-mock__hl">USDT (BEP20) 0x…</span></div>
          <div className="qs-mock__field">Coins settings<span>☑ USDT BSC ☐ USDT TRC20</span></div>
          <div className="qs-mock__field">API key / IPN secret<span>→ client panel › Payments</span></div>
        </div>
      );
    case "panel-system":
      return (
        <div className="qs-mock" dir="ltr">
          <div className="qs-mock__bar">Admin panel › System</div>
          <div className="qs-mock__btn qs-mock__hl">Set webhook to this site</div>
          <div className="qs-mock__btn">Update bot commands</div>
        </div>
      );
  }
}
