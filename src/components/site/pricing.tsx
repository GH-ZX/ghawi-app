import { CheckIcon, ClockIcon } from "@/components/icons";
import type { PageContext } from "@/lib/site-content";
import { TopicLink } from "./work";

/** Packages with a starting price, or "quote within 24 h" where the admin left the price empty. */
export function Pricing({ ctx }: { ctx: PageContext }) {
  const { pricing } = ctx.t;
  if (!pricing.items.length) return null;

  return (
    <section id="pricing" className="section" aria-labelledby="pricing-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{pricing.label}</span>
          <h2 id="pricing-title" className="section__title">
            {pricing.title}
          </h2>
          {pricing.lead ? <p className="section__lead">{pricing.lead}</p> : null}
        </header>
        <ul className="plans">
          {pricing.items.map((plan) => (
            <li key={plan.name} className={plan.featured ? "plan plan--featured spot" : "plan spot"} data-reveal>
              <div className="plan__top">
                <h3>{plan.name}</h3>
                {plan.featured && pricing.featured ? <span className="badge">{pricing.featured}</span> : null}
              </div>
              <p className="plan__price">
                {plan.price ? (
                  <>
                    <span className="plan__from">{pricing.from}</span>
                    <strong className="num">{plan.price}</strong>
                  </>
                ) : (
                  <strong className="plan__quote">{pricing.quote}</strong>
                )}
              </p>
              {plan.timeline ? (
                <p className="plan__time">
                  <ClockIcon size={15} />
                  {plan.timeline}
                </p>
              ) : null}
              {plan.body ? <p className="plan__body">{plan.body}</p> : null}
              <ul className="plan__list">
                {plan.includes.map((line) => (
                  <li key={line}>
                    <CheckIcon size={15} />
                    {line}
                  </li>
                ))}
              </ul>
              <TopicLink topic={plan.topic} className={plan.featured ? "btn btn--sm btn--block press" : "btn btn--sm btn--soft btn--block press"}>
                {pricing.cta}
              </TopicLink>
            </li>
          ))}
        </ul>
        {pricing.note ? (
          <p className="plans__note" data-reveal>
            {pricing.note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
