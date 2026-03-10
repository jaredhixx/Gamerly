import { Metadata } from "next";
import Link from "next/link";
import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";

export const metadata: Metadata = {
  title: "Video Game Genres | Gamerly",
  description:
    "Discover video games by genre including RPG, shooter, strategy, adventure, simulation, and more."
};

const genres = [
  { name: "RPG Games", slug: "rpg", match: "rpg" },
  { name: "Shooter Games", slug: "shooter", match: "shooter" },
  { name: "Strategy Games", slug: "strategy", match: "strategy" },
  { name: "Adventure Games", slug: "adventure", match: "adventure" },
  { name: "Simulation Games", slug: "simulation", match: "simulation" },
  { name: "Puzzle Games", slug: "puzzle", match: "puzzle" },
  { name: "Indie Games", slug: "indie", match: "indie" },
  { name: "Fighting Games", slug: "fighting", match: "fighting" },
  { name: "Racing Games", slug: "racing", match: "racing" },
  { name: "Sports Games", slug: "sport", match: "sport" }
];

export default async function GenresPage() {

  const games = await fetchGames();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        Browse Video Games by Genre
      </h1>

      {genres.map((genre) => {

        const genreGames = games
          .filter((g) =>
            g.genres?.some((gen) =>
              gen.toLowerCase().includes(genre.match)
            )
          )
          .slice(0, 8);

        if (genreGames.length === 0) return null;

        return (
          <section key={genre.slug} style={{ marginBottom: "60px" }}>

            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
              {genre.name}
            </h2>

            <GameGrid games={genreGames} />

            <div style={{ marginTop: "16px" }}>
              <Link
                href={`/genre/${genre.slug}`}
                style={{
                  color: "#6aa6ff",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Browse all {genre.name} →
              </Link>
            </div>

          </section>
        );

      })}

    </main>
  );
}