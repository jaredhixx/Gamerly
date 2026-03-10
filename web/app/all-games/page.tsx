import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import Link from "next/link";

const PAGE_SIZE = 60;

export default async function AllGamesPage() {

  const games = await fetchGames();

  const firstPage = games.slice(0, PAGE_SIZE);

  const totalPages = Math.ceil(games.length / PAGE_SIZE);

  return (
    <PageContainer>

<SectionHeading title="All Games" />

      <GameGrid games={firstPage} />

      <div style={{ marginTop: "40px" }}>

        {Array.from({ length: totalPages - 1 }, (_, i) => {

          const page = i + 2;

          return (
            <Link
              key={page}
              href={`/all-games/page/${page}`}
              style={{
                marginRight: "12px",
                color: "#6aa6ff"
              }}
            >
              Page {page}
            </Link>
          );

        })}

      </div>

    </PageContainer>
  );
}