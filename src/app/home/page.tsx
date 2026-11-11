import { HomeConsole } from "@/components/home/home-console";

/**
 * home.ghawi.app — every ghawi service in one place. A plain page, no sign-in
 * (the owner's call): each admin it links to keeps its own sign-in. Still
 * never indexed (layout metadata and next.config.ts headers).
 */
export default function HomePage() {
  return <HomeConsole />;
}
