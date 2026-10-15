import { AtlasDocument } from "@/components/atlas/atlas-document";

export default function AtlasEnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <AtlasDocument lang="en" dir="ltr">
      {children}
    </AtlasDocument>
  );
}