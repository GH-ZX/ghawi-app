import { notFound } from "next/navigation";
import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Services } from "@/components/site/services";
import { Tabbar } from "@/components/site/tabbar";
import { Work } from "@/components/site/work";
import { dictionaries, isLocale, links, profile, SITE_URL } from "@/lib/content";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dictionaries[lang];

  // Who this page is about, for search engines (schema.org/Person).
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.nameAr,
    url: `${SITE_URL}/${lang}`,
    image: `${SITE_URL}${profile.portrait}`,
    jobTitle: profile.role[lang],
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Aleppo", addressCountry: "SY" },
    knowsLanguage: ["ar", "en"],
    sameAs: [profile.github, profile.linkedin, profile.telegramUrl, links.store],
  };

  return (
    <>
      <div id="top" />
      <a className="btn btn--sm skip" href="#main">
        {t.ui.skip}
      </a>

      <Header locale={lang} name={lang === "ar" ? profile.nameAr : profile.name} nav={t.nav} ui={t.ui} />

      <main id="main">
        <Hero t={t} locale={lang} />
        <Work t={t} locale={lang} />
        <About about={t.about} />
        <Services services={t.services} />
        <Contact t={t} locale={lang} />
      </main>

      <Footer t={t} locale={lang} />
      <Tabbar nav={t.nav} label={t.ui.nav} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
