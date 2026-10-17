"use client";

import { useSyncExternalStore } from "react";
import { THEMES } from "@/lib/ghstore-ui";
import { storeTheme } from "@/lib/theme";
import { getModeChoice, getPreset, setMode, subscribeTheme, type ModeChoice } from "@/lib/theme-client";
import type { Dictionary, Locale } from "@/lib/content";

/** Auto / Light / Dark, the same three choices GH Store offers its customers. */
export function ModeSeg({ ui }: { ui: Dictionary["ui"] }) {
  const mode = useSyncExternalStore(subscribeTheme, getModeChoice, () => "system" as ModeChoice);
  const options: { value: ModeChoice; label: string }[] = [
    { value: "system", label: ui.auto },
    { value: "light", label: ui.light },
    { value: "dark", label: ui.dark },
  ];

  return (
    <div className="seg" role="group" aria-label={ui.appearance}>
      {options.map((option) => (
        <button key={option.value} type="button" className="press" aria-pressed={mode === option.value} onClick={() => setMode(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Names the GH Store preset this page is wearing. */
export function SyncedPreset({ label, locale }: { label: string; locale: Locale }) {
  const preset = useSyncExternalStore(subscribeTheme, getPreset, () => storeTheme.preset);
  return (
    <span className="footer__synced">
      <span className="footer__swatch" aria-hidden="true" />
      {label} · {THEMES[preset].label[locale]}
    </span>
  );
}

/* A minute-resolution clock: one shared subscription, re-read each minute. */
function subscribeMinute(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

/** 24-hour digits read the same in both languages. */
const clocks = new Map<string, Intl.DateTimeFormat>();
function clock(timeZone: string) {
  let format = clocks.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    clocks.set(timeZone, format);
  }
  return format;
}

export function LocalTime({ label, timeZone }: { label: string; timeZone: string }) {
  const time = useSyncExternalStore(
    subscribeMinute,
    () => clock(timeZone).format(new Date()),
    // The server can't know the visitor's "now"; render nothing until mounted.
    () => "",
  );

  if (!time) return null;
  return (
    <span>
      {label} <span className="num">{time}</span>
    </span>
  );
}
