import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Ended } from "@/components/invite/ended";
import { Invitation } from "@/components/invite/invitation";
import {
  addressee,
  audiencesFor,
  describeDate,
  fillTemplate,
  GENERAL_SLUG,
  INVITE_URL,
  isGuestSlug,
  isEnded,
  isInviteFont,
  isInviteMetal,
  isInviteTheme,
  PARTY_KEYS,
  partiesOf,
  rsvpClosed,
  type InviteConfig,
  type InviteGuest,
} from "@/lib/invite";
import { inviteDb, isAdminSession, loadConfig, loadGuest, loadPhotos, loadRsvp, loadSong, logoVersion } from "@/lib/invite-server";

/* Every visit reads D1: the admin's edits show on the next load. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };
type PageProps = Params & { searchParams: Promise<Record<string, string | string[] | undefined>> };

const PAPER: Record<InviteConfig["theme"], string> = {
  navy: "#F7F4EE",
  blush: "#FBF3F1",
  ivory: "#FAF6EC",
  terracotta: "#F7EFE6",
  white: "#FFFFFF",
  sage: "#F3F4EE",
};

/** Metadata, viewport and page all ask; one D1 round per request. */
const resolve = cache(async (slug: string): Promise<{ config: InviteConfig; guest: InviteGuest | null } | null> => {
  const db = await inviteDb();
  const config = await loadConfig(db);
  if (slug === GENERAL_SLUG) return { config, guest: null };
  if (!isGuestSlug(slug)) return null;
  const guest = await loadGuest(db, slug);
  return guest ? { config, guest } : null;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await resolve(slug);
  if (!found) return { title: "دعوة غير موجودة", robots: { index: false, follow: false } };

  const { config, guest } = found;
  const to = addressee(guest);
  const title = to ? `دعوة خاصة إلى ${to}` : `${config.groomShort} ♥ ${config.brideDisplay} · دعوة زفاف`;
  const first = describeDate(config.startsAt);
  const description = [fillTemplate(config.invitationLine, config), config.groomName, first ? `${first.weekday} ${first.day} ${first.month}` : ""]
    .filter(Boolean)
    .join(" · ");

  return {
    metadataBase: new URL(INVITE_URL),
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "invite.ghawi.app",
      title,
      description,
      url: `/${slug}`,
      locale: "ar_SY",
      images: [{ url: "/invite/og.png?v=2", width: 1200, height: 630, alt: "شعار أ إ" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/invite/og.png?v=2"] },
    icons: { icon: [{ url: "/invite/icon.svg?v=2", type: "image/svg+xml" }] },
    formatDetection: { telephone: false, date: false, address: false },
  };
}

export async function generateViewport({ params }: Params): Promise<Viewport> {
  const { slug } = await params;
  const found = await resolve(slug);
  const theme = found?.guest?.theme ?? found?.config.theme ?? "navy";
  return { themeColor: PAPER[theme], colorScheme: "light dark" };
}

export default async function InvitePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  // The admin previews a look before saving it: ?preview=1&theme=blush&font=kufi&metal=silver.
  const query = await searchParams;
  const previewTheme = query.preview !== undefined && isInviteTheme(query.theme) ? query.theme : null;
  const previewFont = query.preview !== undefined && isInviteFont(query.font) ? query.font : null;
  const previewMetal = query.preview !== undefined && isInviteMetal(query.metal) ? query.metal : null;
  // Theme and font previews are cosmetic; the thank-you page and its photos
  // before the wedding is over are for the signed-in admin only.
  const previewEnded = query.preview !== undefined && query.ended !== undefined && (await isAdminSession());
  const found = await resolve(slug);
  if (!found) notFound();

  const { config, guest } = found;
  const db = await inviteDb();
  const [rsvp, logo, song] = await Promise.all([guest ? loadRsvp(db, guest.id) : null, logoVersion(db), loadSong(db)]);
  const songUrl = song ? `/api/invite/song?v=${song.version}` : null;
  const logoUrl = logo ? `/api/invite/logo?v=${encodeURIComponent(logo)}` : null;
  const theme = previewTheme ?? guest?.theme ?? config.theme;
  const font = previewFont ?? config.font;
  const metal = previewMetal ?? config.metal;

  // After the wedding day (or when the admin ends it): the thank-you page.
  if (previewEnded || isEnded(config)) {
    const photos = config.galleryEnabled ? await loadPhotos(db, audiencesFor(guest ? partiesOf(guest.parties) : null), "ended") : [];
    return <Ended config={config} theme={theme} font={font} metal={metal} logoUrl={logoUrl} photos={photos} slug={slug} />;
  }

  const parties = guest ? partiesOf(guest.parties) : PARTY_KEYS;
  const photos = await loadPhotos(db, audiencesFor(guest ? parties : null), "invite");

  return (
    <Invitation
      config={config}
      guest={guest}
      parties={parties}
      photos={photos}
      theme={theme}
      font={font}
      metal={metal}
      rsvp={rsvp}
      rsvpClosed={rsvpClosed(config)}
      logoUrl={logoUrl}
      songUrl={songUrl}
      slug={slug}
    />
  );
}
