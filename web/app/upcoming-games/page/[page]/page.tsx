import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameGrid from "../../../../components/game/GameGrid";
import PageContainer from "../../../../components/layout/PageContainer";
import SectionHeading from "../../../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../../../lib/game-data";
import { buildCanonicalUrl } from "../../../../lib/site";

const PAGE_SIZE = 60;

type UpcomingGamesPaginationPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export async function generateMetadata(
  props: UpcomingGamesPaginationPageProps
): Promise<Metadata> {
  const params = await props.params;
  const page = Number(params.page);

  if (!page || page < 2) {
    return {
      title: "Upcoming Games",
      description: "Upcoming video game releases across all platforms.",
      alternates: {
        canonical: buildCanonicalUrl("/upcoming-games")
      }
    };
  }

  return {
    title: `Upcoming Games - Page ${page}`,
    description: `Browse page ${page} of upcoming video game releases across all platforms.`,
    alternates: {
      canonical: buildCanonicalUrl(`/upcoming-games/page/${page}`)
    }
  };
}

export default async function UpcomingGamesPaginationPage(
  props: UpcomingGamesPaginationPageProps
) {
  const params = await props.params;
  const page = Number(params.page);

  if (!page || page < 2) {
    notFound();
  }

  const { upcomingGames } = await getDerivedGameData();

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageGames = upcomingGames.slice(start, end);

  if (pageGames.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(upcomingGames.length / PAGE_SIZE);

  return (
    <PageContainer>
      <SectionHeading
        title={`Upcoming Video Games — Page ${page}`}
        subtitle="Browse upcoming releases across all platforms."
      />

      <GameGrid games={pageGames} />

      <div style={{ marginTop: "40px" }}>
        {page > 2 && (
          <Link
            href={`/upcoming-games/page/${page - 1}`}
            style={{ marginRight: "16px", color: "#6aa6ff" }}
          >
            Previous
          </Link>
        )}

        {page < totalPages && (
          <Link
            href={`/upcoming-games/page/${page + 1}`}
            style={{ color: "#6aa6ff" }}
          >
            Next
          </Link>
        )}
      </div>
    </PageContainer>
  );
}