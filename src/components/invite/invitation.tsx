"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import {
  addressee,
  describeDate,
  fatherParts,
  splitTemplate,
  startInstant,
  type InviteConfig,
  type InviteFont,
  type InviteMetal,
  type InviteGuest,
  type InvitePhoto,
  type InviteRsvp,
  type InviteTheme,
  type PartyKey,
} from "@/lib/invite";
import { ContractMark, CoupleSilhouette } from "./art";
import { WeddingCalendar } from "./calendar";
import { Contact } from "./contact";
import { Countdown } from "./countdown";
import { Couple, Heart } from "./couple";
import { Envelope } from "./envelope";
import { Gallery } from "./gallery";
import { RuleIconSvg } from "./icons";
import { BlessingRosette, VerseCartouche } from "./islamic";
import { ModeToggle } from "./mode-toggle";
import { Monogram } from "./monogram";
import { RsvpForm } from "./rsvp-form";
import { Splash } from "./splash";

type Props = {
  config: InviteConfig;
  guest: InviteGuest | null;
  parties: PartyKey[];
  theme: InviteTheme;
  font: InviteFont;
  metal: InviteMetal;
  rsvp: InviteRsvp | null;
  rsvpClosed: boolean;
  logoUrl: string | null;
  slug: string;
  /** Photos placed on the invitation, already filtered to what this link may see. */
  photos: InvitePhoto[];
};

/** Clicks on these do their own thing; anywhere else, a tap moves to the next section. */
const INTERACTIVE = "a, button, input, textarea, select, label, form, .viewer";

/** Stagger index for a reveal. */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

export function Invitation({ config, guest, parties, theme, font, metal, rsvp, rsvpClosed, logoUrl, slug, photos }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Welcome screen → envelope → the invitation.
  const [splashDone, setSplashDone] = useState(false);
  const [opened, setOpened] = useState(false);
  const onSplashDone = useCallback(() => setSplashDone(true), []);
  const onOpened = useCallback(() => setOpened(true), []);
  const to = addressee(guest);

  // Once the envelope is gone, each element fades up as it scrolls in — once.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !opened) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [opened]);

  // Count the visit (not the admin's previews, not link-preview bots: they run no script).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("preview")) return;
    const key = `iv-seen-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode: count anyway */
    }
    const body = JSON.stringify({ slug });
    if (!navigator.sendBeacon?.("/api/invite/open", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/invite/open", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  }, [slug]);

  const date = describeDate(config.startsAt);
  const start = startInstant(config.startsAt, config.utcOffset);
  const both = parties.length > 1;

  const nameOf = (key: string) => {
    if (key === "groom") return <span className="iv-groom">{config.groomShort}</span>;
    if (key !== "groomFather" && key !== "brideFather") return null;
    const f = fatherParts(config, key === "groomFather" ? "groom" : "bride");
    return (
      <span className="iv-father">
        {f.title ? `${f.title} ` : ""}
        <span className="iv-father__name">{f.name}</span>
        {f.after ? <span className="iv-father__after"> {f.after}</span> : null}
      </span>
    );
  };
  /** A tap anywhere that isn't a control brings the next section to the top. */
  function advance(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest(INTERACTIVE)) return;
    if (window.getSelection()?.toString()) return;
    const sections = Array.from(event.currentTarget.children) as HTMLElement[];
    const next = sections.find((el) => el.getBoundingClientRect().top > 12);
    if (!next) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    next.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const line = (template: string) =>
    splitTemplate(template).map((part, i) => <Fragment key={i}>{typeof part === "string" ? part : (nameOf(part.key) ?? "")}</Fragment>);

  return (
    <div ref={rootRef} className="iv" data-theme={theme} data-font={font} data-metal={metal} data-opened={opened || undefined}>
      <ModeToggle />

      {splashDone ? (
        <Envelope
          to={to}
          generalTitle={config.generalTitle}
          generalLine={config.generalLine}
          groom={config.groomShort}
          bride={config.brideDisplay}
          dateLine={date ? `${date.weekday} ${date.day} ${date.month}` : ""}
          logoUrl={logoUrl}
          onOpened={onOpened}
        />
      ) : (
        <Splash
          title={config.splashTitle}
          to={to}
          text={config.splashText}
          generalTitle={config.generalTitle}
          generalLine={config.generalLine}
          groom={config.groomShort}
          bride={config.brideDisplay}
          logoUrl={logoUrl}
          onDone={onSplashDone}
        />
      )}

      <main className="iv-main" onClick={advance}>
        {/* أحمد ♥ كريمته, in a square frame */}
        <section className="iv-hero">
          <div className="frame">
            <Monogram logoUrl={logoUrl} bare className="frame__mono" />
            <p className="frame__kicker">دعوة زفاف</p>
            <Couple as="h1" groom={config.groomShort} bride={config.brideDisplay} className="couple--hero" />
            {date ? (
              <p className="frame__date">
                {date.weekday} {date.day} {date.month} {date.year}
                <span>الساعة {date.time}</span>
              </p>
            ) : null}
          </div>
          <p className="iv-tap">انقر في أي مكان للمتابعة</p>
          <span className="iv-cue" aria-hidden="true" />
        </section>

        {/* The words */}
        <section className="iv-words">
          {config.verseEnabled && config.verseText ? <VerseCartouche text={config.verseText} cite={config.verseRef} /> : null}
          <p className="iv-opening" data-reveal>
            {config.opening}
          </p>
          <Ornament />
          <p className="iv-line" data-reveal>
            {line(config.invitationLine)}
          </p>
          {config.contractEnabled ? <ContractMark caption={config.contractCaption} /> : null}
          {to ? (
            <div className="iv-for" data-reveal>
              <span>يسعدنا أن تكون الدعوة باسم</span>
              <strong>{to}</strong>
            </div>
          ) : null}
          <p className="iv-personal" data-reveal>
            {guest?.note || config.personalLine}
          </p>
        </section>

        {/* When */}
        {date ? (
          <section className="iv-when">
            <p className="iv-kicker" data-reveal>
              موعدنا
            </p>
            <div data-reveal>
              <WeddingCalendar startsAt={config.startsAt} />
            </div>
            <p className="iv-dayline" data-reveal>
              {date.weekday} {date.day} {date.month} {date.year}
            </p>
            <p className="iv-time" data-reveal>
              الساعة {date.time}
            </p>
            {date.hijri ? (
              <p className="iv-hijri" data-reveal>
                {date.hijri}
              </p>
            ) : null}
            {start ? (
              <div className="iv-count" data-reveal>
                <Countdown target={start.getTime()} />
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Where */}
        <section className="iv-venues">
          <p className="iv-kicker" data-reveal>
            {both ? "مكانا الفرح" : "مكان الفرح"}
          </p>
          {both ? (
            <p className="iv-venues__note" data-reveal>
              الحفلتان في الوقت نفسه، ولكلٍّ منهما صالتها
            </p>
          ) : null}
          <div className="iv-venues__list" data-count={parties.length}>
            {parties.map((key, i) => {
              const event = config.events[key];
              return (
                <article key={key} className="iv-venue" data-reveal style={at(i)}>
                  <h2 className="iv-venue__title">{event.title}</h2>
                  <p className="iv-venue__name">{event.venue}</p>
                  <p className="iv-venue__address">{event.address}</p>
                  {event.note ? <p className="iv-venue__note">{event.note}</p> : null}
                  <div className="iv-venue__links">
                    {event.mapUrl ? (
                      <a className="iv-pill iv-pill--solid" href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                        <PinIcon /> الموقع
                      </a>
                    ) : (
                      <span className="iv-pill iv-pill--quiet">الموقع قريباً</span>
                    )}
                    {start ? (
                      <a className="iv-pill" href={`/api/invite/ics?party=${key}`} download>
                        <CalendarIcon /> التقويم
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Photos — the section only exists once the admin has added some */}
        {photos.length ? <Gallery title={config.inviteGalleryTitle} photos={photos} slug={slug} /> : null}

        {/* Gentle requests */}
        {config.rules.length ? (
          <section className="iv-notes">
            <p className="iv-kicker" data-reveal>
              {config.notesTitle}
            </p>
            {config.rules.map((rule, i) => (
              <div key={i} className="iv-note" data-reveal style={at(i)}>
                <span className="iv-note__icon" aria-hidden="true">
                  <RuleIconSvg icon={rule.icon} />
                </span>
                <h3>{rule.title}</h3>
                <p>{rule.text}</p>
              </div>
            ))}
          </section>
        ) : null}

        {/* RSVP */}
        <section className="iv-rsvp" id="rsvp">
          {config.coupleArtEnabled ? <CoupleSilhouette /> : null}
          <div className="reply" data-reveal>
            <p className="iv-kicker">تأكيد الحضور</p>
            <h2 className="reply__title">هل ستشاركوننا الفرح؟</h2>
            <RsvpForm
              slug={slug}
              guestName={guest ? to : null}
              existing={rsvp}
              closed={rsvpClosed}
            />
          </div>
        </section>

        {/* Contact */}
        {config.contactEnabled ? <Contact title={config.contactTitle} text={config.contactText} contacts={config.contacts} /> : null}

        {/* Farewell */}
        <footer className="iv-end">
          {config.blessingEnabled && config.blessingText ? <BlessingRosette text={config.blessingText} /> : null}
          <p className="iv-end__closing" data-reveal>
            {config.closing}
          </p>
          <div data-reveal>
            <Couple groom={config.groomShort} bride={config.brideDisplay} className="couple--end" />
          </div>
          <p className="iv-end__families" data-reveal>
            {config.families}
          </p>
          <div className="iv-end__mark" data-reveal>
            <Monogram logoUrl={logoUrl} bare className="iv-end__mono" />
          </div>
          <p className="iv-end__site">invite.ghawi.app</p>
        </footer>
      </main>
    </div>
  );
}

/** A thin gold rule with a small heart at its centre. */
function Ornament() {
  return (
    <span className="iv-ornament" aria-hidden="true" data-reveal>
      <span />
      <Heart />
      <span />
    </span>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
