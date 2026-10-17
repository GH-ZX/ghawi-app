"use client";

import { useEffect, useState } from "react";
import { ExternalIcon } from "@/components/icons";
import { CLASSIC_THEMES, type SiteThemeChoice } from "@/lib/classic-themes";
import { colorsOf, labelOf, SITE_THEMES, storeTheme, type SiteTheme } from "@/lib/theme";

type Status = "loading" | "idle" | "saving" | "saved" | "error";

const NOTES: Record<SiteTheme, string> = {
  calm: "GH Store preset · cool blue, Readex Pro.",
  energetic: "GH Store preset · violet, Rubik.",
  minimal: "GH Store preset · black and white, Alexandria.",
  warm: "GH Store preset · green and gold, Tajawal and El Messiri.",
  nocturne: CLASSIC_THEMES.nocturne.note,
  ember: CLASSIC_THEMES.ember.note,
};

function Swatches({ theme }: { theme: SiteTheme }) {
  const c = colorsOf(theme);
  return (
    <span className="look__swatches" aria-hidden="true">
      <span style={{ background: c.light.accent }} />
      <span style={{ background: c.light.bg }} />
      <span style={{ background: c.dark.bg }} />
    </span>
  );
}

/** Admin → Theme: which look ghawi.app wears. Applied at the edge, no rebuild. */
export function ThemePanel() {
  const [current, setCurrent] = useState<SiteThemeChoice | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/admin/theme", { signal: controller.signal, cache: "no-store" });
        const body = (await response.json()) as { theme?: SiteThemeChoice };
        setCurrent(body.theme ?? "ghstore");
        setStatus(response.ok ? "idle" : "error");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();
    return () => controller.abort();
  }, []);

  async function choose(theme: SiteThemeChoice) {
    const previous = current;
    setCurrent(theme);
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("saved");
    } catch {
      setCurrent(previous);
      setStatus("error");
    }
  }

  const options: { id: SiteThemeChoice; name: string; note: string; preview: SiteTheme }[] = [
    {
      id: "ghstore",
      name: "Follow GH Store",
      note: `Whatever the store wears — now ${labelOf(storeTheme.preset, "en")}. Changes with the store.`,
      preview: storeTheme.preset,
    },
    ...SITE_THEMES.map((theme) => ({ id: theme, name: labelOf(theme, "en"), note: NOTES[theme], preview: theme })),
  ];

  return (
    <section className="theme-panel" aria-labelledby="theme-title">
      <div className="theme-panel__head">
        <div>
          <h2 id="theme-title">Landing page theme</h2>
          <p className="muted">
            Applies to ghawi.app/en and /ar within 30 seconds — no deploy. Visitors can still pick light or dark.
          </p>
        </div>
        <span className="theme-panel__status" role="status">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved · live within 30 s" : status === "error" ? "Couldn't save. Try again." : ""}
        </span>
      </div>

      <div className="theme-grid" role="radiogroup" aria-label="Landing page theme">
        {options.map((option) => (
          <div key={option.id} className="theme-option" data-on={current === option.id || undefined}>
            <button
              type="button"
              role="radio"
              aria-checked={current === option.id}
              disabled={status === "loading"}
              className="theme-option__pick press"
              onClick={() => choose(option.id)}
            >
              <span className="theme-option__top">
                <Swatches theme={option.preview} />
                {current === option.id ? <span className="badge badge--good">Live</span> : null}
              </span>
              <strong>{option.name}</strong>
              <span className="muted small">{option.note}</span>
            </button>
            <a className="theme-option__preview" href={`/en?preset=${option.preview}`} target="_blank" rel="noopener noreferrer">
              Preview <ExternalIcon size={13} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
