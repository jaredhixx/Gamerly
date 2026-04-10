import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../../components/game/GameGrid";
import { fetchGames } from "../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import { genres } from "../../../lib/genres";

export async function generateStaticParams() {
  return Object.keys(genres).map((genre) => ({
    genre,
  }));
}

export const revalidate = 21600;

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const genre = params?.genre;

  const name = genres[genre as keyof typeof genres];

  if (!name) {
    return { title: "Game Genres" };
  }

  return {
    title: `Best ${name} Games Worth Playing Right Now`,
    description: `Looking for the best ${name.toLowerCase()} games worth playing right now? Browse top rated picks, new releases, and upcoming games to quickly find the strongest options.`,
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
  Best {name} Games Worth Playing Right Now
</h1>

<p
  style={{
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#b8c0d4",
    maxWidth: "800px",
    margin: "0 auto 20px auto",
    textAlign: "center"
  }}
>
  Trying to find the best {name.toLowerCase()} games that are actually worth your time? This page highlights the strongest options right now, including top rated games, new releases, and upcoming titles, so you can quickly decide what is worth playing without digging through low-quality picks.
</p>

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
    gap: "12px",
    marginBottom: "16px"
  }}
>
  <Link
    href={`/best-${genre}-games-pc-2025`}
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
    Best {name} Games on PC (2025)
  </Link>

  <Link
    href={`/best-${genre}-games-playstation-2025`}
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
    Best {name} Games on PlayStation (2025)
  </Link>

  <Link
    href={`/best-${genre}-games-xbox-2025`}
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
    Best {name} Games on Xbox (2025)
  </Link>

  <Link
    href={`/best-${genre}-games-switch-2025`}
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
    Best {name} Games on Switch (2025)
  </Link>
</div>

<h3
  style={{
    fontSize: "18px",
    fontWeight: 700,
    marginTop: 0,
    marginBottom: "12px"
  }}
>
  Best {name} Games by Platform (2026)
</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "28px"
  }}
>
  <Link
    href={`/best-${genre}-games-pc-2026`}
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
    Best {name} Games on PC (2026)
  </Link>

  <Link
    href={`/best-${genre}-games-playstation-2026`}
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
    Best {name} Games on PlayStation (2026)
  </Link>

  <Link
    href={`/best-${genre}-games-xbox-2026`}
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
    Best {name} Games on Xbox (2026)
  </Link>

  <Link
    href={`/best-${genre}-games-switch-2026`}
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
    Best {name} Games on Switch (2026)
  </Link>
</div>

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