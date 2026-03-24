import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGenreGamesPage from "../../components/seo/BestGenreGamesPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Adventure Games (2026)",
    description:
      "Discover the best adventure games to play right now, including top-rated story-driven and action adventure games across all platforms.",
    alternates: {
      canonical: buildCanonicalUrl("/best-adventure-games"),
    },
  };
}

export default async function BestAdventureGamesPage() {
  return (
    <BestGenreGamesPage
      genreSlug="adventure"
      pageTitle="Best Adventure Games"
      pageSubtitle="Top-rated adventure games across all platforms, ranked by quality and popularity."
      introParagraphOne="Adventure games are built around exploration, discovery, storytelling, and memorable worlds. The best adventure games combine strong pacing, satisfying progression, and immersive settings that keep players engaged from beginning to end."
      introParagraphTwo="This list highlights the best adventure games available right now based on a combination of critic ratings, player popularity, and overall impact. Whether you enjoy narrative-driven journeys, action adventure experiences, or atmospheric exploration, these are the adventure games worth playing."
      exploreHeading="Explore More Adventure Pages"
      topSectionHeading="Top Adventure Games Right Now"
      topSectionIntro="These are the standout adventure games available right now, selected based on a combination of critical reception, player engagement, and overall impact. If you are looking for the best adventure games to play today, this is where to start."
      fullListHeading="Full List of Best Adventure Games"
    />
  );
}