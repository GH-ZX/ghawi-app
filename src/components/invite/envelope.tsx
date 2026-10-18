"use client";

import { useEffect, useRef, useState } from "react";
import { Couple } from "./couple";
import { Monogram } from "./monogram";

type Props = {
  to: string;
  groom: string;
  bride: string;
  dateLine: string;
  logoUrl: string | null;
  /** Called once the envelope has opened and faded away. */
  onOpened: () => void;
};

type Phase = "sealed" | "opening" | "gone";

/** The whole opening, in ms: seal, flap, card, fade. Matches invite.css. */
const OPENING_MS = 2900;

/**
 * The sealed envelope over the invitation. A tap, a swipe, a scroll or a key
 * opens it as one smooth sequence — the seal gives, the flap lifts, the card
 * rises — then it fades and the page underneath begins. The page can't
 * scroll until then.
 */
export function Envelope({ to, groom, bride, dateLine, logoUrl, onOpened }: Props) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const done = useRef(onOpened);

  useEffect(() => {
    done.current = onOpened;
  }, [onOpened]);

  useEffect(() => {
    if (phase === "gone") return;
    const root = document.documentElement;
    root.classList.add("iv-locked");
    if (phase === "opening") {
      // The opening plays under reduced motion too: brief, and the guest started it.
      const timer = window.setTimeout(() => setPhase("gone"), OPENING_MS);
      return () => window.clearTimeout(timer);
    }

    // Sealed: any intent to move on opens it.
    const open = () => setPhase("opening");
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? null);
    const onTouchMove = (e: TouchEvent) => {
      if (touchY !== null && touchY - (e.touches[0]?.clientY ?? touchY) > 24) open();
    };
    const onWheel = (e: WheelEvent) => e.deltaY > 0 && open();
    const onKey = (e: KeyboardEvent) => ["ArrowDown", "PageDown", " ", "Enter"].includes(e.key) && open();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "gone") return;
    document.documentElement.classList.remove("iv-locked");
    window.scrollTo({ top: 0 });
    done.current();
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className="env-screen" data-phase={phase}>
      <div className="env-to">
        <span className="env-to__label">دعوة خاصة</span>
        <strong className="env-to__name">{to || "إلى أحبّتنا"}</strong>
      </div>

      <button type="button" className="env" onClick={() => setPhase("opening")} aria-label="افتح الدعوة" disabled={phase !== "sealed"}>
        <span className="env__back" />
        <span className="env__card">
          <Monogram logoUrl={logoUrl} className="env__card-mono" />
          <Couple groom={groom} bride={bride} className="env__couple" />
          {dateLine ? <span className="env__card-date">{dateLine}</span> : null}
        </span>
        <span className="env__front" />
        <span className="env__flap">
          <span className="env__flap-face env__flap-face--out" />
          <span className="env__flap-face env__flap-face--in" />
        </span>
        <span className="env__seal">
          <Monogram logoUrl={logoUrl} bare className="env__seal-mono" />
        </span>
      </button>

      <p className="env-hint" aria-hidden="true">
        انقروا على الظرف لفتح الدعوة
      </p>
    </div>
  );
}
