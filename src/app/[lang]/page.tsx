import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Pricing } from "@/components/site/pricing";
import { Process } from "@/components/site/process";
import { Services } from "@/components/site/services";
import { Spotlight } from "@/components/site/spotlight";
import { StackStrip } from "@/components/site/stack-strip";
import { Tabbar } from "@/components/site/tabbar";
import { Testimonials } from "@/components/site/testimonials";
import { Track } from "@/components/site/track";
import { Work } from "@/components/site/work";
import { isLocale, PORTRAIT, SITE_URL, type SectionKey } from "@/lib/content";
import { navOf, pageContext, visibleSections, type PageContext } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-server";
import { storeProducts } from "@/lib/theme";

const SECTIONS: Record<SectionKey, (props: { ctx: PageContext }) => ReactNode> = {
  work: Work,
  testimonials: Testimonials,
  services: Services,
  pricing: Pricing,
  process: Process,
  about: About,
  contact: Contact,
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const content = await getSiteContent();
  const ctx = pageContext(content, lang, storeProducts);
  const { t, profile, links, settings, urls } = ctx;
  const sections = visibleSections(settings);
  const nav = navOf(settings);

  // Who this page is about and what he offers, for search engines.
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.name,
    alternateName: [profile.nameAr, profile.fullName],
    url: `${SITE_URL}/${lang}`,
    image: `${SITE_URL}${PORTRAIT}`,
    jobTitle: t.person.role,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Aleppo", addressCountry: "SY" },
    knowsLanguage: ["ar", "en"],
    sameAs: [urls.github, urls.linkedin, urls.telegram, profile.instagram ? urls.instagram : "", links.store, links.storeBot].filter(Boolean),
  };
  const business = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name: `${profile.name} — ${t.person.role}`,
    url: `${SITE_URL}/${lang}`,
    image: `${SITE_URL}${PORTRAIT}`,
    description: t.meta.description,
    founder: { "@id": `${SITE_URL}/#person` },
    areaServed: "Worldwide",
    availableLanguage: ["Arabic", "English"],
    address: { "@type": "PostalAddress", addressLocality: "Aleppo", addressCountry: "SY" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t.services.title,
      itemListElement: t.services.items.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.title, description: item.body },
      })),
    },
  };
  const graph = { "@context": "https://schema.org", "@graph": [person, business] };

  return (
    <>
      <div id="top" />
      <a className="btn btn--sm skip" href="#main">
        {t.ui.skip}
      </a>

      <Header
        locale={lang}
        name={lang === "ar" ? profile.nameAr : profile.name}
        nav={t.nav}
        ui={t.ui}
        items={nav}
        sections={sections}
        home=""
      />

      <main id="main">
        <Hero ctx={ctx} />
        <StackStrip items={settings.stack} />
        {sections.map((id) => {
          const Section = SECTIONS[id];
          return <Section key={id} ctx={ctx} />;
        })}
      </main>

      <Footer ctx={ctx} />
      <Tabbar nav={t.nav} label={t.ui.nav} items={nav} sections={sections} />
      <Spotlight />
      <Track locale={lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
