import { ChannelMark, ChevronIcon, ClockIcon, isChannelMarkId, MailIcon } from "@/components/icons";
import { turnstileSiteKey } from "@/lib/content";
import { channelValue, type PageContext } from "@/lib/site-content";
import { ContactForm } from "./contact-form";
import { CopyButton } from "./copy-button";

export function Contact({ ctx }: { ctx: PageContext }) {
  const { t, locale, profile, urls } = ctx;
  const { contact } = t;
  const channels = contact.channels.filter((channel) => isChannelMarkId(channel.id) && channelValue(channel.id, profile));

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
            {contact.reply ? (
              <p className="contact__reply">
                <ClockIcon size={16} />
                {contact.reply}
              </p>
            ) : null}
          </header>

          {channels.length ? (
            <div className="contact__email" data-reveal>
              <span className="contact__label">{contact.channelsTitle}</span>
              <ul className="list">
                {channels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      className="list-row"
                      href={urls[channel.id as keyof typeof urls]}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track={`contact-${channel.id}`}
                    >
                      {isChannelMarkId(channel.id) ? <ChannelMark id={channel.id} /> : null}
                      <span className="list-row__main">
                        <span className="list-row__title">{channel.label}</span>
                        <span className="list-row__meta">
                          <bdi>{channelValue(channel.id, profile)}</bdi>
                        </span>
                      </span>
                      <ChevronIcon className="list-row__chev" />
                      <span className="sr-only"> {t.ui.newTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="contact__email" data-reveal>
            <span className="contact__label">{contact.emailLabel}</span>
            <div className="copy-box">
              <MailIcon size={18} />
              <a href={urls.email} data-track="contact-email">
                {profile.email}
              </a>
              <CopyButton value={profile.email} copy={contact.copy} copied={contact.copied} />
            </div>
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
