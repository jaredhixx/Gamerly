import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Upcoming Games",
  description: "Upcoming video game releases across all platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/upcoming-games")
  }
};

export default async function UpcomingGamesPage() {
  const { upcomingGames } = await getDerivedGameData();

  return (
    <main>
      <h1>Upcoming Video Games</h1>
      <GameGrid games={upcomingGames.slice(0, 120)} />
    </main>
  );
}