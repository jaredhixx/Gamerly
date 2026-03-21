import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../../../../components/game/GameGrid";
import { fetchGames } from "../../../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../../lib/site";
import { genres } from "../../../../../lib/genres";

const PAGE_SIZE = 60;

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const genre = params?.genre?.toLowerCase();
  const page = Number(params?.page);

  const name = genres[genre as keyof typeof genres];

  if (!name || !Number.isInteger(page) || page < 2) {
    return { title: "Game Genres" };
  }

  return {
    title: `${name} Games — Page ${page}`,
    description: `Browse ${name.toLowerCase()} games including release dates, screenshots, ratings, and more.`,
    alternates: {
      canonical: buildCanonicalUrl(`/genre/${genre}/page/${page}`)
    }
  };
}

export default async function GenrePaginationPage(props: any) {
  const params = await props.params;

  const genre = params?.genre?.toLowerCase();
  const page = Number(params?.page);

  const name = genres[genre as keyof typeof genres];

  if (!name || !Number.isInteger(page) || page < 2) {
    notFound();
  }

  const games = await fetchGames();

  const filtered = games.filter((g: any) =>
    g.genreSlugs?.includes(genre)
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
        {name} Games — Page {page}
      </h1>

      <GameGrid games={paginated} />

      <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
        {page > 2 && (
          <Link href={`/genre/${genre}/page/${page - 1}`}>
            Previous
          </Link>
        )}

        {page === 2 && (
          <Link href={`/genre/${genre}`}>
            Previous
          </Link>
        )}

        {page < totalPages && (
          <Link href={`/genre/${genre}/page/${page + 1}`}>
            Next
          </Link>
        )}
      </div>
    </main>
  );
}