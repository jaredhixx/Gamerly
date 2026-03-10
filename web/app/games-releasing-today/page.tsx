import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";

import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Games Releasing Today | Gamerly",
  description: "Video games releasing today across PC, PlayStation, Xbox, Switch, and mobile.",
  alternates: {
    canonical: buildCanonicalUrl("/games-releasing-today")
  }
};

function isToday(dateString: string | null) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

function isTomorrow(dateString: string | null) {
  if (!dateString) return false;

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const date = new Date(dateString);

  return (
    date.getUTCFullYear() === tomorrow.getUTCFullYear() &&
    date.getUTCMonth() === tomorrow.getUTCMonth() &&
    date.getUTCDate() === tomorrow.getUTCDate()
  );
}

export default async function GamesReleasingTodayPage() {
  const games = await fetchGames();

  const todayGames = games.filter((g: any) => isToday(g.releaseDate));

  const tomorrowGames = games.filter((g: any) =>
    isTomorrow(g.releaseDate)
  );

  return (
    <main>
      <h1>Games Releasing Today</h1>

      {todayGames.length > 0 ? (
        <GameGrid games={todayGames.slice(0, 60)} />
      ) : (
        <p>No major games release today.</p>
      )}

      {tomorrowGames.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>
            Games Releasing Tomorrow
          </h2>

          <GameGrid games={tomorrowGames.slice(0, 24)} />
        </>
      )}
    </main>
  );
}