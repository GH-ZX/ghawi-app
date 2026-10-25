"use client";

import { useEffect, useRef } from "react";
import { ExternalIcon } from "@/components/icons";
import type { Lang } from "@/lib/boti/setup";
import { type HowTo, tr, UI } from "@/lib/boti/setup-content";
import { Mock } from "./visuals";

/** Step-by-step guide in a side drawer (a bottom sheet on phones). */
export function HowToDrawer({ open, onClose, guides, lang, title }: { open: boolean; onClose: () => void; guides: HowTo[]; lang: Lang; title: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="qs-drawer" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <button type="button" className="qs-drawer__backdrop" aria-label={tr(lang, UI.close)} onClick={onClose} />
      <div className="qs-drawer__panel" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={panel}>
        <div className="qs-drawer__head">
          <h3>{title}</h3>
          <button type="button" className="btn btn--xs btn--soft press" onClick={onClose}>
            {tr(lang, UI.close)}
          </button>
        </div>
        <div className="qs-drawer__body">
          {guides.map((guide, g) => (
            <section key={g} className="qs-guide" style={{ ["--i" as string]: g }}>
              <h4>{tr(lang, guide.title)}</h4>
              {guide.path ? (
                <p className="qs-guide__path">
                  <span className="badge badge--soft">{tr(lang, UI.where)}</span> {tr(lang, guide.path)}
                </p>
              ) : null}
              {guide.mock ? <Mock kind={guide.mock} /> : null}
              <ol className="qs-guide__steps">
                {guide.steps.map((step, i) => (
                  <li key={i}>{tr(lang, step)}</li>
                ))}
              </ol>
              {guide.links.length ? (
                <div className="qs-guide__links">
                  {guide.links.map((link) => (
                    <a key={link.href} className="btn btn--xs btn--ghost press" href={link.href} target="_blank" rel="noopener noreferrer">
                      {tr(lang, link.label)} <ExternalIcon size={14} />
                    </a>
                  ))}
                </div>
              ) : null}
              {guide.mistakes.length ? (
                <div className="qs-guide__mistakes">
                  <strong>{tr(lang, UI.mistakes)}</strong>
                  <ul>
                    {guide.mistakes.map((m, i) => (
                      <li key={i}>{tr(lang, m)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
