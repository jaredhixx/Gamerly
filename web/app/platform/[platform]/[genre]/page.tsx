import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameGrid from "../../../../components/game/GameGrid";
import { genres } from "../../../../lib/genres";
import { fetchGames } from "../../../../lib/igdb";
import { platforms } from "../../../../lib/platforms";
import { buildCanonicalUrl } from "../../../../lib/site";

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const platform = params?.platform;
  const genre = params?.genre;

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  const genreName = genres[genre?.toLowerCase() as keyof typeof genres];

  if (!platformConfig || !genreName) {
    return {
      title: "Games"
    };
  }

  const platformLabel = platformConfig.name.replace(" Games", "");

  return {
    title: `Best ${genreName} Games on ${platformLabel} 2026 | Top Rated, New, Upcoming`,
    description: `Browse the best ${genreName.toLowerCase()} games on ${platformLabel} with top rated picks, new releases, upcoming titles, screenshots, and release dates.`,
    alternates: {
      canonical: buildCanonicalUrl(
        `/platform/${platformConfig.slug}/${genre}`
      )
    }
  };
}

export default async function PlatformGenrePage(props: any) {
  const params = await props.params;
  const platform = params?.platform;
  const genre = params?.genre;

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  const genreName = genres[genre?.toLowerCase() as keyof typeof genres];

  if (!platformConfig || !genreName) {
    notFound();
  }

  const platformLabel = platformConfig.name.replace(" Games", "");

  const games = await fetchGames();

  const filtered = games.filter((g: any) => {
    const matchesPlatform = g.platformSlugs?.includes(platformConfig.slug);
    const matchesGenre = g.genreSlugs?.includes(genre);
    return matchesPlatform && matchesGenre;
  });

  const topRated = [...filtered]
    .filter((g: any) => (g.aggregated_rating ?? 0) > 0)
    .sort(
      (a: any, b: any) =>
        (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0)
    )
    .slice(0, 8);

  const upcoming = [...filtered]
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) > new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.releaseDate).getTime() -
        new Date(b.releaseDate).getTime()
    )
    .slice(0, 8);

  const newReleases = [...filtered]
    .filter((g: any) => {
      if (!g.releaseDate) return false;
      return new Date(g.releaseDate) <= new Date();
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.releaseDate).getTime() -
        new Date(a.releaseDate).getTime()
    )
    .slice(0, 8);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        {genreName} Games on {platformLabel}
      </h1>

<p
  style={{
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#b8c0d4",
    maxWidth: "800px",
    marginBottom: "16px"
  }}
>
  Looking for the best {genreName.toLowerCase()} games on {platformLabel}? This
  page highlights top rated titles, new releases, and upcoming games so you can
  quickly find what to play next.
</p>

<p
  style={{
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#8f99ad",
    maxWidth: "800px",
    marginBottom: "20px"
  }}
>
  Whether you are searching for popular {genreName.toLowerCase()} games,
  critically acclaimed releases, or new and upcoming titles on {platformLabel},
  this page organizes everything in one place for easy discovery.
</p>

      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "#8f99ad",
          marginBottom: "32px"
        }}
      >
        Showing {filtered.length} {genreName.toLowerCase()} games on{" "}
        {platformLabel}.
      </p>

      {topRated.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Top Rated {genreName} Games on {platformLabel}
          </h2>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            The highest rated {genreName.toLowerCase()} games currently available on{" "}
            {platformLabel}.
          </p>

          <GameGrid games={topRated} />
        </section>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Upcoming {genreName} Games on {platformLabel}
          </h2>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            New {genreName.toLowerCase()} releases on {platformLabel} that are
            scheduled to launch soon.
          </p>

          <GameGrid games={upcoming} />
        </section>
      )}

      {newReleases.length > 0 && (
        <section style={{ marginBottom: "50px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            New {genreName} Games on {platformLabel}
          </h2>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#8f99ad",
              marginBottom: "20px"
            }}
          >
            Recently released {genreName.toLowerCase()} games on {platformLabel} you
            can browse right now.
          </p>

          <GameGrid games={newReleases} />
        </section>
      )}

      <section style={{ marginBottom: "50px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          All {genreName} Games on {platformLabel}
        </h2>

        {filtered.length > 0 ? (
          <GameGrid games={filtered.slice(0, 24)} />
        ) : (
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#b8c0d4"
            }}
          >
            No {genreName.toLowerCase()} games found on {platformLabel} yet.
          </p>
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
          Explore More
        </h2>

        <ul style={{ lineHeight: "32px" }}>
          <li>
            <Link href={`/platform/${platformConfig.slug}`}>
              All {platformLabel} Games
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/top-rated`}>
              Top Rated {platformLabel} Games
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/upcoming`}>
              Upcoming {platformLabel} Games
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformConfig.slug}/new`}>
              New {platformLabel} Games
            </Link>
          </li>
          <li>
            <Link href={`/genre/${genre}`}>
              All {genreName} Games
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}