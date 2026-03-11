import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";
import Link from "next/link";

export default async function SearchPage({ searchParams }: any) {

  const query = searchParams?.q?.toLowerCase() || "";

  const games = await fetchGames();

  const results = games
    .filter((g) =>
      g.name?.toLowerCase().includes(query)
    )
    .slice(0, 60);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
  Search Results for "{query}"
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