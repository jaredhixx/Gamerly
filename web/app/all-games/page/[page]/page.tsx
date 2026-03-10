import { fetchGames } from "../../../../lib/igdb";
import GameGrid from "../../../../components/game/GameGrid";
import PageContainer from "../../../../components/layout/PageContainer";
import SectionHeading from "../../../../components/ui/SectionHeading";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 60;

export default async function AllGamesPagination(props: any) {

  const params = await props.params;

  const page = Number(params.page);

  if (!page || page < 2) {
    notFound();
  }

  const games = await fetchGames();

  const start = (page - 1) * PAGE_SIZE;

  const end = start + PAGE_SIZE;

  const pageGames = games.slice(start, end);

  if (pageGames.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(games.length / PAGE_SIZE);

  return (
    <PageContainer>

<SectionHeading title={`All Games — Page ${page}`} />

      <GameGrid games={pageGames} />

      <div style={{ marginTop: "40px" }}>

        {page > 2 && (
          <Link href={`/all-games/page/${page - 1}`} style={{ marginRight: "16px" }}>
            Previous
          </Link>
        )}

        {page < totalPages && (
          <Link href={`/all-games/page/${page + 1}`}>
            Next
          </Link>
        )}

      </div>

    </PageContainer>
  );
}