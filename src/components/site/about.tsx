import type { Dictionary } from "@/lib/content";

export function About({ about }: { about: Dictionary["about"] }) {
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
          </div>
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
