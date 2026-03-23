import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameGrid from "../../../../components/game/GameGrid";
import PageContainer from "../../../../components/layout/PageContainer";
import SectionHeading from "../../../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../../../lib/game-data";
import { buildCanonicalUrl } from "../../../../lib/site";

const PAGE_SIZE = 60;
const NEW_GAMES_WINDOW_DAYS = 30;

type NewGamesPaginationPageProps = {
  params: Promise<{
    page: string;
  }>;
};

function getRecentNewGames(newGames: Awaited<ReturnType<typeof getDerivedGameData>>["newGames"]) {
  const now = new Date();

  return newGames.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const release = new Date(game.releaseDate);
    const daysAgo =
      (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);

    return daysAgo >= 0 && daysAgo <= NEW_GAMES_WINDOW_DAYS;
  });
}

export async function generateMetadata(
  props: NewGamesPaginationPageProps
): Promise<Metadata> {
  const params = await props.params;
  const page = Number(params.page);

  if (!page || page < 2) {
    return {
      title: "New Games",
      description: "Recently released video games across all platforms.",
      alternates: {
        canonical: buildCanonicalUrl("/new-games")
      }
    };
  }

  return {
    title: `New Games - Page ${page}`,
    description: `Browse page ${page} of recently released video games across all platforms.`,
    alternates: {
      canonical: buildCanonicalUrl(`/new-games/page/${page}`)
    }
  };
}

export default async function NewGamesPaginationPage(
  props: NewGamesPaginationPageProps
) {
  const params = await props.params;
  const page = Number(params.page);

  if (!page || page < 2) {
    notFound();
  }

  const { newGames } = await getDerivedGameData();
  const recent = getRecentNewGames(newGames);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageGames = recent.slice(start, end);

  if (pageGames.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(recent.length / PAGE_SIZE);

  return (
    <PageContainer>
      <SectionHeading
        title={`New Video Games — Page ${page}`}
        subtitle="Browse recently released games across all platforms."
      />

      <GameGrid games={pageGames} />

      <div style={{ marginTop: "40px" }}>
        {page > 2 && (
          <Link
            href={`/new-games/page/${page - 1}`}
            style={{ marginRight: "16px", color: "#6aa6ff" }}
          >
            Previous
          </Link>
        )}

        {page < totalPages && (
          <Link
            href={`/new-games/page/${page + 1}`}
            style={{ color: "#6aa6ff" }}
          >
            Next
          </Link>
        )}
      </div>
    </PageContainer>
  );
}