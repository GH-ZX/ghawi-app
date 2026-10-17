import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/content";

/**
 * The bare domain. Sends each visitor to their language: the one they picked
 * here before (the `lang` cookie the language switch sets), else the first
 * supported language their browser asks for, else English. Crawlers send no
 * Accept-Language and land on /en, which is also the x-default.
 */
export function GET(request: NextRequest) {
  const target = new URL(`/${pickLocale(request)}`, request.url);
  target.search = request.nextUrl.search;

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("lang")?.value;
  if (saved && isLocale(saved)) return saved;

  // "ar-SY,ar;q=0.9,en-US;q=0.8" → [{ar,1}, {ar,.9}, {en,.8}], best first.
  const ranked = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...attributes] = part.trim().split(";");
      const q = attributes.map((a) => a.trim()).find((a) => a.startsWith("q="));
      return { lang: tag.trim().toLowerCase().split("-")[0], weight: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.lang && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return ranked.map((entry) => entry.lang).find(isLocale) ?? defaultLocale;
}
