"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";

type TagName = "div" | "section" | "li" | "article" | "header" | "figure";

/**
 * The single entry animation on the Film design.
 *
 * Every section resolves through this one primitive so the page moves as a
 * single hand: a heavy fade up out of blur, expo-eased, optionally staggered.
 * IntersectionObserver rather than a scroll listener — no per-frame reflow.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: TagName;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer needed if motion is off — show the final state immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-shown", "true");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.setAttribute("data-shown", "true");
          io.disconnect();
        }
      },
      // Trigger slightly before the element is fully on screen so the motion
      // finishes while the visitor is still reading the section above it.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // TypeScript widens a union of intrinsic tags into an intersection of their
  // ref types, which no single RefObject satisfies. Collapse it to one element
  // type for the ref — the tag rendered at runtime is unaffected.
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      className={`rise ${className}`}
      style={{ "--rise-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}