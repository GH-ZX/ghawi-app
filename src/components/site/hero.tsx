import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowDownIcon, ArrowIcon, TelegramGlyph, WhatsAppGlyph } from "@/components/icons";
import { PORTRAIT } from "@/lib/content";
import { handleOf, withProducts, type PageContext } from "@/lib/site-content";

/** Entrance order for the staggered rise (see .rise in site.css). */
const stagger = (step: number) => ({ "--d": step }) as CSSProperties;

const TONE = { open: "badge--good", limited: "badge--warn", booked: "badge--bad" } as const;

/** The title with its accent phrase wrapped, wherever the phrase falls. */
function Title({ title, accent }: { title: string; accent: string }) {
  const at = accent ? title.indexOf(accent) : -1;
  if (at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <em>{accent}</em>
      {title.slice(at + accent.length)}
    </>
  );
}

export function Hero({ ctx }: { ctx: PageContext }) {
  const { t, locale, profile, links, settings, urls, products } = ctx;
  const { hero } = t;
  // The name in the page's own script first, the other one beneath it.
  const names = locale === "ar" ? [profile.nameAr, profile.name] : [profile.name, profile.nameAr];
  // Rounded down to the ten, so the claim stays true as the catalogue moves.
  const shown = products >= 10 ? Math.floor(products / 10) * 10 : 0;
  const productsValue = withProducts(hero.productsCard.value, shown);

  // The second button goes straight to a chat when it can: most clients would rather message than fill a form.
  const channel = settings.heroChannel;
  const second =
    channel === "telegram"
      ? { href: urls.telegram, icon: <TelegramGlyph />, external: true }
      : channel === "whatsapp"
        ? { href: urls.whatsapp, icon: <WhatsAppGlyph />, external: true }
        : { href: "#contact", icon: null, external: false };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell hero__grid">
        <div className="hero__text">
          <span className={`badge ${TONE[settings.availability]} rise`} style={stagger(0)}>
            <span className="live-dot" aria-hidden="true" />
            {hero.status}
          </span>
          {hero.proof ? (
            <p className="hero__eyebrow rise" style={stagger(1)}>
              {hero.proof}
            </p>
          ) : null}
          <h1 id="hero-title" className="hero__title rise rise--solid" style={stagger(1)}>
            <Title title={hero.title} accent={hero.titleAccent} />
          </h1>
          <p className="hero__lead rise" style={stagger(2)}>
            {hero.lead}
          </p>
          <div className="hero__actions rise" style={stagger(3)}>
            <a className="btn press" href="#work">
              {hero.primary}
              <ArrowDownIcon />
            </a>
            <a
              className={channel === "contact" ? "btn btn--ghost press" : `btn btn--ghost press hero__chat hero__chat--${channel}`}
              href={second.href}
              data-track={`hero-${channel}`}
              {...(second.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {second.icon}
              {hero.secondary[channel]}
            </a>
          </div>
          {hero.bot ? (
            <a
              className="bot-link press rise"
              style={stagger(4)}
              href={links.storeBot}
              target="_blank"
              rel="noopener noreferrer"
              data-track="hero-bot"
            >
              <span className="bot-link__icon" aria-hidden="true">
                <TelegramGlyph size={20} />
              </span>
              <span className="bot-link__text">
                <strong>{hero.bot}</strong>
                <span dir="ltr">{handleOf(links.storeBot)}</span>
              </span>
              <ArrowIcon size={16} />
              <span className="sr-only"> {t.ui.newTab}</span>
            </a>
          ) : null}
          {hero.facts.length ? (
            <ul className="chips hero__facts rise" style={stagger(5)}>
              {hero.facts.map((fact) => (
                <li key={fact} className="chip">
                  {fact}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="hero__visual rise rise--solid" style={stagger(2)}>
          <div className="blobs" aria-hidden="true">
            <span className="blob blob--a" />
            <span className="blob blob--b" />
            <span className="blob blob--c" />
          </div>
          <figure className="portrait">
            <Image
              src={PORTRAIT}
              alt={hero.portraitAlt}
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 960px) 92vw, 440px"
            />
            <a className="glass-chip press" href={links.store} target="_blank" rel="noopener noreferrer" data-track="hero-store">
              <span className="live-dot" aria-hidden="true" />
              {hero.liveChip}
            </a>
            <figcaption className="portrait__caption">
              <span className="portrait__name">
                <strong>{names[0]}</strong>
                <span lang={locale === "ar" ? "en" : "ar"}>{names[1]}</span>
              </span>
              <span className="portrait__place">{t.person.location}</span>
            </figcaption>
          </figure>

          {productsValue ? (
            <div className="float-card float-card--a">
              <strong className="num">{productsValue}</strong>
              <span>{hero.productsCard.label}</span>
            </div>
          ) : null}
          <div className="float-card float-card--b">
            <strong>{hero.languageCard.value}</strong>
            <span>{hero.languageCard.label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
