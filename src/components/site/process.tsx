import type { CSSProperties } from "react";
import type { PageContext } from "@/lib/site-content";

/** What happens after someone writes: numbered steps, each with how long it takes. */
export function Process({ ctx }: { ctx: PageContext }) {
  const { process } = ctx.t;
  if (!process.steps.length) return null;

  return (
    <section id="process" className="section" aria-labelledby="process-title">
      <div className="shell">
        <header className="section__head" data-reveal>
          <span className="badge">{process.label}</span>
          <h2 id="process-title" className="section__title">
            {process.title}
          </h2>
          {process.lead ? <p className="section__lead">{process.lead}</p> : null}
        </header>
        <ol className="steps" style={{ "--steps": process.steps.length } as CSSProperties}>
          {process.steps.map((step, index) => (
            <li key={step.title} className="step" data-reveal>
              <span className="step__index num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="step__text">
                <h3>{step.title}</h3>
                {step.time ? <span className="step__time">{step.time}</span> : null}
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
