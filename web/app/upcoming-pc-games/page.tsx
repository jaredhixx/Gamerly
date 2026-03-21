import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";

export const metadata: Metadata = {
  title: "Upcoming PC Games",
  description:
    "Discover upcoming PC games including release dates, screenshots, ratings, and platforms.",
};

function isUpcoming(dateString: string | null) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  return date > today;
}

export default async function UpcomingPCGamesPage() {
  const games = await fetchGames();

  const pcUpcoming = games.filter((g: any) =>
    g.platforms.some((p: string) => p.toLowerCase().includes("pc"))
  ).filter((g: any) => isUpcoming(g.releaseDate));

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