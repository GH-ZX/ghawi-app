import { readFile, siteDb } from "@/lib/site-server";

/*
 * /cv/ahmed-ghawi-cv.pdf and /cv/ahmed-ghawi-cv-ar.pdf — "Download PDF" on the
 * CV page. The PDF uploaded in Admin → Site → CV if there is one, else the one
 * bundled with the site (public/media/cv). One stable address to share.
 */

export const dynamic = "force-dynamic";

const FILES = {
  "ahmed-ghawi-cv.pdf": { key: "cv-en", bundled: "/media/cv/ahmed-ghawi-cv-en.pdf" },
  "ahmed-ghawi-cv-ar.pdf": { key: "cv-ar", bundled: "/media/cv/ahmed-ghawi-cv-ar.pdf" },
} as const;

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const entry = FILES[file as keyof typeof FILES];
  if (!entry) return new Response("Not found", { status: 404 });

  const db = await siteDb();
  const uploaded = db ? await readFile(db, entry.key).catch(() => null) : null;
  if (!uploaded) {
    return Response.redirect(new URL(entry.bundled, request.url), 302);
  }

  return new Response(uploaded.data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${file}"`,
      "Cache-Control": "public, max-age=300",
      "Last-Modified": new Date(uploaded.updatedAt).toUTCString(),
    },
  });
}
