"use client";

import { Fragment, useEffect, useState } from "react";
import { arabicDigits } from "@/lib/invite";

/** The party counts as "now" for eight hours after it starts. */
const UNDER_WAY_MS = 8 * 3_600_000;

/** Left to right: days, hours, minutes, seconds. */
const UNITS = [
  { key: "days", label: "يوم", size: 86_400_000 },
  { key: "hours", label: "ساعة", size: 3_600_000 },
  { key: "minutes", label: "دقيقة", size: 60_000 },
  { key: "seconds", label: "ثانية", size: 1000 },
] as const;

function split(ms: number): number[] {
  let rest = Math.max(0, ms);
  return UNITS.map((unit) => {
    const value = Math.floor(rest / unit.size);
    rest -= value * unit.size;
    return value;
  });
}

/**
 * Days · hours · minutes · seconds, read left to right. Plain numerals on
 * the paper, no boxes; a number that changes slips softly into place.
 */
export function Countdown({ target }: { target: number }) {
  // null until mounted: the server can't know the visitor's clock.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(Date.now());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  const left = now === null ? null : target - now;
  if (left !== null && left <= 0) {
    return <p className="count__done">{-left < UNDER_WAY_MS ? "الفرح بدأ الآن… بانتظاركم!" : "تمّ الفرح، شكراً لكل من شاركنا"}</p>;
  }

  const values = left === null ? null : split(left);
  return (
    <div className="count" dir="ltr" role="timer" aria-label="الوقت المتبقي حتى الحفل">
      {UNITS.map((unit, i) => {
        const value = values ? arabicDigits(String(values[i]).padStart(2, "0")) : "··";
        return (
          <Fragment key={unit.key}>
            {i > 0 ? (
              <span className="count__sep" aria-hidden="true">
                :
              </span>
            ) : null}
            <span className="count__unit">
              <span className="count__num">
                <span key={value} className="count__value">
                  {value}
                </span>
              </span>
              <span className="count__label">{unit.label}</span>
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
