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

function isReleased(date?: string | null) {
  if (!date) {
    return false;
  }

  return new Date(date) <= new Date();
}

function getGenrePreviewGames(games: any[], genreSlug: string) {
  return [...games]
    .filter((game) => {
      if (!game.genreSlugs?.includes(genreSlug)) {
        return false;
      }

      if (!isReleased(game.releaseDate)) {
        return false;
      }

      const rating = game.aggregated_rating ?? 0;
      const ratingCount = game.aggregated_rating_count ?? 0;

      return rating >= 70 && ratingCount >= 1;
    })
    .sort((a, b) => {
      const ratingA = a.aggregated_rating ?? 0;
      const ratingB = b.aggregated_rating ?? 0;
      const countA = a.aggregated_rating_count ?? 0;
      const countB = b.aggregated_rating_count ?? 0;

      const weightedA = ratingA + Math.min(countA, 20) * 0.35;
      const weightedB = ratingB + Math.min(countB, 20) * 0.35;

      const weightedDiff = weightedB - weightedA;

      if (weightedDiff !== 0) {
        return weightedDiff;
      }

      const ratingDiff = ratingB - ratingA;

      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return countB - countA;
    })
    .slice(0, 8);
}

export default async function GenresPage() {
  const { games } = await getDerivedGameData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        Browse Video Games by Genre
      </h1>

      {genres.map((genre) => {
                const genreGames = getGenrePreviewGames(games, genre.slug);

        if (genreGames.length === 0) return null;

        return (
          <section key={genre.slug} style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
              {genre.name}
            </h2>

            <GameGrid games={genreGames} />

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexWrap: "wrap",
                gap: "16px"
              }}
            >
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

              <Link
                href={
                  genre.slug === "sport"
                    ? "/best-sports-games"
                    : `/best-${genre.slug}-games`
                }
                style={{
                  color: "#6aa6ff",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                View best {genre.name.toLowerCase()} →
              </Link>
            </div>
          </section>
        );
      })}
    </main>
  );
}