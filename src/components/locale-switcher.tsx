"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/content";

const LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
};

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const swap = (next: Locale) => {
    // Replace only the locale segment and keep the rest of the path + hash.
    const segments = pathname.split("/");
    segments[1] = next;
    const base = segments.join("/") || `/${next}`;
    router.push(`${base}${window.location.hash}`);
  };

  return (
    <div
      className="mono flex items-center border border-line"
      role="group"
      aria-label="Language"
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={`/${code}`}
            hrefLang={code}
            lang={code}
            aria-current={active ? "true" : undefined}
            onClick={(event) => {
              if (active) return;
              // Plain clicks go through the router; modified clicks keep the
              // default so they can open in a new tab.
              event.preventDefault();
              swap(code);
            }}
            className={`flex h-8 w-9 items-center justify-center text-xs transition-colors duration-200 ${
              active ? "bg-acc text-bg" : "text-fg-3 hover:text-fg"
            }`}
          >
            {LABELS[code]}
          </Link>
        );
      })}
    </div>
  );
}