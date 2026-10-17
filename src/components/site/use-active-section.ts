"use client";

import { useEffect, useState } from "react";

export const SECTION_IDS = ["work", "about", "services", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Which section sits under the middle of the viewport. One observer per
 * caller, watching a thin band across the screen; above the first section
 * (the hero) nothing is active.
 */
export function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const visible = new Set<SectionId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        setActive(SECTION_IDS.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}
