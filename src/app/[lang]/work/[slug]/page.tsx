import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowIcon, CheckIcon, ExternalIcon } from "@/components/icons";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Spotlight } from "@/components/site/spotlight";
import { StoreShots } from "@/components/site/store-shots";
import { Tabbar } from "@/components/site/tabbar";
import { Track } from "@/components/site/track";
import { BotMedia, Out, StorefrontShots, TopicLink } from "@/components/site/work";
import { CASE_SLUGS, defaultLocale, isLocale, SITE_URL, type CaseSlug, type Dictionary } from "@/lib/content";
import { caseOf, isCaseSlug, navOf, pageContext, visibleSections } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-server";
import { storeProducts } from "@/lib/theme";

type Params = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  if (!isCaseSlug(slug)) return {};
  const item = caseOf((await getSiteContent())[locale], slug);
  if (!item) return {};
  return {
    title: `${item.title} · ${locale === "ar" ? "أحمد غاوي" : "Ahmed Ghawi"}`,
    description: item.description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: { en: `/en/work/${slug}`, ar: `/ar/work/${slug}`, "x-default": `/en/work/${slug}` },
    },
    openGraph: { type: "article", title: item.title, description: item.description, url: `/${locale}/work/${slug}`, images: ["/og.png"] },
  };
}

/** What each case's header says above its title, and which topic its call to action picks. */
function frame(t: Dictionary, slug: CaseSlug) {
  if (slug === "gh-store") return { kicker: t.store.kicker, stack: t.store.stack, topic: "product" };
  if (slug === "store-bot") return { kicker: t.bot.kicker, stack: t.bot.stack, topic: t.bot.cta.topic };
  const project = t.projects.find((p) => p.id === slug);
  return { kicker: project?.kicker ?? "", stack: project?.stack ?? [], topic: project?.cta.topic ?? "web" };
}

/**
 * One showcase told in full: the goal, what was built, where it is now — a
 * page to send a client, and one for search engines to find.
 */
export default async function CasePage({ params }: Params) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isCaseSlug(slug)) notFound();
  const content = await getSiteContent();
  const home = `/${lang}`;
  const ctx = pageContext(content, lang, storeProducts, home);
  const { t, links } = ctx;
  const item = caseOf(t, slug);
  if (!item) notFound();

  const { kicker, stack, topic } = frame(t, slug);
  const project = t.projects.find((p) => p.id === slug);
  const others = t.cases.items.filter((other) => other.slug !== slug && isCaseSlug(other.slug));
  const nav = navOf(content.settings);

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: item.title,
        description: item.description,
        url: `${SITE_URL}/${lang}/work/${slug}`,
        inLanguage: lang,
        author: { "@type": "Person", name: content.profile.name, url: `${SITE_URL}/${lang}` },
        keywords: stack.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.nav.work, item: `${SITE_URL}/${lang}#work` },
          { "@type": "ListItem", position: 2, name: item.title, item: `${SITE_URL}/${lang}/work/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <div id="top" />
      <a className="btn btn--sm skip" href="#main">
        {t.ui.skip}
      </a>
      <Header
        locale={lang}
        name={lang === "ar" ? content.profile.nameAr : content.profile.name}
        nav={t.nav}
        ui={t.ui}
        items={nav}
        sections={visibleSections(content.settings)}
        home={home}
        path={`/work/${slug}`}
      />

      <main id="main" className="case">
        <section className="case__hero">
          <div className="shell">
            <a className="case__back" href={`${home}#work`}>
              <span className="case__back-arrow" aria-hidden="true">
                <ArrowIcon size={15} />
              </span>
              {t.cases.back}
            </a>
            <span className="badge">
              {t.cases.label} · {kicker}
            </span>
            <h1 className="case__title">{item.title}</h1>
            <p className="case__lead">{item.description}</p>
            <div className="case__actions">
              {slug === "gh-store" ? (
                <>
                  <Out className="btn btn--sm press" href={links.store} newTab={t.ui.newTab} track="case-store">
                    {t.store.visit}
                    <ExternalIcon />
                  </Out>
                  <Out className="btn btn--sm btn--soft press" href={links.storeBot} newTab={t.ui.newTab} track="case-bot">
                    {t.store.openBot}
                  </Out>
                </>
              ) : (
                <TopicLink topic={topic} home={home}>
                  {slug === "store-bot" ? t.bot.cta.label : (project?.cta.label ?? t.cases.cta.button)}
                </TopicLink>
              )}
            </div>
          </div>
        </section>

        <div className="shell case__visual" data-reveal>
          {slug === "gh-store" ? (
            <StoreShots shots={t.store.shots} locale={lang} />
          ) : slug === "store-bot" ? (
            <BotMedia bot={t.bot} locale={lang} />
          ) : project ? (
            <StorefrontShots project={project} locale={lang} />
          ) : null}
        </div>

        <div className="shell case__body">
          <section className="case__part" data-reveal>
            <h2>{t.cases.challenge}</h2>
            <p>{item.challenge}</p>
          </section>
          <section className="case__part" data-reveal>
            <h2>{t.cases.built}</h2>
            <ul className="points">
              {item.built.map((line) => (
                <li key={line}>
                  <CheckIcon size={16} />
                  {line}
                </li>
              ))}
            </ul>
          </section>
          <section className="case__part" data-reveal>
            <h2>{t.cases.result}</h2>
            <p>{item.result}</p>
          </section>
          {stack.length ? (
            <section className="case__part" data-reveal>
              <h2>{t.cases.stack}</h2>
              <ul className="chips">
                {stack.map((tool) => (
                  <li key={tool} className="chip">
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <section className="shell" data-reveal>
          <div className="case__cta spot">
            <div>
              <h2>{t.cases.cta.title}</h2>
              <p>{t.cases.cta.body}</p>
            </div>
            <TopicLink topic={topic} home={home} className="btn press">
              {t.cases.cta.button}
            </TopicLink>
          </div>
        </section>

        {others.length ? (
          <section className="shell case__more" aria-labelledby="case-more">
            <h2 id="case-more">{t.cases.more}</h2>
            <ul className="glance">
              {others.map((other) => (
                <li key={other.slug}>
                  <a className="glance__card press" href={`${home}/work/${other.slug}`}>
                    <span className="glance__text">
                      <strong>{other.title}</strong>
                      <span>{other.description}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <Footer ctx={ctx} />
      <Tabbar nav={t.nav} label={t.ui.nav} items={nav} sections={[]} home={home} />
      <Spotlight />
      <Track locale={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    </>
  );
}
