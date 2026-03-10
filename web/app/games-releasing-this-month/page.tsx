import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";

import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Games Releasing This Month | Gamerly",
  description: "Video games releasing this month across PC, PlayStation, Xbox, Switch, and mobile.",
  alternates: {
    canonical: buildCanonicalUrl("/games-releasing-this-month")
  }
};

export default async function GamesThisMonthPage() {

  const games = await fetchGames();

  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonth = games.filter((g: any) => {
    if (!g.releaseDate) return false;

    const release = new Date(g.releaseDate);

    return (
      release.getMonth() === currentMonth &&
      release.getFullYear() === currentYear
    );
  });

  thisMonth.sort((a: any, b: any) =>
    new Date(a.releaseDate).getTime() -
    new Date(b.releaseDate).getTime()
  );

  return (
    <main>
      <h1>Video Games Releasing This Month</h1>

      <p>
Browse the full release calendar:
</p>

<ul>
  <li><a href="/releases/2025/october">October 2025</a></li>
  <li><a href="/releases/2025/november">November 2025</a></li>
  <li><a href="/releases/2025/december">December 2025</a></li>
  <li><a href="/releases/2026/january">January 2026</a></li>
  <li><a href="/releases/2026/february">February 2026</a></li>
</ul>

      <GameGrid games={thisMonth} />
    </main>
  );
}