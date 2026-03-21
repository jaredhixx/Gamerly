import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";

import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Games Releasing This Week",
  description: "Video games releasing this week across all platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/games-releasing-this-week")
  }
};

function isThisWeek(dateString: string | null) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  const startOfWeek = new Date(today);
  startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

export default async function GamesReleasingThisWeekPage() {
  const games = await fetchGames();

  const weekGames = games.filter((g: any) =>
    isThisWeek(g.releaseDate)
  );

  return (
    <main>
      <h1>Games Releasing This Week</h1>

      {weekGames.length > 0 ? (
        <GameGrid games={weekGames.slice(0, 60)} />
      ) : (
        <p>No major games releasing this week.</p>
      )}
    </main>
  );
}