import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../../../components/game/GameGrid";
import { fetchGames } from "../../../../lib/igdb";
import { platforms } from "../../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../lib/site";

const platformGenreLinks = [
  { slug: "rpg", label: "RPG" },
  { slug: "shooter", label: "Shooter" },
  { slug: "adventure", label: "Adventure" },
  { slug: "strategy", label: "Strategy" },
  { slug: "simulation", label: "Simulation" },
  { slug: "puzzle", label: "Puzzle" },
  { slug: "indie", label: "Indie" },
  { slug: "fighting", label: "Fighting" },
  { slug: "racing", label: "Racing" },
  { slug: "sport", label: "Sports" }
];

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

      <p style={{ color: "#A7B1C6", marginBottom: "20px", maxWidth: "800px" }}>
        Discover new {platformLabel.toLowerCase()} games recently released, including the latest titles available right now. 
        This page helps you track what is new, trending, and worth playing across the {platformLabel.toLowerCase()} platform.
      </p>

      <section
  style={{
    marginBottom: "28px",
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.02)"
  }}
>
  <h2
    style={{
      fontSize: "20px",
      fontWeight: 700,
      marginBottom: "10px"
    }}
  >
    Latest {platformLabel} Releases
  </h2>

  <p
    style={{
      fontSize: "15px",
      lineHeight: 1.7,
      color: "#b8c0d4",
      marginBottom: "10px"
    }}
  >
    This page tracks new {platformLabel.toLowerCase()} games sorted by the most
    recent release date so you can quickly see what is already out and worth
    checking next.
  </p>

  <p
    style={{
      fontSize: "14px",
      lineHeight: 1.7,
      color: "#8f99ad",
      marginBottom: 0
    }}
  >
    You can also explore{" "}
    <Link href={`/platform/${platformConfig.slug}`}>
      all {platformLabel.toLowerCase()} games
    </Link>
    ,{" "}
    <Link href={`/platform/${platformConfig.slug}/upcoming`}>
      upcoming releases
    </Link>
    ,{" "}
    <Link href={`/platform/${platformConfig.slug}/top-rated`}>
      top rated games
    </Link>
    , and the genre links below to narrow the list further.
  </p>
</section>

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

      <section style={{ marginTop: "56px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "16px"
          }}
        >
          Explore More {platformLabel} Game Pages
        </h2>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#8f99ad",
            marginBottom: "18px",
            maxWidth: "900px"
          }}
        >
          Browse more {platformLabel.toLowerCase()} game pages, including the
          main {platformLabel.toLowerCase()} games hub, upcoming {platformLabel.toLowerCase()} games,
          top rated {platformLabel.toLowerCase()} games, and {platformLabel.toLowerCase()} genre pages.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "24px"
          }}
        >
          <Link
            href={`/platform/${platformConfig.slug}`}
            style={{
              display: "block",
              padding: "14px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#f5f7fb",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontWeight: 600
            }}
          >
            All {platformLabel} Games
          </Link>

          <Link
            href={`/platform/${platformConfig.slug}/upcoming`}
            style={{
              display: "block",
              padding: "14px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#f5f7fb",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontWeight: 600
            }}
          >
            Upcoming {platformLabel} Games
          </Link>

          <Link
            href={`/platform/${platformConfig.slug}/top-rated`}
            style={{
              display: "block",
              padding: "14px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#f5f7fb",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontWeight: 600
            }}
          >
            Top Rated {platformLabel} Games
          </Link>
        </div>

        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "14px"
          }}
        >
          Browse {platformLabel} by Genre
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          {platformGenreLinks.map((genre) => (
            <Link
              key={genre.slug}
              href={`/platform/${platformConfig.slug}/${genre.slug}`}
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "#f5f7fb",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontWeight: 600
              }}
            >
              {genre.label} Games on {platformLabel}
            </Link>
          ))}
        </div>
      </section>
      <section style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
          Latest {platformLabel} Releases
        </h2>

        <GameGrid games={newReleases.slice(0, 6)} />
      </section>

      <section>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px"
          }}
        >
          Full New {platformLabel} Games List
        </h2>

        <GameGrid games={newReleases.slice(0, 120)} />
      </section>
    </main>
  );
}