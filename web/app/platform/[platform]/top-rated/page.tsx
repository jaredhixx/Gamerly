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
    title: `Best ${platformLabel} Games 2026 | Top Rated, Highest Scored, Must Play`,
    description: `Browse the best ${platformLabel.toLowerCase()} games in 2026 ranked by aggregated critic scores, ratings, and top rated must-play titles.`,
    alternates: {
      canonical: buildCanonicalUrl(
        `/platform/${platformConfig.slug}/top-rated`
      )
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
    Best {platformLabel} Games Right Now
  </h2>

  <p
    style={{
      fontSize: "15px",
      lineHeight: 1.7,
      color: "#b8c0d4",
      marginBottom: "10px"
    }}
  >
    This page ranks the best {platformLabel.toLowerCase()} games based on
    aggregated critic scores, player ratings, and overall quality. If you are
    trying to find what is actually worth playing, this is the fastest way to
    see the top performing titles.
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
    <Link href={`/platform/${platformConfig.slug}/upcoming`}>
      upcoming games
    </Link>
    , and browse by genre below to narrow the list further.
  </p>
</section>

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
          Explore more ways to browse {platformLabel.toLowerCase()} games, including
          the main platform hub, newly released games, upcoming titles, and genre
          pages.
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
          {platformGenreLinks.map((genre) => (
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

      <GameGrid games={topRated.slice(0, 120)} />
    </main>
  );
}