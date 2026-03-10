import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";

export const metadata: Metadata = {
  title: "Upcoming Xbox Games | Gamerly",
  description:
    "Discover upcoming Xbox games including release dates, screenshots, ratings, and more.",
};

function isUpcoming(dateString: string | null) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  return date > today;
}

export default async function UpcomingXboxGamesPage() {
  const games = await fetchGames();

  const xboxUpcoming = games.filter((g: any) =>
    g.platforms.some((p: string) =>
      p.toLowerCase().includes("xbox")
    )
  ).filter((g: any) => isUpcoming(g.releaseDate));

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