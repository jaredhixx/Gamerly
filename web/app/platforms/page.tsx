import { Metadata } from "next";
import Link from "next/link";
import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";

export const metadata: Metadata = {
  title: "Video Game Platforms",
  description:
    "Discover video games by platform including PC, PlayStation, Xbox, Nintendo Switch, iOS, and Android."
};

const platforms = [
  { name: "PC Games", slug: "pc", match: "pc" },
  { name: "PlayStation Games", slug: "playstation", match: "playstation" },
  { name: "Xbox Games", slug: "xbox", match: "xbox" },
  { name: "Nintendo Switch Games", slug: "switch", match: "switch" },
  { name: "iOS Games", slug: "ios", match: "ios" },
  { name: "Android Games", slug: "android", match: "android" }
];

export default async function PlatformsPage() {

  const games = await fetchGames();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>

      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        Browse Video Games by Platform
      </h1>

      {platforms.map((platform) => {

        const platformGames = games
          .filter((g) =>
            g.platforms?.some((p) =>
              p.toLowerCase().includes(platform.match)
            )
          )
          .slice(0, 8);

        if (platformGames.length === 0) return null;

        return (
          <section key={platform.slug} style={{ marginBottom: "60px" }}>

            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
              {platform.name}
            </h2>

            <GameGrid games={platformGames} />

            <div style={{ marginTop: "16px" }}>
              <Link
                href={`/platform/${platform.slug}`}
                style={{
                  color: "#6aa6ff",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Browse all {platform.name} →
              </Link>
            </div>

          </section>
        );

      })}

    </main>
  );
}