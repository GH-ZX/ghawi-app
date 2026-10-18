"use client";

import { useEffect, useRef, useState } from "react";
import { Couple, Heart } from "./couple";
import { Monogram } from "./monogram";

type Props = {
  title: string;
  /** "الآنسة هيفاء"; empty on the general link. */
  to: string;
  text: string;
  /** On the general link: "دعوة خاصة" and "لحضور حفل زفاف", over the couple. */
  generalTitle: string;
  generalLine: string;
  groom: string;
  bride: string;
  logoUrl: string | null;
  onDone: () => void;
};

/** Long enough to read every line, then a soft fade. A tap skips ahead. */
const SHOW_MS = 3600;
const FADE_MS = 650;

/**
 * The first thing a guest sees: «تمّت دعوتك», their name, a warm line and
 * the couple, rising in one after another — then it fades into the
 * envelope.
 */
export function Splash({ title, to, text, generalTitle, generalLine, groom, bride, logoUrl, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    document.documentElement.classList.add("iv-locked");
    const timer = window.setTimeout(() => setLeaving(true), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => done.current(), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  return (
    <div
      className="splash"
      data-leaving={leaving || undefined}
      onClick={() => setLeaving(true)}
      role="dialog"
      aria-label={to ? `${title} ${to}` : `${generalTitle} ${generalLine}`}
    >
      <Monogram logoUrl={logoUrl} bare className="splash__mono" />
      {to ? (
        <>
          <p className="splash__title">{title}</p>
          <h1 className="splash__name">{to}</h1>
        </>
      ) : (
        <>
          <p className="splash__title">{generalTitle}</p>
          <p className="splash__line">{generalLine}</p>
          <Couple as="h1" groom={groom} bride={bride} className="splash__name splash__name--couple" />
        </>
      )}
      <span className="splash__rule" aria-hidden="true">
        <span />
        <Heart />
        <span />
      </span>
      <p className="splash__text">{text}</p>
      {to ? (
        <div className="splash__couple">
          <span>إلى حفل زفاف</span>
          <Couple groom={groom} bride={bride} />
        </div>
      ) : null}
      <span className="splash__skip">انقر للمتابعة</span>
    </div>
  );
}
