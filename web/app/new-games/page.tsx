import type { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

const PAGE_SIZE = 60;
const NEW_GAMES_WINDOW_DAYS = 30;

export const metadata: Metadata = {
  title: "New Games",
  description: "Recently released video games across all platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/new-games")
  }
};

export default async function NewGamesPage() {
  const { newGames } = await getDerivedGameData();

  const now = new Date();

  const recent = newGames.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const release = new Date(game.releaseDate);
    const daysAgo =
      (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);

    return daysAgo >= 0 && daysAgo <= NEW_GAMES_WINDOW_DAYS;
  });

  const firstPageGames = recent.slice(0, PAGE_SIZE);
  const totalPages = Math.ceil(recent.length / PAGE_SIZE);

  return (
    <PageContainer>
      <SectionHeading
        title="New Video Games"
        subtitle="Browse recently released games across all platforms."
      />

      <GameGrid games={firstPageGames} />

      {totalPages > 1 && (
        <div style={{ marginTop: "40px" }}>
          {Array.from({ length: totalPages - 1 }, (_, index) => {
            const page = index + 2;

            return (
              <Link
                key={page}
                href={`/new-games/page/${page}`}
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