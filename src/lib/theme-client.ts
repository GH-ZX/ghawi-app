import { PRESETS, storeTheme, type ThemePreset } from "@/lib/theme";

/*
 * Browser-side theme state. The source of truth is the <html> element itself
 * (`data-preset`, `data-mode`), written before paint by prePaintScript, so
 * components subscribe to attribute changes instead of keeping copies.
 */

export type ModeChoice = "system" | "light" | "dark";

const root = () => document.documentElement;

export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-preset", "data-mode"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function getPreset(): ThemePreset {
  const value = root().getAttribute("data-preset");
  return PRESETS.includes(value as ThemePreset) ? (value as ThemePreset) : storeTheme.preset;
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
 * Previews a preset for this visit. Picking the store's live preset clears the
 * override, so the page goes back to following GH Store.
 */
export function setPreset(preset: ThemePreset) {
  transition(() => root().setAttribute("data-preset", preset));
  try {
    if (preset === storeTheme.preset) sessionStorage.removeItem("gh.preset");
    else sessionStorage.setItem("gh.preset", preset);
  } catch {
    // Private mode: the preview lasts until the next page load.
  }
}
