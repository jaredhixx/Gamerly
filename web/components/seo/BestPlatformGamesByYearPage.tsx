import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import type { PlatformSlug } from "../../lib/platforms";

type Props = {
  year: number;
  platformSlug: PlatformSlug;
  pageTitle: string;
  pageSubtitle: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  exploreHeading: string;
  topSectionHeading: string;
  topSectionIntro: string;
  fullListHeading: string;
};

export default async function BestPlatformGamesByYearPage({
  year,
  platformSlug,
  pageTitle,
  pageSubtitle,
  introParagraphOne,
  introParagraphTwo,
  exploreHeading,
  topSectionHeading,
  topSectionIntro,
  fullListHeading
}: Props) {
  const games = await fetchGames();

  const matchingGames = games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;
    const hasPlatform = game.platformSlugs?.includes(platformSlug);

    return (
      releaseYear === year &&
      hasPlatform &&
      rating >= 70 &&
      ratingCount >= 1
    );
  });

  const sortedGames = [...matchingGames].sort((a, b) => {
    const ratingA = a.aggregated_rating ?? 0;
    const ratingB = b.aggregated_rating ?? 0;
    const countA = a.aggregated_rating_count ?? 0;
    const countB = b.aggregated_rating_count ?? 0;

    const scoreA = ratingA + Math.min(countA, 20) * 0.35;
    const scoreB = ratingB + Math.min(countB, 20) * 0.35;

    const scoreDiff = scoreB - scoreA;

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const ratingDiff = ratingB - ratingA;

    if (ratingDiff !== 0) {
      return ratingDiff;
    }

    const countDiff = countB - countA;

    if (countDiff !== 0) {
      return countDiff;
    }

    return (
      new Date(b.releaseDate || "").getTime() -
      new Date(a.releaseDate || "").getTime()
    );
  });

  const topPicks = sortedGames.slice(0, 12);
  const fullList = sortedGames.slice(0, 60);

  return (
    <PageContainer>
      <SectionHeading title={pageTitle} subtitle={pageSubtitle} />

      <div style={{ maxWidth: "800px", marginBottom: "40px" }}>
        <p>{introParagraphOne}</p>
        <p>{introParagraphTwo}</p>
      </div>

      <section style={{ marginBottom: "40px" }}>
        <h2>{exploreHeading}</h2>

        <ul style={{ paddingLeft: "20px", margin: "16px 0 0" }}>
          <li>
            <Link href="/platform/pc">Browse all PC games</Link>
          </li>
          <li>
            <Link href="/best-games-2025">Browse best games of 2025</Link>
          </li>
          <li>
            <Link href="/new-games">Browse newly released games</Link>
          </li>
          <li>
            <Link href="/upcoming-games">Browse upcoming games</Link>
          </li>
          <li>
            <Link href="/top-rated">Browse top-rated games across all years</Link>
          </li>
          <li>
            <Link href="/genres">Browse games by genre</Link>
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{topSectionHeading}</h2>

        <p style={{ maxWidth: "800px", marginBottom: "20px" }}>
          {topSectionIntro}
        </p>

        {topPicks.length > 0 ? (
          <GameGrid games={topPicks} />
        ) : (
          <p>No strong ranked platform games are available for this year yet.</p>
        )}
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{fullListHeading}</h2>

        {fullList.length > 0 ? (
          <GameGrid games={fullList} />
        ) : (
          <p>No strong ranked platform games are available for this year yet.</p>
        )}
      </section>
    </PageContainer>
  );
}