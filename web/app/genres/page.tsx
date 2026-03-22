import { Metadata } from "next";
import Link from "next/link";
import { getDerivedGameData } from "../../lib/game-data";
import GameGrid from "../../components/game/GameGrid";

export const metadata: Metadata = {
  title: "Video Game Genres | Gamerly",
  description:
    "Discover video games by genre including RPG, shooter, strategy, adventure, simulation, and more."
};

const genres = [
  { name: "RPG Games", slug: "rpg" },
  { name: "Shooter Games", slug: "shooter" },
  { name: "Strategy Games", slug: "strategy" },
  { name: "Adventure Games", slug: "adventure" },
  { name: "Simulation Games", slug: "simulation" },
  { name: "Puzzle Games", slug: "puzzle" },
  { name: "Indie Games", slug: "indie" },
  { name: "Fighting Games", slug: "fighting" },
  { name: "Racing Games", slug: "racing" },
  { name: "Sports Games", slug: "sport" }
];

export default async function GenresPage() {
  const { games } = await getDerivedGameData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        Browse Video Games by Genre
      </h1>

      {genres.map((genre) => {
        const genreGames = games
          .filter((g) => g.genreSlugs?.includes(genre.slug as any))
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