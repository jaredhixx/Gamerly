import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../../components/game/GameGrid";
import { fetchGames } from "../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import { genres } from "../../../lib/genres";

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const genre = params?.genre;

  const name = genres[genre as keyof typeof genres];

  if (!name) {
    return { title: "Game Genres" };
  }

  return {
    title: `${name} Games`,
    description: `Browse ${name.toLowerCase()} games including release dates, screenshots, ratings, and more.`,
    alternates: {
      canonical: buildCanonicalUrl(`/genre/${genre}`)
    }
  };
}

export default async function GenrePage(props: any) {
  const params = await props.params;
  const genre = params?.genre;

  const name = genres[genre as keyof typeof genres];

  if (!name) {
    notFound();
  }

  const games = await fetchGames();

  const filtered = games.filter((g: any) =>
    g.genreSlugs?.includes(genre)
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
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        {name} Games
      </h1>

      <section
  style={{
    marginBottom: "40px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.02)"
  }}
>
  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>
    Browse {name} Games
  </h2>

  <p
    style={{
      fontSize: "14px",
      lineHeight: 1.7,
      color: "#8f99ad",
      marginBottom: "16px"
    }}
  >
    Explore {name.toLowerCase()} games by release timing and rating to quickly find what is worth playing right now.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px"
    }}
  >
    <Link
      href={`/genre/${genre}`}
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
      All {name} Games
    </Link>

    <Link
      href={`/genre/${genre}/top-rated`}
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
      Top Rated {name} Games
    </Link>

    <Link
      href={`/genre/${genre}/upcoming`}
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
      Upcoming {name} Games
    </Link>

    <Link
      href={`/genre/${genre}/new`}
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
      New {name} Games
    </Link>
  </div>
</section>

      {filtered.length === 0 && <p>No {name.toLowerCase()} games found.</p>}

      {topRated.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
            Top Rated {name} Games
          </h2>
          <GameGrid games={topRated} />
        </section>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
            Upcoming {name} Games
          </h2>
          <GameGrid games={upcoming} />
        </section>
      )}

      {newReleases.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
            New {name} Games
          </h2>
          <GameGrid games={newReleases} />
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          All {name} Games
        </h2>

        <GameGrid games={filtered.slice(0, 24)} />

        {filtered.length > 24 && (
          <div style={{ marginTop: "24px" }}>
            <Link
              href={`/genre/${genre}/page/2`}
              style={{
                color: "#6aa6ff",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              Browse more {name} games →
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
          Browse {name} Games by Platform
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
          Explore {name.toLowerCase()} games on each major platform to find the
          strongest releases for PC, PlayStation, Xbox, and Nintendo Switch.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "28px"
          }}
        >
          <Link
            href={`/platform/pc/${genre}`}
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
            PC {name} Games
          </Link>

          <Link
            href={`/platform/playstation/${genre}`}
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
            PlayStation {name} Games
          </Link>

          <Link
            href={`/platform/xbox/${genre}`}
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
            Xbox {name} Games
          </Link>

          <Link
            href={`/platform/switch/${genre}`}
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
            Nintendo Switch {name} Games
          </Link>
        </div>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#8f99ad",
            maxWidth: "900px",
            marginBottom: 0
          }}
        >
          You can also explore broader discovery pages like{" "}
          <Link href="/platforms">all platforms</Link>,{" "}
          <Link href="/genres">all genres</Link>,{" "}
          <Link href="/new-games">new games</Link>,{" "}
          <Link href="/upcoming-games">upcoming games</Link>,{" "}
          <Link href="/games-releasing-this-month">games releasing this month</Link>,{" "}
          and <Link href="/hype">most hyped games</Link>.
        </p>

        <section style={{ marginTop: "60px" }}>
  <h2
    style={{
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "16px"
    }}
  >
    Explore Other Genres
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
    Discover more game genres to expand your search beyond {name.toLowerCase()} games and find new experiences across the full catalog.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px"
    }}
  >
    {Object.entries(genres)
      .filter(([slug]) => slug !== genre)
      .map(([slug, label]) => (
        <Link
          key={slug}
          href={`/genre/${slug}`}
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
          {label} Games
        </Link>
      ))}
  </div>
</section>
      </section>
    </main>
  );
}