import type { Metadata } from "next";
import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SearchPage({ searchParams }: any) {

  const query = searchParams?.q?.toLowerCase().trim() || "";

  let results: Awaited<ReturnType<typeof fetchGames>> = [];

  if (query.length >= 2) {
    const games = await fetchGames();

    for (const game of games) {
      if (!game.name) {
        continue;
      }

      if (game.name.toLowerCase().includes(query)) {
        results.push(game);
      }

      if (results.length >= 60) {
        break;
      }
    }
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>

<h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
  Search Results for &quot;{query}&quot;
</h1>

<p style={{ color: "#9aa3b2", marginBottom: "28px" }}>
  {results.length} games found
</p>

<div className="searchExploreLinks">

  <Link href="/new-games">
    New Games
  </Link>

  <Link href="/upcoming-games">
    Upcoming Games
  </Link>

  <Link href="/top-rated">
    Top Rated Games
  </Link>

  <Link href="/platform/pc">
    PC Games
  </Link>

  <Link href="/platform/playstation">
    PlayStation Games
  </Link>

  <Link href="/genre/rpg">
    RPG Games
  </Link>

  <Link href="/genre/shooter">
    Shooter Games
  </Link>

</div>

      {results.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <div className="searchGrid">
  <GameGrid games={results} />
</div>
      )}

    </main>
  );
}