import { ArrowIcon, ServiceIcon } from "@/components/icons";
import type { PageContext } from "@/lib/site-content";

/** Each service leads somewhere: to the form with its topic picked, and to the work that proves it. */
export function Services({ ctx }: { ctx: PageContext }) {
  const { services } = ctx.t;
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{services.label}</span>
          <h2 id="services-title" className="section__title">
            {services.title}
          </h2>
          {services.lead ? <p className="section__lead">{services.lead}</p> : null}
        </header>
        <ul className="services">
          {services.items.map((item) => (
            <li key={item.title} className="service spot" data-reveal>
              <span className="service__icon" aria-hidden="true">
                <ServiceIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="service__links">
                <a href="#contact" className="service__cta" data-topic={item.topic} data-track={`service-${item.topic || "contact"}`}>
                  {services.cta}
                  <ArrowIcon size={15} />
                </a>
                {item.proof ? (
                  <a href={item.proof} className="service__proof">
                    {services.proof}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
