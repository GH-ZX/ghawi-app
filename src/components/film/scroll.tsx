"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Scroll choreography primitives.
 *
 * Rules this file holds to:
 *   - An IntersectionObserver decides *when* something starts. Only continuous
 *     work (parallax, progress) reads scroll position, and those run through
 *     one shared rAF loop rather than a listener per element.
 *   - Only `transform` and `opacity` are ever animated. Nothing here writes
 *     top/left/width/height, so the page never reflows while scrolling.
 *   - `prefers-reduced-motion` short-circuits every path to the final state.
 */

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * A media query is an external store, so read it as one. Seeding it with
 * `useState` + an effect would set state synchronously inside that effect and
 * force a second render pass on every page load.
 *
 * The server snapshot is `true` — assume reduced motion until the client says
 * otherwise, so nothing animates for a visitor who never runs the script.
 */
function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readMotion() {
  return window.matchMedia(MOTION_QUERY).matches;
}

function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, readMotion, () => true);
}

/* ------------------------------------------------------------------ *
 *  Shared rAF loop
 * ------------------------------------------------------------------ */

type Task = () => void;

const tasks = new Set<Task>();
let scheduled = false;
let listening = false;

function flush() {
  scheduled = false;
  for (const task of tasks) task();
}

function ensureListening() {
  if (listening) return;
  listening = true;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(flush);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function subscribe(task: Task) {
  tasks.add(task);
  ensureListening();
  return () => {
    tasks.delete(task);
    if (tasks.size === 0) flush();
  };
}

/* ------------------------------------------------------------------ *
 *  Scroll progress bar
 * ------------------------------------------------------------------ */

/** A hairline across the top that fills as the document is read. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = barRef.current;
    if (!el) return;

    return subscribe(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      // scaleX, not width — transform only.
      el.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    });
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[4] h-px origin-left bg-white/18"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-ivory will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Parallax
 * ------------------------------------------------------------------ */

/**
 * Moves its child against the scroll.
 *
 * `speed` is how far the child travels across the section's own passage:
 * negative drifts up with the page, positive lags behind it.
 */
export function Parallax({
  children,
  speed = 0.18,
  className = "",
  style,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(MOTION_QUERY).matches) return;

    return subscribe(() => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      // -1 as the element enters from below, 0 at centre, 1 as it leaves above.
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const centred = progress * 2 - 1;
      el.style.transform = `translate3d(0, ${(centred * speed * 100).toFixed(2)}px, 0)`;
    });
  }, [speed]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Scrub reveal
 * ------------------------------------------------------------------ */

/**
 * Wipes a mask across its child in step with scroll, rather than playing a
 * one-shot transition on entry. Used on the statement, where the motion should
 * feel like a camera move rather than a UI animation.
 */
export function Scrub({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(MOTION_QUERY).matches) {
      el.style.clipPath = "none";
      return;
    }

    return subscribe(() => {
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.88;
      const end = window.innerHeight * 0.32;
      if (rect.top > start) {
        el.style.clipPath = "inset(0 100% 0 0)";
        return;
      }
      if (rect.top < end) {
        el.style.clipPath = "none";
        return;
      }
      const t = (start - rect.top) / (start - end);
      el.style.clipPath = `inset(0 ${(100 - t * 100).toFixed(2)}% 0 0)`;
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ clipPath: "inset(0 100% 0 0)" }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Horizontal drift
 * ------------------------------------------------------------------ */

/**
 * A wide strip that travels sideways as the page scrolls vertically. Classic
 * editorial move: motion on two axes at once.
 */
export function Drift({
  children,
  distance = 18,
  className = "",
}: {
  children: ReactNode;
  /** Percent of the strip's own width to travel. */
  distance?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia(MOTION_QUERY).matches) return;

    return subscribe(() => {
      const rect = track.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const centred = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      track.style.transform = `translate3d(${(centred * distance).toFixed(2)}%, 0, 0)`;
    });
  }, [distance]);

  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className={`flex w-max ${className}`} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Count up
 * ------------------------------------------------------------------ */

/**
 * Counts a figure up once, when it first enters view. Non-numeric values
 * (`AR/EN`, words) are passed through untouched.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const numeric = /^\d+$/.test(value);
    if (!numeric || reduced) {
      el.textContent = value;
      return;
    }

    const target = Number(value);
    let frame = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // Expo out, matching the page's easing.
          const eased = 1 - Math.pow(2, -10 * t);
          el.textContent = String(Math.round(target * eased)).padStart(value.length, "0");
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, reduced]);

  return <span ref={ref}>{value}</span>;
}