import Image from "next/image";
import { PORTRAIT, type Dictionary, type Locale, type Profile } from "@/lib/content";
import { contactUrls } from "@/lib/site-content";

/*
 * The CV itself: one column, black on white, plain headings — what a
 * recruiter's eye and an applicant-tracking system both read best. The same
 * component draws cv.ghawi.app, the builder's live preview and the PDF.
 */

type Props = {
  cv: Dictionary["cv"];
  profile: Profile;
  locale: Locale;
  /** Where he is, as the site says it in this language. */
  location: string;
};

const lines = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

export function CvSheet({ cv, profile, locale, location }: Props) {
  const urls = contactUrls(profile);
  const name = locale === "ar" ? profile.fullNameAr || profile.nameAr : profile.fullName || profile.name;
  const contacts = [
    { label: profile.email, href: urls.email },
    { label: profile.whatsapp, href: urls.whatsapp },
    { label: profile.telegram ? `t.me/${profile.telegram}` : "", href: urls.telegram },
    { label: "ghawi.app", href: "https://ghawi.app" },
    { label: profile.github ? `github.com/${profile.github}` : "", href: urls.github },
    { label: profile.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, ""), href: urls.linkedin },
  ].filter((item) => item.label && item.href);

  const comma = locale === "ar" ? "، " : ", ";
  const experience = cv.experience.filter((job) => job.role.trim());
  const projects = cv.projects.filter((project) => project.name.trim());
  const skills = cv.skills.filter((skill) => skill.group.trim() || skill.items.trim());
  const languages = cv.languages.filter((language) => language.name.trim());
  const education = cv.education.filter((item) => item.title.trim());
  const training = cv.training.filter((item) => item.title.trim());

  return (
    <article className="cv-sheet" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="cv-name">
      <header className="cv-head">
        <div className="cv-head__text">
          <h1 id="cv-name">{name}</h1>
          {cv.headline ? <p className="cv-head__role">{cv.headline}</p> : null}
          <ul className="cv-contacts">
            {location ? <li>{location}</li> : null}
            {contacts.map((item) => (
              <li key={item.href}>
                <a href={item.href} dir="ltr">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {cv.photo ? <Image className="cv-head__photo" src={PORTRAIT} alt="" width={240} height={300} sizes="96px" priority /> : null}
      </header>

      {cv.summary.trim() ? (
        <section className="cv-block">
          <h2>{cv.labels.profile}</h2>
          <p>{cv.summary}</p>
        </section>
      ) : null}

      {experience.length ? (
        <section className="cv-block">
          <h2>{cv.labels.experience}</h2>
          {experience.map((job, index) => (
            <div key={`${job.role}-${index}`} className="cv-item">
              <div className="cv-item__top">
                <h3>
                  {job.role}
                  {job.org.trim() ? <span className="cv-item__org">{comma}{job.org}</span> : null}
                </h3>
                {job.period.trim() ? <span className="cv-item__when">{job.period}</span> : null}
              </div>
              {job.place.trim() ? <p className="cv-item__place">{job.place}</p> : null}
              {lines(job.points).length ? (
                <ul className="cv-points">
                  {lines(job.points).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {projects.length ? (
        <section className="cv-block">
          <h2>{cv.labels.projects}</h2>
          {projects.map((project, index) => (
            <div key={`${project.name}-${index}`} className="cv-item">
              <div className="cv-item__top">
                <h3>
                  {project.url.trim() ? (
                    <a href={project.url} dir="auto">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                {project.period.trim() ? <span className="cv-item__when">{project.period}</span> : null}
              </div>
              {project.body.trim() ? <p className="cv-item__body">{project.body}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {skills.length ? (
        <section className="cv-block">
          <h2>{cv.labels.skills}</h2>
          <dl className="cv-rows">
            {skills.map((skill, index) => (
              <div key={`${skill.group}-${index}`}>
                <dt>{skill.group}</dt>
                <dd>{skill.items}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {[
        { title: cv.labels.education, items: education },
        { title: cv.labels.training, items: training },
      ].map((block) =>
        block.items.length ? (
          <section key={block.title} className="cv-block">
            <h2>{block.title}</h2>
            {block.items.map((item, index) => (
              <div key={`${item.title}-${index}`} className="cv-item cv-item--short">
                <div className="cv-item__top">
                  <h3>
                    {item.title}
                    {item.place.trim() ? <span className="cv-item__org">{comma}{item.place}</span> : null}
                  </h3>
                  {item.period.trim() ? <span className="cv-item__when">{item.period}</span> : null}
                </div>
              </div>
            ))}
          </section>
        ) : null,
      )}

      {languages.length ? (
        <section className="cv-block">
          <h2>{cv.labels.languages}</h2>
          <p className="cv-inline">
            {languages.map((language, index) => (
              <span key={`${language.name}-${index}`}>
                <strong>{language.name}</strong>
                {language.level.trim() ? ` — ${language.level}` : ""}
              </span>
            ))}
          </p>
        </section>
      ) : null}
    </article>
  );
}
