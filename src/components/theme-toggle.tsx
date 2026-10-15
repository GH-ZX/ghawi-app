"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "ghawi-theme";

/**
 * Applies the theme to <html> before paint via an inline script (see
 * ThemeScript), then keeps the toggle in sync. The server never sees the
 * choice, so there is no flash and no hydration mismatch.
 */
export function ThemeToggle({ label }: { label: { dark: string; light: string } }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reads DOM written by the pre-paint script; no state needed before mount.
    const frame = requestAnimationFrame(() => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "light" ? "light" : "dark");
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
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
      onClick={toggle}
      disabled={!mounted}
      aria-label={theme === "dark" ? label.light : label.dark}
      title={theme === "dark" ? label.light : label.dark}
      className="mono grid size-8 place-items-center border border-line text-fg-3 transition-colors duration-200 hover:border-line-2 hover:text-fg disabled:opacity-0"
    >
      {theme === "dark" ? (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13M12.95 12.95l-1.13-1.13M4.18 4.18L3.05 3.05"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M13.5 9.8A6 6 0 016.2 2.5a6 6 0 107.3 7.3z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}