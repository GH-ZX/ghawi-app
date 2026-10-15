"use client";

import { useEffect, useRef } from "react";

/**
 * The site backdrop.
 *
 * A 20-second seamless loop generated from the portrait: one very slow push
 * in, then the same frames reversed, so the last frame meets the first with no
 * cut. Deeply blurred and desaturated at the source, so it reads as light
 * moving through a dark room rather than as a photograph.
 *
 * Fixed behind the document and parallaxed against scroll, which is what makes
 * it feel attached to the page instead of pasted on top of it.
 *
 * Three deliberate constraints:
 *   - Muted, inline and looping: autoplays without a sound permission prompt.
 *   - Poster first, so the first paint is never a black rectangle.
 *   - Not in the initial payload. `preload="none"` and the source is attached
 *     after mount, so it never competes with text for bandwidth.
 */
export function Backdrop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    // Honour reduced motion by never starting playback; the poster stands in.
    if (reduced) return;

    let frame = 0;
    let failed = false;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        // Drift and widen slightly across the whole document. Transform only.
        wrap.style.transform = `translate3d(0, ${(p * -70).toFixed(1)}px, 0) scale(${(1.06 + p * 0.1).toFixed(3)})`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Some browsers reject playback even when muted; the poster covers it.
    const play = video.play();
    if (play?.catch) {
      play.catch(() => {
        failed = true;
        wrap.dataset.state = "poster";
      });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      if (!failed) video.pause();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Base wash, so the stage is never flat black. */}
      <div className="absolute inset-0 bg-stage" />

      <div
        ref={wrapRef}
        data-state="video"
        className="absolute inset-[-8%] will-change-transform"
      >
        <video
          ref={videoRef}
          className="size-full object-cover"
          // The source is graded down to near-abstract. Lifting it back up here
          // keeps the motes legible without re-encoding the clip.
          style={{ filter: "brightness(1.45) saturate(1.08) contrast(1.04)" }}
          poster="/media/film/backdrop-poster.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
        >
          <source src="/media/film/backdrop.webm" type="video/webm" />
          <source src="/media/film/backdrop.mp4" type="video/mp4" />
        </video>

        {/* Vignette + grade: the video is atmosphere, never a subject. */}
        <div className="absolute inset-0 bg-stage/45" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(135% 100% at 50% 38%, transparent 38%, var(--color-stage) 100%)",
          }}
        />
      </div>
    </div>
  );
}