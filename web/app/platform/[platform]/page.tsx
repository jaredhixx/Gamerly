import { Metadata } from "next";
import GameGrid from "../../../components/game/GameGrid";
import { getPlatformCatalogSlices } from "../../../lib/igdb";
import { getDerivedGameData } from "../../../lib/game-data";
import { platforms } from "../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import Link from "next/link";

export async function generateStaticParams() {
  return Object.values(platforms).map((platform) => ({
    platform: platform.slug,
  }));
}

export const revalidate = 21600;

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

  const platformConfig = platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig) {
    return {
      title: "Platform Not Found"
    };
  }

return {
  title: `Best ${platformConfig.name} Games Right Now`,
  description: `Find the best ${platformConfig.name.toLowerCase()} games right now. Compare top-rated picks, new releases, upcoming games, and genre pages in one fast discovery hub.`,
  alternates: {
    canonical: buildCanonicalUrl(`/platform/${platformConfig.slug}`)
  }
};
}

export default async function PlatformPage(props: any) {
  const params = await props.params;
  const platform = params?.platform;

  const platformConfig = platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig) {
    notFound();
  }

  const { games } = await getDerivedGameData();

const platformLabel = platformConfig.name;

  const { filtered, released, upcoming } = getPlatformCatalogSlices(
    games,
    platformConfig.slug
  );

  const topRated = released
    .filter((g: any) => (g.aggregated_rating ?? 0) > 0)
    .sort((a: any, b: any) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0))
    .slice(0, 8);

  const upcomingGames = upcoming
    .sort(
      (a: any, b: any) =>
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    )
    .slice(0, 8);

  const newReleases = released
    .sort(
      (a: any, b: any) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )
    .slice(0, 8);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
<h1
  style={{
    fontSize: "32px",
    fontWeight: 800,
    marginBottom: "16px",
    textAlign: "center"
  }}
>
  Best {platformLabel} Games Right Now
</h1>

<p
  style={{
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#b8c0d4",
    maxWidth: "800px",
    margin: "0 auto 16px auto",
    textAlign: "center"
  }}
>
  Compare top-rated {platformLabel.toLowerCase()} games, new releases, and upcoming picks in one place. This page is built for fast discovery, so you can spot the strongest games quickly and skip filler.
</p>

<p
  style={{
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#8f99ad",
    maxWidth: "800px",
    marginBottom: "32px"
  }}
>
  This page currently includes{" "}
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      background: "rgba(106,166,255,0.14)",
      border: "1px solid rgba(106,166,255,0.28)",
      color: "#dbe9ff",
      fontWeight: 700
    }}
  >
    {filtered.length}
  </span>{" "}
  {platformLabel.toLowerCase()} games across new releases, upcoming titles,
  top rated picks, and broader discovery pages. You can also explore{" "}
  <Link href="/genres" style={{ color: "#dbe9ff", fontWeight: 600 }}>
    all game genres
  </Link>{" "}
  and{" "}
  <Link href="/platforms" style={{ color: "#dbe9ff", fontWeight: 600 }}>
    all gaming platforms
  </Link>
  .
</p>

      <section
        style={{
          marginBottom: "50px",
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          Browse {platformLabel}
        </h2>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#8f99ad",
            marginBottom: "16px"
          }}
        >
          Explore the main discovery paths for {platformLabel.toLowerCase()} games.
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
      href={`/best-games-2026`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best Games of 2026
    </Link>
  </li>

  <li>
    <Link
      href={`/best-${platformConfig.slug}-games-2026`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best {platformLabel} Games of 2026
    </Link>
  </li>

  <li>
    <Link
      href={`/best-${platformConfig.slug}-games-2025`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best {platformLabel} Games of 2025
    </Link>
  </li>

  <li>
    <Link
      href={`/best-rpg-games-${platformConfig.slug}-2025`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best RPG Games on {platformLabel}
    </Link>
  </li>

  <li>
    <Link
      href={`/best-shooter-games-${platformConfig.slug}-2025`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best Shooter Games on {platformLabel}
    </Link>
  </li>

  <li>
    <Link
      href={`/best-adventure-games-${platformConfig.slug}-2025`}
      style={{
        display: "block",
        padding: "14px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(106,166,255,0.08)",
        border: "1px solid rgba(106,166,255,0.2)",
        fontWeight: 700
      }}
    >
      Best Adventure Games on {platformLabel}
    </Link>
  </li>
</ul>

<h3
  style={{
    fontSize: "16px",
    fontWeight: 600,
    marginTop: "24px",
    marginBottom: "12px",
    opacity: 0.8
  }}
>
  Previous Year Picks (2025)
</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  }}
>
  <Link
    href={`/best-${platformConfig.slug}-games-2025`}
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
    Best {platformLabel} Games of 2025
  </Link>

  <Link
    href={`/best-rpg-games-${platformConfig.slug}-2025`}
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
    Best RPG Games on {platformLabel}
  </Link>

  <Link
    href={`/best-shooter-games-${platformConfig.slug}-2025`}
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
    Best Shooter Games on {platformLabel}
  </Link>

  <Link
    href={`/best-adventure-games-${platformConfig.slug}-2025`}
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
    Best Adventure Games on {platformLabel}
  </Link>

  <Link
    href={`/best-strategy-games-${platformConfig.slug}-2025`}
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
    Best Strategy Games on {platformLabel}
  </Link>

  <Link
    href={`/best-simulation-games-${platformConfig.slug}-2025`}
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
    Best Simulation Games on {platformLabel}
  </Link>

  <Link
    href={`/best-indie-games-${platformConfig.slug}-2025`}
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
    Best Indie Games on {platformLabel}
  </Link>
</div>

<h3
  style={{
    fontSize: "20px",
    fontWeight: 800,
    marginTop: "0px",
    marginBottom: "12px"
  }}
>
  Best {platformLabel} Games in 2026
</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  }}
>
  <Link
    href={`/best-${platformConfig.slug}-games-2026`}
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
    Best {platformLabel} Games of 2026
  </Link>

  <Link
    href={`/best-rpg-games-${platformConfig.slug}-2026`}
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
    Best RPG Games on {platformLabel} in 2026
  </Link>

  <Link
    href={`/best-shooter-games-${platformConfig.slug}-2026`}
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
    Best Shooter Games on {platformLabel} in 2026
  </Link>

  <Link
    href={`/best-adventure-games-${platformConfig.slug}-2026`}
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
    Best Adventure Games on {platformLabel} in 2026
  </Link>

  <Link
    href={`/best-strategy-games-${platformConfig.slug}-2026`}
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
    Best Strategy Games on {platformLabel} in 2026
  </Link>

  <Link
    href={`/best-simulation-games-${platformConfig.slug}-2026`}
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
    Best Simulation Games on {platformLabel} in 2026
  </Link>

  <Link
    href={`/best-indie-games-${platformConfig.slug}-2026`}
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
    Best Indie Games on {platformLabel} in 2026
  </Link>
</div>

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
            gap: "10px"
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

      {topRated.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Top Rated {platformLabel} Games
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            The highest rated {platformLabel.toLowerCase()} games currently featured on
            Gamerly.
          </p>
                    <GameGrid
                      games={topRated}
                      prioritizedPlatformSlug={platformConfig.slug}
                    />

          <div style={{ marginTop: "16px" }}>
            <Link
              href={`/platform/${platformConfig.slug}/top-rated`}
              style={{
                color: "#6aa6ff",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              View all top rated {platformLabel} games â†’
            </Link>
          </div>
        </section>
      )}

      {upcomingGames.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Upcoming {platformLabel} Games
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            New {platformLabel.toLowerCase()} releases that are scheduled to launch
            soon.
          </p>
                    <GameGrid
                      games={upcomingGames}
                      prioritizedPlatformSlug={platformConfig.slug}
                    />

          <div style={{ marginTop: "16px" }}>
            <Link
              href={`/platform/${platformConfig.slug}/upcoming`}
              style={{
                color: "#6aa6ff",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              View all upcoming {platformLabel} games â†’
            </Link>
          </div>
        </section>
      )}

      {newReleases.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            New {platformLabel} Games
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            Recently released {platformLabel.toLowerCase()} games you can browse right
            now.
          </p>
          <GameGrid
            games={newReleases}
            prioritizedPlatformSlug={platformConfig.slug}
          />

          <div style={{ marginTop: "16px" }}>
            <Link
              href={`/platform/${platformConfig.slug}/new`}
              style={{
                color: "#6aa6ff",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              View all new {platformLabel} games â†’
            </Link>
          </div>
        </section>
      )}

      <section style={{ marginTop: "60px" }}>
  <h2
    style={{
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "16px"
    }}
  >
    Browse Other Platforms
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
    You can also explore games on other major platforms to compare new releases,
    upcoming games, top rated titles, and genre pages across the wider market.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
      marginBottom: "8px"
    }}
  >
    {Object.values(platforms)
      .filter((item) => item.slug !== platformConfig.slug)
      .map((item) => (
        <Link
          key={item.slug}
          href={`/platform/${item.slug}`}
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
          {item.name}
        </Link>
      ))}
  </div>
</section>

      <section>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          All {platformLabel} Games
        </h2>

        <GameGrid
          games={filtered.slice(0, 24)}
          prioritizedPlatformSlug={platformConfig.slug}
        />

        {filtered.length > 24 && (
          <div style={{ marginTop: "24px" }}>
            <Link
              href={`/platform/${platformConfig.slug}/page/2`}
              style={{
                color: "#6aa6ff",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              Browse more {platformLabel} games â†’
            </Link>
          </div>
        )}
      </section>

      <section style={{ marginTop: "60px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "16px"
          }}
        >
          Browse {platformLabel} by Genre
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
          Explore {platformLabel.toLowerCase()} games by genre to narrow the catalog
          around what you actually want to play. You can jump into platform-specific
          pages for RPG, shooter, adventure, strategy, simulation, puzzle, indie,
          fighting, racing, and sports games.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "28px"
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

        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            maxWidth: "900px",
            marginBottom: "24px"
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "16px"
            }}
          >
            Explore More Ways to Browse {platformLabel} Games
          </h2>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#b8c0d4",
              marginBottom: "16px"
            }}
          >
            This page is built to help you discover {platformLabel.toLowerCase()} games
            faster. You can browse top rated titles, recently released games, upcoming
            releases, and genre pages without needing to search through a long database
            one result at a time.
          </p>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#b8c0d4",
              marginBottom: 0
            }}
          >
            For broader discovery, you can also explore{" "}
            <Link href="/platforms">all gaming platforms</Link>,{" "}
            <Link href="/genres">all game genres</Link>,{" "}
            <Link href="/new-games">new games</Link>,{" "}
            <Link href="/upcoming-games">upcoming games</Link>,{" "}
            <Link href="/top-rated">top rated games</Link>,{" "}
            <Link href="/games-releasing-this-month">games releasing this month</Link>,{" "}
            <Link href="/releases">the full release calendar</Link>, and the current{" "}
            <Link href="/hype">most hyped games</Link> across all platforms.
          </p>
        </div>
      </section>
    </main>
  );
}
