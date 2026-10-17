import { ChannelMark, ChevronIcon, MailIcon } from "@/components/icons";
import { profile, turnstileSiteKey, type Dictionary, type Locale } from "@/lib/content";
import { ContactForm } from "./contact-form";
import { CopyButton } from "./copy-button";

const CHANNEL_HREF = {
  telegram: profile.telegramUrl,
  whatsapp: profile.whatsappUrl,
  github: profile.github,
  linkedin: profile.linkedin,
} as const;

export function Contact({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { contact } = t;

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="shell contact">
        <div className="contact__intro">
          <header className="section__head" style={{ marginBottom: 0 }} data-reveal>
            <span className="badge">{contact.label}</span>
            <h2 id="contact-title" className="section__title">
              {contact.title}
            </h2>
            <p className="section__lead">{contact.body}</p>
          </header>

          <div className="contact__email" data-reveal>
            <span className="contact__label">{contact.emailLabel}</span>
            <div className="copy-box">
              <MailIcon size={18} />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <CopyButton value={profile.email} copy={contact.copy} copied={contact.copied} />
            </div>
          </div>

          <div className="contact__email" data-reveal>
            <span className="contact__label">{contact.channelsTitle}</span>
            <ul className="list">
              {contact.channels.map((channel) => (
                <li key={channel.id}>
                  <a className="list-row" href={CHANNEL_HREF[channel.id]} target="_blank" rel="noopener noreferrer">
                    <ChannelMark id={channel.id} />
                    <span className="list-row__main">
                      <span className="list-row__title">{channel.label}</span>
                      <span className="list-row__meta">
                        <bdi>{channel.value}</bdi>
                      </span>
                    </span>
                    <ChevronIcon className="list-row__chev" />
                    <span className="sr-only"> {t.ui.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card contact__form" data-reveal>
          <h3>{contact.formTitle}</h3>
          <ContactForm t={contact.form} locale={locale} siteKey={turnstileSiteKey} />
        </div>
      </div>
    </section>
  );
}
