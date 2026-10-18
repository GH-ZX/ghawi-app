import { describeDate, type InviteConfig, type InviteFont, type InviteMetal, type InvitePhoto, type InviteTheme } from "@/lib/invite";
import { Couple } from "./couple";
import { Gallery } from "./gallery";
import { ModeToggle } from "./mode-toggle";
import { Monogram } from "./monogram";

type Props = {
  config: InviteConfig;
  theme: InviteTheme;
  font: InviteFont;
  metal: InviteMetal;
  logoUrl: string | null;
  /** Already filtered to what this link may see. */
  photos: InvitePhoto[];
  slug: string;
};

/**
 * After the wedding: the invitation gives way to a thank-you in the same
 * theme and font — «تمّ الزواج», the couple, the day, a word of thanks —
 * and, below, the wedding photos. Shown once the wedding day is over, or
 * whenever the admin ends the page.
 */
export function Ended({ config, theme, font, metal, logoUrl, photos, slug }: Props) {
  const date = describeDate(config.startsAt);
  const gallery = config.galleryEnabled && photos.length > 0;
  return (
    <div className="iv iv--ended" data-theme={theme} data-font={font} data-metal={metal} data-opened>
      <ModeToggle />
      <main className="ended">
        <section className="ended__intro">
          <div className="frame">
            <Monogram logoUrl={logoUrl} bare className="frame__mono" />
            <p className="frame__kicker ended__title">{config.endedTitle}</p>
            <Couple as="h1" groom={config.groomShort} bride={config.brideDisplay} className="couple--hero" />
            {date ? (
              <p className="frame__date">
                <span>
                  يوم {date.weekday} {date.day} {date.month} {date.year}
                </span>
              </p>
            ) : null}
          </div>
          <p className="ended__text">{config.endedText}</p>
          <p className="ended__families">{config.families}</p>
          {gallery ? <span className="iv-cue ended__cue" aria-hidden="true" /> : null}
        </section>
        {gallery ? <Gallery title={config.galleryTitle} photos={photos} slug={slug} /> : null}
      </main>
    </div>
  );
}
