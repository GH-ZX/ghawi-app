import { DEFAULT_MODES, isSiteTheme, storeTheme, type SiteTheme } from "@/lib/theme";

/*
 * Browser-side theme state. The source of truth is the <html> element itself
 * (`data-preset`, `data-site`, `data-default`, `data-mode`), written by the
 * server, the edge and the pre-paint script, so components subscribe to
 * attribute changes instead of keeping copies.
 */

export type ModeChoice = "system" | "light" | "dark";

const root = () => document.documentElement;

export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-preset", "data-mode", "data-site"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/** The theme on screen now. */
export function getPreset(): SiteTheme {
  const value = root().getAttribute("data-preset");
  return isSiteTheme(value) ? value : storeTheme.preset;
}

/** The site's own theme: GH Store's, or the one pinned in the admin. */
export function getSiteTheme(): SiteTheme {
  const value = root().getAttribute("data-site");
  return isSiteTheme(value) ? value : storeTheme.preset;
}

export function getModeChoice(): ModeChoice {
  const value = root().getAttribute("data-mode");
  return value === "light" || value === "dark" ? value : "system";
}

/** What the page is showing right now, whatever decided it. */
export function getEffectiveMode(): "light" | "dark" {
  return getComputedStyle(root()).colorScheme.includes("dark") ? "dark" : "light";
}

/** Colours ease across instead of snapping, then the address bar follows. */
function transition(change: () => void) {
  const html = root();
  html.classList.add("theming");
  change();
  requestAnimationFrame(() => {
    const bg = getComputedStyle(html).getPropertyValue("--bg").trim();
    if (bg) {
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", bg));
    }
  });
  window.setTimeout(() => html.classList.remove("theming"), 420);
}

/** Same key and values as GH Store's own mode setting. */
export function setMode(mode: ModeChoice) {
  transition(() => {
    if (mode === "system") root().removeAttribute("data-mode");
    else root().setAttribute("data-mode", mode);
  });
  try {
    localStorage.setItem("gh.mode", mode);
  } catch {
    // Private mode: the choice just won't outlive the page.
  }
}

/**
 * Previews a theme for this visit, opening in that theme's default mode.
 * Picking the site's own theme clears the preview.
 */
export function setPreset(theme: SiteTheme) {
  transition(() => {
    root().setAttribute("data-preset", theme);
    root().setAttribute("data-default", DEFAULT_MODES[theme]);
  });
  try {
    if (theme === getSiteTheme()) sessionStorage.removeItem("gh.preset");
    else sessionStorage.setItem("gh.preset", theme);
  } catch {
    // Private mode: the preview lasts until the next page load.
  }
}
