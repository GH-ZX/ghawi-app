import type { CSSProperties, ReactNode } from "react";
import {
  BellIcon,
  CheckIcon,
  ChevronIcon,
  ExternalIcon,
  LedgerIcon,
  PhoneIcon,
  RepeatIcon,
  RepoIcon,
  SendIcon,
  ShieldIcon,
  WindowIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { links, profile, type Dictionary, type Locale, type Project } from "@/lib/content";
import { Looks } from "./looks";
import { StoreDemo } from "./store-demo";

const DOOR_ICONS = [WindowIcon, PhoneIcon, SendIcon];
const PRINCIPLE_ICONS = [LedgerIcon, BellIcon, RepeatIcon, ShieldIcon];

/** An outbound link that says so to screen readers. */
function Out({ href, className, children, newTab }: { href: string; className: string; children: ReactNode; newTab: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}

export function Work({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { store, work } = t;

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

        {/* ── GH Store, the flagship ── */}
        <article className="feature" aria-labelledby="store-title" data-reveal>
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

            <ul className="doors">
              {store.doors.map((door, index) => {
                const Icon = DOOR_ICONS[index];
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

            <div className="feature__actions">
              <Out className="btn btn--sm press" href={links.store} newTab={t.ui.newTab}>
                {store.visit}
                <ExternalIcon />
              </Out>
              <Out className="btn btn--sm btn--soft press" href={links.storeBot} newTab={t.ui.newTab}>
                {store.openBot}
              </Out>
              <Out className="btn btn--sm btn--ghost press" href={links.storeSource} newTab={t.ui.newTab}>
                {store.source}
              </Out>
            </div>

            <ul className="chips feature__stack">
              {store.stack.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="demo">
            <StoreDemo demo={store.demo} />
          </div>

          <Looks looks={store.looks} locale={locale} />
        </article>

        <ul className="figures">
          {store.figures.map((figure) => (
            <li key={figure.label} className="figure" data-reveal>
              <span className="num">{figure.value}</span>
              <p>{figure.label}</p>
            </li>
          ))}
        </ul>

        <h3 className="principles__title" data-reveal>
          {store.principlesTitle}
        </h3>
        <ul className="principles">
          {store.principles.map((principle, index) => {
            const Icon = PRINCIPLE_ICONS[index];
            return (
              <li key={principle.title} className="principle" data-reveal>
                <span className="principle__icon" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h4>{principle.title}</h4>
                  <p>{principle.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ── the rest of the work ── */}
        <div className="projects">
          {t.projects.map((project) => (
            <ProjectCard key={project.id} project={project} newTab={t.ui.newTab} />
          ))}
        </div>

        <div className="more" data-reveal>
          <div className="more__head">
            <h3>{t.more.title}</h3>
            <Out className="btn btn--xs btn--ghost press" href={profile.github} newTab={t.ui.newTab}>
              {t.more.all}
              <ExternalIcon size={14} />
            </Out>
          </div>
          <ul className="list">
            {t.more.items.map((repo) => (
              <li key={repo.name}>
                <a className="list-row" href={repo.url} target="_blank" rel="noopener noreferrer">
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
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, newTab }: { project: Project; newTab: string }) {
  return (
    <article className="project" aria-labelledby={`${project.id}-title`} data-reveal>
      <div className="project__visual" aria-hidden="true">
        {project.id === "factory" ? <FactoryDiagram /> : <EchocoreWindow />}
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
            {project.links.map((link, index) => (
              <Out
                key={link.href}
                href={link.href}
                newTab={newTab}
                className={index === 0 ? "btn btn--sm btn--soft press" : "btn btn--sm btn--ghost press"}
              >
                {link.label}
                <ExternalIcon size={14} />
              </Out>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/** The Bot Factory, as its README draws it: clients → API → core → data. */
function FactoryDiagram() {
  return (
    <div className="arch" dir="ltr">
      <div className="arch__row">
        <span className="arch__node">Bot runtime</span>
        <span className="arch__node">Mini App</span>
      </div>
      <span className="arch__link" />
      <span className="arch__node arch__node--core">FastAPI · Commerce core</span>
      <span className="arch__link" />
      <div className="arch__row">
        <span className="arch__node">Payments</span>
        <span className="arch__node">Providers</span>
        <span className="arch__node">Fulfilment</span>
      </div>
      <span className="arch__link" />
      <div className="arch__row">
        <span className="arch__node arch__node--data">Ledger · PostgreSQL · Redis</span>
      </div>
    </div>
  );
}

const ECHOCORE_TILES = ["PUBG", "Free Fire", "Genshin", "Steam", "iTunes", "Razer", "Yalla", "Jawaker"];

function EchocoreWindow() {
  return (
    <div className="browser" dir="ltr">
      <div className="browser__bar">
        <i />
        <i />
        <i />
        <span className="browser__url">www.echocore412.com</span>
      </div>
      <div className="browser__grid">
        {ECHOCORE_TILES.map((name, index) => (
          <span
            key={name}
            className="tile tile--art"
            style={{ "--h": [285, 25, 195, 250, 320, 155, 60, 355][index] } as CSSProperties}
          >
            <span className="tile__mono">{name.slice(0, 2).toUpperCase()}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
