"use client";

import { ChatIcon, PersonIcon, SparkIcon, WorkIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/content";
import { SECTION_IDS, useActiveSection, type SectionId } from "./use-active-section";

const ICONS: Record<SectionId, typeof WorkIcon> = {
  work: WorkIcon,
  about: PersonIcon,
  services: SparkIcon,
  contact: ChatIcon,
};

/** GH Store's floating pill tab bar, for phones: one tap to any section. */
export function Tabbar({ nav, label }: { nav: Dictionary["nav"]; label: string }) {
  const active = useActiveSection();

  return (
    <nav className="tabbar" aria-label={label}>
      {SECTION_IDS.map((id) => {
        const Icon = ICONS[id];
        return (
          <a key={id} href={`#${id}`} className="press" aria-current={active === id ? "true" : undefined}>
            <Icon size={21} />
            {nav[id]}
          </a>
        );
      })}
    </nav>
  );
}
