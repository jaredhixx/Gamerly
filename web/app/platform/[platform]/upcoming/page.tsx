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
    title: `Upcoming ${platformLabel} Games 2026 | Release Dates, Trailers, Screenshots`,
    description: `Browse upcoming ${platformLabel.toLowerCase()} games in 2026 with release dates, trailers, screenshots, and new releases coming soon.`,
    alternates: {
      canonical: buildCanonicalUrl(
        `/platform/${platformConfig.slug}/upcoming`
      )
    }
  };
}

export default async function PlatformUpcomingPage(props: any) {
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

  const upcoming = filtered
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) > new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.releaseDate).getTime() -
        new Date(b.releaseDate).getTime()
    );

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        Upcoming {platformLabel} Games
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
        Browse upcoming {platformLabel.toLowerCase()} games sorted by release
        date so you can see what is launching next.
      </p>

      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#8f99ad",
          marginBottom: "32px"
        }}
      >
        Showing {upcoming.length} upcoming {platformLabel.toLowerCase()} games.
      </p>

      <GameGrid games={upcoming.slice(0, 120)} />
    </main>
  );
}