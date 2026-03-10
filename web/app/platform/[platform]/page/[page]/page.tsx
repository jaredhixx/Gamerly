import { Metadata } from "next";
import GameGrid from "../../../../../components/game/GameGrid";
import { fetchGames } from "../../../../../lib/igdb";
import { platforms } from "../../../../../lib/platforms";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../../lib/site";

const PAGE_SIZE = 60;

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const platform = params?.platform;
  const page = Number(params?.page);

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig || !Number.isInteger(page) || page < 2) {
    return { title: "Platform Not Found | Gamerly" };
  }

  return {
    title: `${platformConfig.name} Games — Page ${page} | Gamerly`,
    description: `Browse ${platformConfig.name.toLowerCase()} games including release dates, ratings, screenshots, and more.`,
    alternates: {
      canonical: buildCanonicalUrl(`/platform/${platformConfig.slug}/page/${page}`)
    }
  };
}

export default async function PlatformPaginationPage(props: any) {
  const params = await props.params;

  const platform = params?.platform;
  const page = Number(params?.page);

  const platformConfig =
    platforms[platform?.toLowerCase() as keyof typeof platforms];

  if (!platformConfig || !Number.isInteger(page) || page < 2) {
    notFound();
  }

  const games = await fetchGames();

  const filtered = games.filter((g: any) =>
    g.platforms?.some((p: string) =>
      p.toLowerCase().includes(platformConfig.slug)
    )
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (page > totalPages) {
    notFound();
  }

  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  if (paginated.length === 0) {
    notFound();
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        {platformConfig.name} Games — Page {page}
      </h1>

      <GameGrid games={paginated} />

      <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
        {page > 2 && (
          <a href={`/platform/${platformConfig.slug}/page/${page - 1}`}>
            Previous
          </a>
        )}

        {page === 2 && (
          <a href={`/platform/${platformConfig.slug}`}>
            Previous
          </a>
        )}

        {page < totalPages && (
          <a href={`/platform/${platformConfig.slug}/page/${page + 1}`}>
            Next
          </a>
        )}
      </div>
    </main>
  );
}