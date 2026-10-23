"use client";

import { useEffect } from "react";

/*
 * Counts this visit and the clicks that matter (anything with data-track),
 * for Admin → Stats. No cookies and nothing about the person: the server
 * adds one to a per-day counter and forgets the request.
 */

function send(body: Record<string, string>) {
  const payload = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }))) return;
  } catch {
    // Fall through to fetch.
  }
  void fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
    () => undefined,
  );
}

/** `path` names the page when its address doesn't (cv.ghawi.app's "/" is /en/cv). */
export function Track({ locale, path: named }: { locale: string; path?: string }) {
  useEffect(() => {
    // One view per page per tab session: a reload is not a new visitor.
    const path = named ?? window.location.pathname;
    let counted = false;
    try {
      const key = `gh.seen:${path}`;
      counted = sessionStorage.getItem(key) === "1";
      if (!counted) sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: count it anyway.
    }
    if (!counted) {
      let ref = "";
      try {
        const from = document.referrer ? new URL(document.referrer) : null;
        if (from && from.host !== window.location.host) ref = from.host;
      } catch {
        // An unparsable referrer is no referrer.
      }
      send({ k: "view", l: path, loc: locale, r: ref });
    }

    const onClick = (event: MouseEvent) => {
      const label = (event.target as Element | null)?.closest<HTMLElement>("[data-track]")?.dataset.track;
      if (label) send({ k: "click", l: label, loc: locale });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [locale, named]);

  return null;
}
