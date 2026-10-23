"use client";

import { useSyncExternalStore } from "react";
import { THEMES } from "@/lib/ghstore-ui";
import { labelOf, PRESETS, storeTheme } from "@/lib/theme";
import { getPreset, getSiteTheme, setPreset, subscribeTheme } from "@/lib/theme-client";
import type { Dictionary, Locale } from "@/lib/content";

/**
 * GH Store's four presets, applied to this whole page for the visit. Kept in
 * the footer: a playground for the curious, out of the way of the work.
 * Swatches read straight from the synced tokens; the store's own is marked.
 */
export function Looks({ looks, locale }: { looks: Dictionary["footer"]["looks"]; locale: Locale }) {
  const current = useSyncExternalStore(subscribeTheme, getPreset, () => storeTheme.preset);
  const site = useSyncExternalStore(subscribeTheme, getSiteTheme, () => storeTheme.preset);

  return (
    <div className="looks">
      <span className="contact__label">{looks.title}</span>
      <div className="looks__grid" role="group" aria-label={looks.group}>
        {PRESETS.map((preset) => {
          const theme = THEMES[preset];
          return (
            <button
              key={preset}
              type="button"
              className="look press"
              aria-pressed={current === preset}
              title={preset === storeTheme.preset ? looks.live : undefined}
              onClick={() => setPreset(preset)}
            >
              <span className="look__swatches" aria-hidden="true">
                <span style={{ background: theme.light.accent }} />
                <span style={{ background: theme.light.tile }} />
                <span style={{ background: theme.dark.bg }} />
              </span>
              <span className="look__name">
                {theme.label[locale]}
                {preset === storeTheme.preset ? <span className="live-dot" aria-hidden="true" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      {current !== site ? (
        <button type="button" className="btn btn--xs btn--ghost press looks__reset" onClick={() => setPreset(site)}>
          ↺ {looks.reset} · {labelOf(site, locale)}
        </button>
      ) : null}
    </div>
  );
}
