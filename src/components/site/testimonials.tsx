import { ExternalIcon, QuoteIcon } from "@/components/icons";
import type { PageContext } from "@/lib/site-content";

/** Clients in their own words. Nothing renders until the admin adds a quote. */
export function Testimonials({ ctx }: { ctx: PageContext }) {
  const { testimonials, ui } = ctx.t;
  const items = testimonials.items.filter((item) => item.quote.trim() && item.name.trim());
  if (!items.length) return null;

  return (
    <section id="testimonials" className="section" aria-labelledby="testimonials-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{testimonials.label}</span>
          <h2 id="testimonials-title" className="section__title">
            {testimonials.title}
          </h2>
          {testimonials.lead ? <p className="section__lead">{testimonials.lead}</p> : null}
        </header>
        <ul className={items.length === 1 ? "quotes quotes--one" : "quotes"}>
          {items.map((item) => (
            <li key={item.name + item.quote.slice(0, 20)} className="quote spot" data-reveal>
              <QuoteIcon />
              <blockquote>
                <p>{item.quote}</p>
              </blockquote>
              <p className="quote__who">
                <strong>{item.name}</strong>
                {item.role ? <span>{item.role}</span> : null}
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} ${ui.newTab}`}>
                    <ExternalIcon size={14} />
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
