"use client";

import { ChatIcon, PersonIcon, SparkIcon, WorkIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/content";
import type { SectionKey } from "@/lib/sections";
import { useActiveSection, type NavId } from "./use-active-section";

const ICONS: Record<NavId, typeof WorkIcon> = {
  work: WorkIcon,
  about: PersonIcon,
  services: SparkIcon,
  contact: ChatIcon,
};

/**
 * GH Store's floating pill tab bar, for phones: one tap to any section.
 * Contact is drawn as the call to action, since phones have no header button.
 */
export function Tabbar({
  nav,
  label,
  items,
  sections,
  home = "",
}: {
  nav: Dictionary["nav"];
  label: string;
  items: NavId[];
  sections: SectionKey[];
  home?: string;
}) {
  const active = useActiveSection(home ? [] : sections);

  return (
    <nav className="tabbar" aria-label={label} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((id) => {
        const Icon = ICONS[id];
        return (
          <a
            key={id}
            href={`${home}#${id}`}
            className={id === "contact" ? "press tabbar__cta" : "press"}
            aria-current={active === id ? "true" : undefined}
            data-track={id === "contact" ? "tabbar-contact" : undefined}
          >
            <Icon size={21} />
            {nav[id]}
          </a>
        );
      })}
    </nav>
  );
}
