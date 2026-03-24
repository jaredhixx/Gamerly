import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGenreGamesPage from "../../components/seo/BestGenreGamesPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Shooter Games (2026)",
    description:
      "Discover the best shooter games to play right now, including top-rated FPS and third-person shooter games across all platforms.",
    alternates: {
      canonical: buildCanonicalUrl("/best-shooter-games"),
    },
  };
}

export default async function BestShooterGamesPage() {
  return (
    <BestGenreGamesPage
      genreSlug="shooter"
      pageTitle="Best Shooter Games"
      pageSubtitle="Top-rated shooter games across all platforms, ranked by quality and popularity."
      introParagraphOne="Shooter games remain one of the most popular genres in gaming, from fast-paced competitive FPS games to story-driven third-person action experiences. The best shooter games combine responsive combat, satisfying gunplay, and strong level or multiplayer design."
      introParagraphTwo="This list highlights the best shooter games available right now based on a combination of critic ratings, player popularity, and overall impact. Whether you want tactical precision, arcade action, or cinematic firefights, these are the shooter games worth playing."
      exploreHeading="Explore More Shooter Pages"
      topSectionHeading="Top Shooter Games Right Now"
      topSectionIntro="These are the standout shooter games available right now, selected based on a combination of critical reception, player engagement, and overall impact. If you are looking for the best shooter games to play today, this is where to start."
      fullListHeading="Full List of Best Shooter Games"
    />
  );
}