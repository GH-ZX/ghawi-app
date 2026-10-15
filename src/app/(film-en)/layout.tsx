import { FilmDocument } from "@/components/film/film-document";

export default function FilmEnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilmDocument lang="en" dir="ltr">
      {children}
    </FilmDocument>
  );
}