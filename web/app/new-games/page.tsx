import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "New Games",
  description: "Recently released video games across all platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/new-games")
  }
};

export default async function NewGamesPage() {
  const { newGames } = await getDerivedGameData();

  const now = new Date();

  const recent = newGames.filter((g) => {
    if (!g.releaseDate) return false;

    const release = new Date(g.releaseDate);
    const daysAgo = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);

    return daysAgo >= 0 && daysAgo <= 30;
  });

  return (
    <main>
      <h1>New Video Games</h1>
      <GameGrid games={recent.slice(0, 120)} />
    </main>
  );
}