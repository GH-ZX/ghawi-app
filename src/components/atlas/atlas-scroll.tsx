"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => true,
  );
}

/**
 * Entry reveal for Atlas sections. IntersectionObserver decides when; only
 * transform and opacity are animated.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: tagName = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-on", "true");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // TypeScript widens a union of intrinsic tags into an intersection of their
  // ref types, which no single RefObject satisfies. Collapse it for the ref
  // only — the tag rendered at runtime is unaffected.
  const Tag = tagName as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`atlas-rise ${className}`}
      style={{ "--atlas-delay": `${delay}ms` } as React.CSSProperties}
      data-on={reduced ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}

/** Hairline progress across the top. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[5] h-px">
      <div ref={ref} className="h-full origin-left bg-rust" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}