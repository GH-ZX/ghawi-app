import { FilmDocument } from "@/components/film/film-document";

export default function FilmArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilmDocument lang="ar" dir="rtl">
      {children}
    </FilmDocument>
  );
}