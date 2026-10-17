import { ServiceIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/content";

export function Services({ services }: { services: Dictionary["services"] }) {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{services.label}</span>
          <h2 id="services-title" className="section__title">
            {services.title}
          </h2>
        </header>
        <ul className="services">
          {services.items.map((item) => (
            <li key={item.title} className="service" data-reveal>
              <span className="service__icon" aria-hidden="true">
                <ServiceIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
