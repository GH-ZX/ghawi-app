"use client";

import { useSyncExternalStore } from "react";
import { THEMES } from "@/lib/ghstore-ui";
import { labelOf, PRESETS, storeTheme } from "@/lib/theme";
import { getPreset, getSiteTheme, setPreset, subscribeTheme } from "@/lib/theme-client";
import type { Dictionary, Locale } from "@/lib/content";

/**
 * GH Store's four presets, applied to this whole page. Swatches read straight
 * from the synced tokens; the preset GH Store is wearing right now is marked.
 */
export function Looks({ looks, locale }: { looks: Dictionary["store"]["looks"]; locale: Locale }) {
  const current = useSyncExternalStore(subscribeTheme, getPreset, () => storeTheme.preset);
  const site = useSyncExternalStore(subscribeTheme, getSiteTheme, () => storeTheme.preset);

  return (
    <div className="looks">
      <div className="looks__text">
        <h4 className="looks__title">{looks.title}</h4>
        <p className="looks__body">{looks.body}</p>
      </div>
      <div className="looks__grid" role="group" aria-label={looks.group}>
        {PRESETS.map((preset) => {
          const theme = THEMES[preset];
          return (
            <button
              key={preset}
              type="button"
              className="look press"
              aria-pressed={current === preset}
              onClick={() => setPreset(preset)}
            >
              <span className="look__swatches" aria-hidden="true">
                <span style={{ background: theme.light.accent }} />
                <span style={{ background: theme.light.tile }} />
                <span style={{ background: theme.dark.bg }} />
              </span>
              <span className="look__name">
                {theme.label[locale]}
                {preset === storeTheme.preset ? (
                  <span className="look__live">
                    <span className="live-dot" aria-hidden="true" />
                    {looks.live}
                  </span>
                ) : null}
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
