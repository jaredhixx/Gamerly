import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";

export const metadata: Metadata = {
  title: "Upcoming Xbox Games",
  description:
    "Discover upcoming Xbox games including release dates, screenshots, ratings, and more."
};

export default async function UpcomingXboxGamesPage() {
  const { upcomingGames } = await getDerivedGameData();

  const xboxUpcoming = upcomingGames.filter((g) =>
    g.platformSlugs?.includes("xbox")
  );

  return (
    <main>
      <h1>Upcoming Xbox Games</h1>

      {xboxUpcoming.length > 0 ? (
        <GameGrid games={xboxUpcoming.slice(0, 60)} />
      ) : (
        <p>No upcoming Xbox games found.</p>
      )}
    </main>
  );
}