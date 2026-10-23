import type { ReactNode } from "react";
import {
  ArrowIcon,
  BellIcon,
  BotIcon,
  CheckIcon,
  ChevronIcon,
  CodeIcon,
  ExternalIcon,
  LedgerIcon,
  PhoneIcon,
  RepeatIcon,
  RepoIcon,
  SendIcon,
  ShieldIcon,
  StoreIcon,
  WindowIcon,
} from "@/components/icons";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { CASE_SLUGS, type Dictionary, type Locale, type Project } from "@/lib/content";
import { withProducts, type PageContext } from "@/lib/site-content";
import { BotVideo } from "./bot-video";
import { StoreShots } from "./store-shots";

const DOOR_ICONS = [WindowIcon, PhoneIcon, SendIcon];
const PRINCIPLE_ICONS = [LedgerIcon, BellIcon, RepeatIcon, ShieldIcon];
const GLANCE_ICONS = [StoreIcon, BotIcon, CodeIcon];

/** An outbound link that says so to screen readers. */
export function Out({
  href,
  className,
  children,
  newTab,
  track,
}: {
  href: string;
  className: string;
  children: ReactNode;
  newTab: string;
  track?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" data-track={track}>
      {children}
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}

/** A button that scrolls to the form with its topic picked (see ContactForm). */
export function TopicLink({ topic, children, className = "btn btn--sm press", home = "" }: { topic: string; children: ReactNode; className?: string; home?: string }) {
  // On the home page the form is right there; elsewhere the topic rides in the URL.
  const href = home ? `${home}?topic=${encodeURIComponent(topic)}#contact` : "#contact";
  return (
    <a className={className} href={href} data-topic={topic} data-track={`cta-${topic || "contact"}`}>
      {children}
      <ArrowIcon size={16} />
    </a>
  );
}

/** "Read the case study", for the showcases that have one. */
function CaseLink({ slug, locale, label }: { slug: string; locale: Locale; label: string }) {
  if (!(CASE_SLUGS as readonly string[]).includes(slug)) return null;
  return (
    <a className="case-link" href={`/${locale}/work/${slug}`} data-track={`case-${slug}`}>
      {label}
      <ArrowIcon size={15} />
    </a>
  );
}

export function Work({ ctx }: { ctx: PageContext }) {
  const { t, locale, links, products } = ctx;
  const { store, work } = t;
  const figures = store.figures
    .map((figure) => ({ ...figure, value: withProducts(figure.value, products >= 10 ? Math.floor(products / 10) * 10 : 0) }))
    .filter((figure): figure is { value: string; label: string } => figure.value !== null);

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{work.label}</span>
          <h2 id="work-title" className="section__title">
            {work.title}
          </h2>
          <p className="section__lead">{work.lead}</p>
        </header>

        {work.glance.length ? (
          <ul className="glance" data-reveal>
            {work.glance.map((item, index) => {
              const Icon = GLANCE_ICONS[index % GLANCE_ICONS.length];
              return (
                <li key={item.href + item.name}>
                  <a className="glance__card press" href={item.href}>
                    <span className="glance__icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <span className="glance__text">
                      <strong>{item.name}</strong>
                      <span>{item.line}</span>
                    </span>
                    <ChevronIcon className="glance__chev" />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}

        {/* ── GH Store, the flagship ── */}
        <article id="gh-store" className="feature spot" aria-labelledby="store-title" data-reveal>
          <div className="feature__intro">
            <div className="feature__text">
              <span className="badge badge--good">
                <span className="live-dot" aria-hidden="true" />
                {store.kicker}
              </span>
              <div className="feature__brand">
                <Logo height={26} label="GH Store" />
                <span>GH Store</span>
              </div>
              <h3 id="store-title" className="feature__title">
                {store.title}
              </h3>
              <p className="feature__body">{store.body}</p>
              <div className="feature__actions">
                <Out className="btn btn--sm press" href={links.store} newTab={t.ui.newTab} track="store-site">
                  {store.visit}
                  <ExternalIcon />
                </Out>
                <Out className="btn btn--sm btn--soft press" href={links.storeBot} newTab={t.ui.newTab} track="store-bot">
                  {store.openBot}
                </Out>
                {links.storeChannel ? (
                  <Out className="btn btn--sm btn--ghost press" href={links.storeChannel} newTab={t.ui.newTab} track="store-channel">
                    {store.channel}
                  </Out>
                ) : null}
                {links.storeSource ? (
                  <Out className="btn btn--sm btn--ghost press" href={links.storeSource} newTab={t.ui.newTab} track="store-source">
                    {store.source}
                  </Out>
                ) : null}
              </div>
              <CaseLink slug="gh-store" locale={locale} label={t.ui.caseStudy} />
            </div>

            <div className="feature__side">
              <ul className="doors">
                {store.doors.map((door, index) => {
                  const Icon = DOOR_ICONS[index % DOOR_ICONS.length];
                  return (
                    <li key={door.name} className="door">
                      <span className="door__icon" aria-hidden="true">
                        <Icon size={19} />
                      </span>
                      <span className="door__text">
                        <strong>{door.name}</strong>
                        <span>
                          <bdi>{door.detail}</bdi>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <ul className="chips feature__stack">
                {store.stack.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <StoreShots shots={store.shots} locale={locale} />
        </article>

        {figures.length ? (
          <ul className="figures">
            {figures.map((figure) => (
              <li key={figure.label} className="figure spot" data-reveal>
                <span className="num">{figure.value}</span>
                <p>{figure.label}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {store.principles.length ? (
          <>
            <h3 className="principles__title" data-reveal>
              {store.principlesTitle}
            </h3>
            <ul className="principles">
              {store.principles.map((principle, index) => {
                const Icon = PRINCIPLE_ICONS[index % PRINCIPLE_ICONS.length];
                return (
                  <li key={principle.title} className="principle spot" data-reveal>
                    <span className="principle__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <div>
                      <h4>{principle.title}</h4>
                      <p>{principle.body}</p>
                      {principle.tech ? <p className="principle__tech">{principle.tech}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {/* ── the client work ── */}
        <BotShowcase bot={t.bot} locale={locale} caseLabel={t.ui.caseStudy} />

        <div className="projects">
          {t.projects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} newTab={t.ui.newTab} caseLabel={t.ui.caseStudy} />
          ))}
        </div>

        <More t={t} githubUrl={ctx.urls.github} />
      </div>
    </section>
  );
}

/** The two newest repositories, the rest a tap away: the page stays short on phones. */
function More({ t, githubUrl }: { t: Dictionary; githubUrl: string }) {
  if (!t.more.items.length) return null;
  const row = (repo: Dictionary["more"]["items"][number]) => (
    <li key={repo.name}>
      <a className="list-row" href={repo.url} target="_blank" rel="noopener noreferrer" data-track="github-repo">
        <span className="round-icon" aria-hidden="true">
          <RepoIcon />
        </span>
        <span className="list-row__main">
          <span className="repo__top">
            <span className="repo__name">{repo.name}</span>
            <span className="repo__kind">{repo.kind}</span>
          </span>
          <span className="list-row__meta">{repo.blurb}</span>
        </span>
        <ChevronIcon className="list-row__chev" />
        <span className="sr-only"> {t.ui.newTab}</span>
      </a>
    </li>
  );
  const first = t.more.items.slice(0, 2);
  const rest = t.more.items.slice(2);

  return (
    <div className="more" data-reveal>
      <div className="more__head">
        <h3>{t.more.title}</h3>
        <Out className="btn btn--xs btn--ghost press" href={githubUrl} newTab={t.ui.newTab} track="github">
          {t.more.all}
          <ExternalIcon size={14} />
        </Out>
      </div>
      <ul className="list">{first.map(row)}</ul>
      {rest.length ? (
        <details className="more__rest">
          <summary className="btn btn--xs btn--soft press">
            {t.ui.showAll} · {t.more.items.length}
          </summary>
          <ul className="list">{rest.map(row)}</ul>
        </details>
      ) : null}
    </div>
  );
}

function ProjectCard({ project, locale, newTab, caseLabel }: { project: Project; locale: Locale; newTab: string; caseLabel: string }) {
  return (
    <article id={project.id} className="project spot" aria-labelledby={`${project.id}-title`} data-reveal>
      <div className="project__visual">
        <StorefrontShots project={project} locale={locale} />
      </div>
      <div className="project__body">
        <span className={project.live ? "badge badge--good" : "badge badge--soft"}>
          {project.live ? <span className="live-dot" aria-hidden="true" /> : null}
          {project.kicker}
        </span>
        <p className="project__name">{project.name}</p>
        <h3 id={`${project.id}-title`} className="project__title">
          {project.title}
        </h3>
        <p className="project__text">{project.body}</p>
        <ul className="points">
          {project.points.map((point) => (
            <li key={point}>
              <CheckIcon size={16} />
              {point}
            </li>
          ))}
        </ul>
        <div className="project__foot">
          <ul className="chips">
            {project.stack.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
          <div className="project__links">
            {project.cta.label ? (
              <TopicLink topic={project.cta.topic} className="btn btn--sm press">
                {project.cta.label}
              </TopicLink>
            ) : null}
            {project.links.map((link) => (
              <Out key={link.href} href={link.href} newTab={newTab} className="btn btn--sm btn--ghost press">
                {link.label}
                <ExternalIcon size={14} />
              </Out>
            ))}
          </div>
          <CaseLink slug={project.id} locale={locale} label={caseLabel} />
        </div>
      </div>
    </article>
  );
}

/** Real screens of a live store, shown without its name or logo (public/media/<id>). */
export function StorefrontShots({ project, locale }: { project: Project; locale: Locale }) {
  const src = (kind: string) => `/media/${project.id}/${kind}-${locale}.webp`;
  return (
    <div className="shots shots--card" dir="ltr">
      <span className="shots__glow" aria-hidden="true" />
      <figure className="browser-shot">
        <div className="browser-shot__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="browser-shot__url">
            <span className="live-dot" />
            {project.shots.bar}
          </span>
        </div>
        <Image src={src("desktop")} alt={project.shots.desktop} width={2000} height={1250} sizes="(max-width: 900px) 92vw, 640px" />
      </figure>
      <figure className="phone-shot">
        <Image src={src("mobile")} alt={project.shots.mobile} width={780} height={1688} sizes="(max-width: 640px) 30vw, 160px" />
      </figure>
    </div>
  );
}

/**
 * A store bot built for a client, shown without the client's name: the real
 * order flow on video in the middle, two real screens either side.
 */
export function BotShowcase({ bot, locale, caseLabel, compact = false }: { bot: Dictionary["bot"]; locale: Locale; caseLabel: string; compact?: boolean }) {
  return (
    <article id={compact ? undefined : "store-bot"} className="botcase spot" aria-labelledby="bot-title" data-reveal>
      <div className="botcase__text">
        <span className="badge">{bot.kicker}</span>
        <h3 id="bot-title" className="project__title botcase__title">
          {bot.title}
        </h3>
        <p className="project__text">{bot.body}</p>
        <ul className="points">
          {bot.points.map((point) => (
            <li key={point}>
              <CheckIcon size={16} />
              {point}
            </li>
          ))}
        </ul>
        <ul className="chips botcase__stack">
          {bot.stack.map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
        <p className="botcase__note">{bot.note}</p>
        {!compact ? (
          <div className="botcase__actions">
            {bot.cta.label ? <TopicLink topic={bot.cta.topic}>{bot.cta.label}</TopicLink> : null}
            <CaseLink slug="store-bot" locale={locale} label={caseLabel} />
          </div>
        ) : null}
      </div>

      <BotMedia bot={bot} locale={locale} />
    </article>
  );
}

export function BotMedia({ bot, locale }: { bot: Dictionary["bot"]; locale: Locale }) {
  const still = (n: number) => `/media/bot/${locale}-${n}.webp`;
  return (
    <div className="botcase__media" dir="ltr">
      <span className="botcase__glow" aria-hidden="true" />
      <figure className="botcase__phone botcase__phone--side botcase__phone--start">
        <Image src={still(2)} alt={bot.stills[1] ?? ""} width={600} height={1239} sizes="200px" />
      </figure>
      <figure className="botcase__phone botcase__phone--main">
        <BotVideo src={`/media/bot/demo-${locale}.mp4`} poster={still(1)} label={bot.video} />
      </figure>
      <figure className="botcase__phone botcase__phone--side botcase__phone--end">
        <Image src={still(3)} alt={bot.stills[2] ?? ""} width={600} height={1239} sizes="200px" />
      </figure>
    </div>
  );
}
