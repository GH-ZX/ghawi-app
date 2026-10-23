"use client";

import { useEffect, useState } from "react";
import { NAV_OF, type NavId, type SectionKey } from "@/lib/sections";

export type { NavId };

/**
 * Which nav entry the section under the middle of the viewport belongs to.
 * One observer per caller, watching a thin band across the screen; above the
 * first section (the hero) nothing is active. Testimonials count as Work,
 * pricing and process as Services.
 */
export function useActiveSection(sections: readonly SectionKey[]): NavId | null {
  const [active, setActive] = useState<NavId | null>(null);
  const key = sections.join(",");

  useEffect(() => {
    const ids = key ? (key.split(",") as SectionKey[]) : [];
    const visible = new Set<SectionKey>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionKey;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const current = ids.find((id) => visible.has(id));
        setActive(current ? NAV_OF[current] : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
