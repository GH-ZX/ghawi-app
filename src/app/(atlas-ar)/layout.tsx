import { AtlasDocument } from "@/components/atlas/atlas-document";

export default function AtlasArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AtlasDocument lang="ar" dir="rtl">
      {children}
    </AtlasDocument>
  );
}