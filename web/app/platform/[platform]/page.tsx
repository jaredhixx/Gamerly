import { Metadata } from "next";
import GameGrid from "../../../components/game/GameGrid";
import { fetchGames } from "../../../lib/igdb";
import { platforms } from "../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import Link from "next/link";

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
    title: `${platformConfig.name.replace(" Games", "")} Games - New, Upcoming, and Top Rated`,
    description: `Browse ${platformConfig.name.toLowerCase()} games including new releases, upcoming games, top rated titles, and genre pages with release dates, ratings, and screenshots.`,
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

  const games = await fetchGames();

  const platformLabel = platformConfig.name.replace(" Games", "");

  const filtered = games.filter((g: any) =>
    g.platformSlugs?.includes(platformConfig.slug)
  );

  const topRated = [...filtered]
    .filter((g: any) => (g.aggregated_rating ?? 0) > 0)
    .sort((a: any, b: any) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0))
    .slice(0, 8);

  const upcoming = [...filtered]
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) > new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    )
    .slice(0, 8);

  const newReleases = [...filtered]
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) <= new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )
    .slice(0, 8);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
        {platformLabel} Games
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
        Discover {platformLabel.toLowerCase()} games in one place. Browse new releases,
        upcoming games, top rated titles, and genre pages to find what to play next.
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
        top rated picks, and broader discovery pages.
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
              href={`/platform/${platformConfig.slug}/page/2`}
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
              Browse More {platformLabel} Games
            </Link>
          </li>
        </ul>
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
                    <GameGrid games={topRated} />

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
              View all top rated {platformLabel} games →
            </Link>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
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
                    <GameGrid games={upcoming} />

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
              View all upcoming {platformLabel} games →
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
          <GameGrid games={newReleases} />

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
              View all new {platformLabel} games →
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          All {platformLabel} Games
        </h2>

        <GameGrid games={filtered.slice(0, 60)} />

        {filtered.length > 60 && (
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
              Browse more {platformLabel} games →
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
          Popular {platformLabel} Genres
        </h2>

<p
  style={{
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#8f99ad",
    marginBottom: "12px"
  }}
>
  Explore {platformLabel} games by genre to find the best titles based on
  what you actually want to play, whether that is{" "}
  <Link
    href={`/platform/${platformConfig.slug}/rpg`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    RPG games on {platformLabel}
  </Link>
  ,{" "}
  <Link
    href={`/platform/${platformConfig.slug}/shooter`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    shooter games on {platformLabel}
  </Link>
  ,{" "}
  <Link
    href={`/platform/${platformConfig.slug}/strategy`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    strategy games on {platformLabel}
  </Link>
  ,{" "}
  <Link
    href={`/platform/${platformConfig.slug}/adventure`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    adventure games on {platformLabel}
  </Link>
  ,{" "}
  <Link
    href={`/platform/${platformConfig.slug}/indie`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    indie games on {platformLabel}
  </Link>
  , and{" "}
  <Link
    href={`/platform/${platformConfig.slug}/simulation`}
    style={{ color: "#6aa6ff", fontWeight: 600, textDecoration: "underline" }}
  >
    simulation games on {platformLabel}
  </Link>
  .
</p>

        <ul style={{ lineHeight: "32px", marginBottom: "28px" }}>
          <li>
            <Link href={`/platform/${platformConfig.slug}/rpg`}>
              Best RPG Games on {platformLabel}
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/shooter`}>
              Best Shooter Games on {platformLabel}
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/strategy`}>
              Best Strategy Games on {platformLabel}
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/adventure`}>
              Best Adventure Games on {platformLabel}
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/indie`}>
              Best Indie Games on {platformLabel}
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/simulation`}>
              Best Simulation Games on {platformLabel}
            </Link>
          </li>
        </ul>

        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            maxWidth: "900px"
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "16px"
            }}
          >
            About {platformLabel} Games
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
            <Link href="/new-games">new games</Link>,{" "}
            <Link href="/upcoming-games">upcoming games</Link>,{" "}
            <Link href="/games-releasing-this-month">games releasing this month</Link>,{" "}
            and the current <Link href="/hype">most hyped games</Link> across all
            platforms.
          </p>
        </div>
      </section>
    </main>
  );
}