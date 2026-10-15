"use client";

import { useEffect, useState } from "react";

type Theme = "nocturne" | "paper" | "ember";

const STORAGE_KEY = "ghawi-theme";

const ORDER: Theme[] = ["nocturne", "paper", "ember"];

/** Must match CHROME in src/lib/theme-script.ts. */
const CHROME: Record<Theme, string> = {
  nocturne: "#07080a",
  paper: "#faf8f4",
  ember: "#0c0907",
};

const ICONS: Record<Theme, React.ReactNode> = {
  nocturne: (
    // Crescent
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 9.8A6 6 0 016.2 2.5a6 6 0 107.3 7.3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  paper: (
    // Sun
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13M12.95 12.95l-1.13-1.13M4.18 4.18L3.05 3.05"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  ember: (
    // Flame
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.4c2.6 2.4 4.4 4.3 4.4 6.8A4.4 4.4 0 018 14.6a4.4 4.4 0 01-4.4-4.4c0-2.5 1.8-4.4 4.4-6.8z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 8.2c1.1 1.1 1.7 1.9 1.7 2.7A1.7 1.7 0 018 12.9a1.7 1.7 0 01-1.7-1.7c0-.8.6-1.6 1.7-2.7z" fill="currentColor" />
    </svg>
  ),
};

/**
 * Cycles the three themes. Applies to <html> before paint via ThemeScript,
 * then keeps the control in sync. The server never sees the choice, so there
 * is no flash and no hydration mismatch.
 */
export function ThemeToggle({ labels }: { labels: Record<Theme, string> }) {
  const [theme, setTheme] = useState<Theme>("nocturne");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reads DOM written by the pre-paint script; no state needed before mount.
    const frame = requestAnimationFrame(() => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "paper" || current === "ember" ? current : "nocturne");
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    document.documentElement.setAttribute("data-theme", next);
    // Mirror the pre-paint script so the address bar follows the choice.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", CHROME[next]);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the choice just won't persist.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={!mounted}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="mono grid size-8 place-items-center border border-line text-fg-3 transition-colors duration-200 hover:border-line-2 hover:text-acc disabled:opacity-0"
    >
      {ICONS[theme]}
    </button>
  );
}