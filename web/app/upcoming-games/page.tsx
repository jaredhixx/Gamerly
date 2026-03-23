import type { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

const PAGE_SIZE = 60;

export const metadata: Metadata = {
  title: "Upcoming Games",
  description: "Upcoming video game releases across all platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/upcoming-games")
  }
};

export default async function UpcomingGamesPage() {
  const { upcomingGames } = await getDerivedGameData();

  const firstPageGames = upcomingGames.slice(0, PAGE_SIZE);
  const totalPages = Math.ceil(upcomingGames.length / PAGE_SIZE);

  return (
    <PageContainer>
      <SectionHeading
        title="Upcoming Video Games"
        subtitle="Browse upcoming releases across all platforms."
      />

      <GameGrid games={firstPageGames} />

      {totalPages > 1 && (
        <div style={{ marginTop: "40px" }}>
          {Array.from({ length: totalPages - 1 }, (_, index) => {
            const page = index + 2;

            return (
              <Link
                key={page}
                href={`/upcoming-games/page/${page}`}
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
      )}
    </PageContainer>
  );
}