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

      <p style={{ color: "#A7B1C6", marginBottom: "20px", maxWidth: "800px" }}>
        Discover upcoming {platformLabel.toLowerCase()} games scheduled for release, including highly anticipated titles and new releases coming soon. 
        This page helps you track what is launching next across the {platformLabel.toLowerCase()} platform.
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
          Upcoming {platformLabel} Release Calendar
        </h2>

        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            color: "#b8c0d4",
            marginBottom: "10px"
          }}
        >
          This page tracks upcoming {platformLabel.toLowerCase()} games by release
          date so you can quickly see what is coming next. It is designed to help
          you follow announced launches, plan what to play, and keep up with the
          biggest releases still on the way.
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
          <Link href={`/platform/${platformConfig.slug}/new`}>
            new releases
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
        Showing {upcoming.length} upcoming {platformLabel.toLowerCase()} games.
      </p>

      <section
        style={{
          marginBottom: "32px",
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          Browse More {platformLabel}
        </h2>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#8f99ad",
            marginBottom: "16px"
          }}
        >
          Explore more {platformLabel.toLowerCase()} game pages, including the
          main {platformLabel.toLowerCase()} games hub, new {platformLabel.toLowerCase()} games,
          top rated {platformLabel.toLowerCase()} games, and {platformLabel.toLowerCase()} genre pages.
        </p>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            listStyle: "none",
            padding: 0,
            margin: 0
          }}
        >
          <li>
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
          </li>
          <li>
            <Link
              href={`/platform/${platformConfig.slug}/new`}
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
              New {platformLabel} Games
            </Link>
          </li>
          <li>
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
          </li>
        </ul>

        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginTop: "20px",
            marginBottom: "12px"
          }}
        >
          Browse by Genre
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            marginBottom: "8px"
          }}
        >
          {platformGenreLinks.slice(0, 6).map((genre) => (
            <Link
              key={genre.slug}
              href={`/platform/${platformConfig.slug}/${genre.slug}`}
              style={{
                display: "block",
                padding: "12px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#dbe9ff",
                background: "rgba(106,166,255,0.08)",
                border: "1px solid rgba(106,166,255,0.2)",
                fontWeight: 600,
                fontSize: "14px"
              }}
            >
              {genre.label}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
          Next {platformLabel} Games Releasing Soon
        </h2>

        <GameGrid games={upcoming.slice(0, 6)} />
      </section>

      <section>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px"
          }}
        >
          Full Upcoming {platformLabel} Games List
        </h2>

        <GameGrid games={upcoming.slice(0, 120)} />
      </section>
    </main>
  );
}