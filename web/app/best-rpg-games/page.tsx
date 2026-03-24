import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGenreGamesPage from "../../components/seo/BestGenreGamesPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best RPG Games (2026)",
    description:
      "Discover the best RPG games to play right now, including top-rated role-playing games across all platforms.",
    alternates: {
      canonical: buildCanonicalUrl("/best-rpg-games"),
    },
  };
}

export default async function BestRPGGamesPage() {
  return (
    <BestGenreGamesPage
      genreSlug="rpg"
      pageTitle="Best RPG Games"
      pageSubtitle="Top-rated role-playing games across all platforms, ranked by quality and popularity."
      introParagraphOne="RPG games (role-playing games) are some of the most immersive experiences in gaming, offering deep progression systems, expansive worlds, and meaningful player choices. Whether you prefer story-driven adventures, open-world exploration, or tactical combat, the best RPG games deliver hundreds of hours of engaging gameplay."
      introParagraphTwo="This list ranks the best RPG games available right now based on a combination of critic ratings, player popularity, and overall impact. From modern releases to all-time classics, these are the RPGs worth playing across all platforms."
      exploreHeading="Explore More RPG Pages"
      topSectionHeading="Top RPG Games Right Now"
      topSectionIntro="These are the standout RPG games available right now, selected based on a combination of critical reception, player engagement, and overall impact. If you are looking for the best RPGs to play today, this is where to start."
      fullListHeading="Full List of Best RPG Games"
    />
  );
}