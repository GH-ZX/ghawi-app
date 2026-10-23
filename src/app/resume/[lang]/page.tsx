import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CvSheet } from "@/components/cv/cv-sheet";
import { DownloadIcon, GlobeIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { PrintButton } from "@/components/site/print-button";
import { Track } from "@/components/site/track";
import { CV_URL, defaultLocale, isLocale, PORTRAIT, SITE_URL, type Locale } from "@/lib/content";
import { contactUrls } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-server";

type Params = { params: Promise<{ lang: string }> };

const cvUrl = (locale: Locale) => `${CV_URL}${locale === "ar" ? "/ar" : ""}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const { cv } = (await getSiteContent())[locale];
  return {
    metadataBase: new URL(CV_URL),
    title: cv.title,
    description: cv.description,
    alternates: { canonical: cvUrl(locale), languages: { en: cvUrl("en"), ar: cvUrl("ar"), "x-default": cvUrl("en") } },
    openGraph: { type: "profile", title: cv.title, description: cv.description, url: cvUrl(locale), images: [`${SITE_URL}/og.png`] },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  };
}

/**
 * cv.ghawi.app: the CV as a document. Edited in the CV builder
 * (cv.ghawi.app/edit); "Download PDF" serves the PDF published there.
 */
export default async function ResumePage({ params }: Params) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const content = await getSiteContent();
  const t = content[lang];
  const { cv } = t;
  const other: Locale = lang === "en" ? "ar" : "en";

  // On cv.ghawi.app the addresses are short; anywhere else (development) they live under /resume.
  const host = (await headers()).get("host") ?? "";
  const onCvHost = host.startsWith("cv.");
  const otherHref = onCvHost ? (other === "ar" ? "/ar" : "/") : `/resume/${other}`;
  const pdf = `${onCvHost ? "" : "/cv"}/${lang === "ar" ? "ahmed-ghawi-cv-ar.pdf" : "ahmed-ghawi-cv.pdf"}`;
  const site = process.env.NODE_ENV === "production" ? `${SITE_URL}/${lang}` : `/${lang}`;

  const urls = contactUrls(content.profile);
  const structured = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: cvUrl(lang),
    mainEntity: {
      "@type": "Person",
      name: content.profile.fullName,
      alternateName: [content.profile.name, content.profile.nameAr, content.profile.fullNameAr],
      jobTitle: t.person.role,
      image: `${SITE_URL}${PORTRAIT}`,
      email: `mailto:${content.profile.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Aleppo", addressCountry: "SY" },
      sameAs: [`${SITE_URL}/${lang}`, urls.github, urls.linkedin, urls.telegram],
    },
  };

  return (
    <div className="cv-page">
      <nav className="cv-bar" aria-label={cv.title} dir="ltr">
        <a className="cv-bar__brand" href={site}>
          <Logo height={18} />
          {cv.labels.back}
        </a>
        <span className="cv-bar__actions">
          <a className="btn btn--xs btn--ghost press" href={otherHref} hrefLang={other} lang={other}>
            <GlobeIcon size={15} />
            {cv.labels.other}
          </a>
          <PrintButton label={cv.labels.print} />
          <a className="btn btn--xs press" href={pdf} data-track="cv-pdf">
            <DownloadIcon size={15} />
            {cv.labels.download}
          </a>
        </span>
      </nav>

      <CvSheet cv={cv} profile={content.profile} locale={lang} location={t.person.location} />

      <Track locale={lang} path={`/${lang}/cv`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    </div>
  );
}
