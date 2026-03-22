import type { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

const PAGE_SIZE = 60;

export const metadata: Metadata = {
  title: "All Games",
  description:
    "Browse all video games on Gamerly, including new releases, upcoming games, and top-rated titles across platforms and genres.",
  alternates: {
    canonical: buildCanonicalUrl("/all-games")
  }
};

export default async function AllGamesPage() {
  const { games } = await getDerivedGameData();

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