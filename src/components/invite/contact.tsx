import { whatsappUrl, type InviteContact } from "@/lib/invite";

/** "للتواصل": each person with a WhatsApp button and their number. */
export function Contact({ title, text, contacts }: { title: string; text: string; contacts: InviteContact[] }) {
  if (contacts.length === 0) return null;
  return (
    <section className="iv-contact">
      <p className="iv-kicker" data-reveal>
        {title}
      </p>
      {text ? (
        <p className="iv-contact__text" data-reveal>
          {text}
        </p>
      ) : null}
      <div className="iv-contact__list">
        {contacts.map((c, i) => (
          <div key={`${c.phone}-${i}`} className="iv-contact__person" data-reveal style={{ ["--i" as string]: i }}>
            {c.name ? <strong className="iv-contact__name">{c.name}</strong> : null}
            <a className="iv-pill iv-pill--solid iv-contact__wa" href={whatsappUrl(c.phone)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> واتساب
            </a>
            <a className="iv-contact__phone" href={`tel:${c.phone}`} dir="ltr">
              {c.phone}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"
      />
    </svg>
  );
}
