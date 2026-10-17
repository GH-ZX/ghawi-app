import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowDownIcon } from "@/components/icons";
import { links, profile, type Dictionary, type Locale } from "@/lib/content";
import { storeProducts } from "@/lib/theme";

/** Entrance order for the staggered rise (see .rise in site.css). */
const stagger = (step: number) => ({ "--d": step }) as CSSProperties;

/** The title with its accent phrase wrapped, wherever the phrase falls. */
function Title({ title, accent }: { title: string; accent: string }) {
  const at = title.indexOf(accent);
  if (at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <em>{accent}</em>
      {title.slice(at + accent.length)}
    </>
  );
}

export function Hero({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { hero } = t;
  // The name in the page's own script first, the other one beneath it.
  const names = locale === "ar" ? [profile.nameAr, profile.name] : [profile.name, profile.nameAr];
  // Rounded down to the ten, so the claim stays true as the catalogue moves.
  const products = storeProducts >= 10 ? Math.floor(storeProducts / 10) * 10 : 0;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell hero__grid">
        <div className="hero__text">
          <span className="badge badge--good rise" style={stagger(0)}>
            <span className="live-dot" aria-hidden="true" />
            {hero.status}
          </span>
          <p className="hero__eyebrow rise" style={stagger(1)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title rise" style={stagger(2)}>
            <Title title={hero.title} accent={hero.titleAccent} />
          </h1>
          <p className="hero__lead rise" style={stagger(3)}>
            {hero.lead}
          </p>
          <div className="hero__actions rise" style={stagger(4)}>
            <a className="btn press" href="#work">
              {hero.primary}
              <ArrowDownIcon />
            </a>
            <a className="btn btn--ghost press" href="#contact">
              {hero.secondary}
            </a>
          </div>
          <ul className="chips hero__facts rise" style={stagger(5)}>
            {hero.facts.map((fact) => (
              <li key={fact} className="chip">
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual rise" style={stagger(3)}>
          <div className="blobs" aria-hidden="true">
            <span className="blob blob--a" />
            <span className="blob blob--b" />
            <span className="blob blob--c" />
          </div>
          <figure className="portrait">
            <Image
              src={profile.portrait}
              alt={hero.portraitAlt}
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 960px) 92vw, 440px"
            />
            <a className="glass-chip press" href={links.store} target="_blank" rel="noopener noreferrer">
              <span className="live-dot" aria-hidden="true" />
              {hero.liveChip}
            </a>
            <figcaption className="portrait__caption">
              <span className="portrait__name">
                <strong>{names[0]}</strong>
                <span lang={locale === "ar" ? "en" : "ar"}>{names[1]}</span>
              </span>
              <span className="portrait__place">{profile.location[locale]}</span>
            </figcaption>
          </figure>

          {products ? (
            <div className="float-card float-card--a">
              <strong className="num">{hero.productsCard.value.replace("{n}", String(products))}</strong>
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
