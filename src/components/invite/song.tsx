"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

/**
 * The couple's song: only the sound of the uploaded video plays, looping,
 * from the guest's first tap (browsers allow sound only after one). A small
 * button under the light/dark toggle pauses and resumes it.
 */
export function Song({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const stopped = useRef(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    const start = (event: Event) => {
      // The toggle button handles its own taps.
      if ((event.target as Element | null)?.closest?.(".iv-song")) return;
      if (stopped.current || !audio.paused) return;
      audio.play().catch(() => undefined);
    };
    const events = ["pointerdown", "click", "touchend", "keydown"] as const;
    events.forEach((e) => document.addEventListener(e, start, { capture: true, passive: true }));
    return () => events.forEach((e) => document.removeEventListener(e, start, { capture: true }));
  }, []);

  function toggle(event: MouseEvent) {
    event.stopPropagation();
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      stopped.current = false;
      audio.play().catch(() => undefined);
    } else {
      stopped.current = true;
      audio.pause();
    }
  }

  return (
    <>
      <audio ref={ref} src={src} loop preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button
        type="button"
        className="iv-mode iv-song"
        data-playing={playing || undefined}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={toggle}
        aria-label={playing ? "إيقاف الأغنية" : "تشغيل الأغنية"}
        aria-pressed={playing}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          {playing ? null : <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
      </button>
    </>
  );
}
