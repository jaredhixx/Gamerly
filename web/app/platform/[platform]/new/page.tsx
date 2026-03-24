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
    title: `New ${platformLabel} Games 2026 | Latest Releases, Trailers, Screenshots`,
    description: `Browse new ${platformLabel.toLowerCase()} game releases in 2026 with release dates, trailers, screenshots, and the latest games available now.`,
    alternates: {
      canonical: buildCanonicalUrl(`/platform/${platformConfig.slug}/new`)
    }
  };
}

export default async function PlatformNewPage(props: any) {
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

  const newReleases = filtered
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) <= new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.releaseDate).getTime() -
        new Date(a.releaseDate).getTime()
    );

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        New {platformLabel} Games
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
        Browse new {platformLabel.toLowerCase()} game releases sorted by most
        recent release date.
      </p>

      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#8f99ad",
          marginBottom: "32px"
        }}
      >
        Showing {newReleases.length} new {platformLabel.toLowerCase()} games.
      </p>

      <GameGrid games={newReleases.slice(0, 120)} />
    </main>
  );
}