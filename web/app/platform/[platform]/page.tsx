import { Metadata } from "next";
import GameGrid from "../../../components/game/GameGrid";
import { fetchGames } from "../../../lib/igdb";
import { platforms } from "../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";

export async function generateMetadata(props: any): Promise<Metadata> {

  const params = await props.params;
  const platform = params?.platform;

  const platformConfig = platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig) {
    return {
      title: "Platform Not Found | Gamerly"
    };
  }

  return {
    title: `${platformConfig.name} — New & Upcoming Games | Gamerly`,
    description: `Discover new and upcoming ${platformConfig.name.toLowerCase()} including release dates, ratings, screenshots, and more.`,
    alternates: {
      canonical: buildCanonicalUrl(`/platform/${platform}`)
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

  const filtered = games.filter((g: any) =>
  g.platforms.some((p: string) =>
    p.toLowerCase().includes(platformConfig.slug)
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
      {platformConfig.name} Games
    </h1>

    {topRated.length > 0 && (
      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          Top Rated {platformConfig.name} Games
        </h2>
        <GameGrid games={topRated} />
      </section>
    )}

    {newReleases.length > 0 && (
      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          New {platformConfig.name} Games
        </h2>
        <GameGrid games={newReleases} />
      </section>
    )}

    <section>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
        All {platformConfig.name} Games
      </h2>

  <GameGrid games={filtered.slice(0, 60)} />

      {filtered.length > 60 && (
        <div style={{ marginTop: "24px" }}>
          <a
            href={`/platform/${platform}/page/2`}
            style={{
              color: "#6aa6ff",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Browse more {platformConfig.name} games →
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
    Popular {platformConfig.name} Genres
  </h2>

  <ul style={{ lineHeight: "32px" }}>
    <li>
      <a href="/genre/rpg">
        {platformConfig.name} RPG Games
      </a>
    </li>

    <li>
      <a href="/genre/shooter">
        {platformConfig.name} Shooter Games
      </a>
    </li>

    <li>
      <a href="/genre/strategy">
        {platformConfig.name} Strategy Games
      </a>
    </li>

    <li>
      <a href="/genre/adventure">
        {platformConfig.name} Adventure Games
      </a>
    </li>

    <li>
      <a href="/genre/indie">
        {platformConfig.name} Indie Games
      </a>
    </li>

    <li>
      <a href="/genre/simulation">
        {platformConfig.name} Simulation Games
      </a>
    </li>
  </ul>

</section>
  </main>
);
}