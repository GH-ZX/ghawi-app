import { DocIcon } from "@/components/icons";
import { cvHref } from "@/lib/content";
import type { PageContext } from "@/lib/site-content";

export function About({ ctx }: { ctx: PageContext }) {
  const { about } = ctx.t;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="shell about">
        <div>
          <header className="section__head" data-reveal>
            <span className="badge">{about.label}</span>
            <h2 id="about-title" className="section__title">
              {about.title}
            </h2>
          </header>
          <div className="about__body" data-reveal>
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {about.also ? <p className="about__also">{about.also}</p> : null}
          </div>
          {about.cv ? (
            <a className="btn btn--sm btn--soft press about__cv" href={cvHref(ctx.locale)} data-track="about-cv" data-reveal>
              <DocIcon />
              {about.cv}
            </a>
          ) : null}
        </div>

        <div className="layers" data-reveal>
          <div className="layers__head">
            <h3>{about.layersTitle}</h3>
            <span>{about.layersNote}</span>
          </div>
          <div className="layers__track">
            <span className="layers__packet" aria-hidden="true" />
            <ol className="layers__list">
              {about.layers.map((layer, index) => (
                <li key={layer.name} className="layer">
                  <span className="layer__index num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="layer__text">
                    <strong>{layer.name}</strong>
                    <span>{layer.tools}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
