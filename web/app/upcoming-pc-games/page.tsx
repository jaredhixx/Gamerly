import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";

export const metadata: Metadata = {
  title: "Upcoming PC Games",
  description:
    "Discover upcoming PC games including release dates, screenshots, ratings, and platforms."
};

export default async function UpcomingPCGamesPage() {
  const { upcomingGames } = await getDerivedGameData();

  const pcUpcoming = upcomingGames.filter((g) =>
    g.platformSlugs?.includes("pc")
  );

  return (
    <main>
      <h1>Upcoming PC Games</h1>

      {pcUpcoming.length > 0 ? (
        <GameGrid games={pcUpcoming.slice(0, 60)} />
      ) : (
        <p>No upcoming PC games found.</p>
      )}
    </main>
  );
}