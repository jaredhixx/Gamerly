import { Metadata } from "next";
import GameGrid from "../../../../components/game/GameGrid";
import { fetchGames } from "../../../../lib/igdb";
import { platforms } from "../../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../lib/site";

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const platform = params?.platform;

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig) {
    return {
      title: "Platform Not Found"
    };
  }

  const platformLabel = platformConfig.name.replace(" Games", "");

  return {
    title: `Top Rated ${platformLabel} Games`,
    description: `Browse the highest rated ${platformLabel.toLowerCase()} games based on aggregated ratings and popularity.`,
    alternates: {
      canonical: buildCanonicalUrl(`/platform/${platformConfig.slug}/top-rated`)
    }
  };
}

export default async function PlatformTopRatedPage(props: any) {
  const params = await props.params;
  const platform = params?.platform;

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig) {
    notFound();
  }

  const platformLabel = platformConfig.name.replace(" Games", "");

  const games = await fetchGames();

  const filtered = games.filter((g: any) =>
    g.platformSlugs?.includes(platformConfig.slug)
  );

  const topRated = filtered
    .filter((g: any) => (g.aggregated_rating ?? 0) > 0)
    .sort((a: any, b: any) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0));

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        Top Rated {platformLabel} Games
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.7,
          color: "#b8c0d4",
          maxWidth: "800px",
          marginBottom: "12px"
        }}
      >
        Browse the highest rated {platformLabel.toLowerCase()} games ranked by
        aggregated scores.
      </p>

      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#8f99ad",
          marginBottom: "32px"
        }}
      >
        Showing {topRated.length} top rated {platformLabel.toLowerCase()} games.
      </p>

      <GameGrid games={topRated.slice(0, 120)} />
    </main>
  );
}