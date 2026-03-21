import { Metadata } from "next";
import GameGrid from "../../../components/game/GameGrid";
import { fetchGames } from "../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";

const genres: Record<string, string> = {
  rpg: "Role Playing",
  shooter: "Shooter",
  adventure: "Adventure",
  strategy: "Strategy",
  simulation: "Simulation",
  puzzle: "Puzzle",
  indie: "Indie",
  fighting: "Fighting",
  racing: "Racing",
  sport: "Sports"
};

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const genre = params?.genre;

  const name = genres[genre];

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

  const name = genres[genre];

  if (!name) {
    notFound();
  }

  const games = await fetchGames();

const filtered = games.filter((g: any) =>
  g.genres?.some((gen: string) =>
    gen.toLowerCase().includes(genre)
  )
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

    {filtered.length === 0 && (
      <p>No {name.toLowerCase()} games found.</p>
    )}

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

  <GameGrid games={filtered.slice(0, 60)} />

  {filtered.length > 60 && (
    <div style={{ marginTop: "24px" }}>
      <a
        href={`/genre/${genre}/page/2`}
        style={{
          color: "#6aa6ff",
          fontSize: "14px",
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        Browse more {name} games →
      </a>
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
    Play {name} Games On
  </h2>

  <ul style={{ lineHeight: "32px" }}>
    <li><a href="/platform/pc">PC {name} Games</a></li>
    <li><a href="/platform/playstation">PlayStation {name} Games</a></li>
    <li><a href="/platform/xbox">Xbox {name} Games</a></li>
    <li><a href="/platform/switch">Nintendo Switch {name} Games</a></li>
  </ul>

</section>
  </main>
);
}