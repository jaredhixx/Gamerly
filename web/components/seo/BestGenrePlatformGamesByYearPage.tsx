import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import type { GenreSlug } from "../../lib/genres";
import type { PlatformSlug } from "../../lib/platforms";

type Props = {
  year: number;
  genreSlug: GenreSlug;
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

export default async function BestGenrePlatformGamesByYearPage({
  year,
  genreSlug,
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

  const allMatchingGames = games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const hasGenre = game.genreSlugs?.includes(genreSlug);
    const hasPlatform = game.platformSlugs?.includes(platformSlug);

    return releaseYear === year && hasGenre && hasPlatform;
  });

  if (genreSlug === "shooter" && platformSlug === "pc" && year === 2025) {
    console.log(
      "DEBUG_ALL_MATCHING_SHOOTER_PC_2025",
      allMatchingGames.map((game) => ({
        name: game.name,
        releaseDate: game.releaseDate,
        genreSlugs: game.genreSlugs,
        platformSlugs: game.platformSlugs,
        aggregated_rating: game.aggregated_rating,
        aggregated_rating_count: game.aggregated_rating_count
      }))
    );
  }

  const strongMatchingGames = allMatchingGames.filter((game) => {
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;

    return rating >= 70 && ratingCount >= 1;
  });

  const sortGames = (gamesToSort: typeof allMatchingGames) => {
    return [...gamesToSort].sort((a, b) => {
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
  };

  const sortedStrongGames = sortGames(strongMatchingGames);
  const sortedAllGames = sortGames(allMatchingGames);

  const strongGameIds = new Set(sortedStrongGames.map((game) => game.id));

  const additionalGames = sortedAllGames.filter(
    (game) => !strongGameIds.has(game.id)
  );

  const topPicks = sortedStrongGames.slice(0, 12);
  const fullList = additionalGames.slice(0, 60);

  return (
    <PageContainer>
      <SectionHeading title={pageTitle} subtitle={pageSubtitle} />

<div style={{ maxWidth: "800px", marginBottom: "40px" }}>
  <p>{introParagraphOne}</p>
  <p>{introParagraphTwo}</p>

<p>
  This list of the best{" "}
  <Link href={`/best-${genreSlug}-games`} style={{ color: "#8bb9ff", fontWeight: 600 }}>
    {genreSlug} games
  </Link>{" "}
  on{" "}
  <Link href={`/platform/${platformSlug}`} style={{ color: "#8bb9ff", fontWeight: 600 }}>
    {platformSlug}
  </Link>{" "}
  in{" "}
  <Link href={`/best-games-${year}`} style={{ color: "#8bb9ff", fontWeight: 600 }}>
    {year}
  </Link>{" "}
  focuses on titles that have already released and built real momentum with players.
  Rankings are based on a combination of critic scores, player reception,
  and overall visibility within the current gaming landscape.
</p>

  <p>
    Whether you are looking for the highest rated releases or hidden gems that
    gained traction over time, this page highlights the strongest {genreSlug}
    experiences available on {platformSlug} in {year} without including
    unreleased or low-signal titles.
  </p>
</div>

      <section style={{ marginBottom: "40px" }}>
        <h2>{exploreHeading}</h2>

        <ul style={{ paddingLeft: "20px", margin: "16px 0 0" }}>
          <li>
            <Link href={`/platform/${platformSlug}/${genreSlug}`}>
              Browse all {genreSlug.toUpperCase()} games on {platformSlug}
            </Link>
          </li>
          <li>
            <Link href={`/genre/${genreSlug}`}>
              Browse all {genreSlug.toUpperCase()} games
            </Link>
          </li>
          <li>
            <Link href={`/platform/${platformSlug}`}>
              Browse all {platformSlug} games
            </Link>
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
          <p>
            There are no strong ranked games for this combination yet, but you
            can still browse other released games below.
          </p>
        )}
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{fullListHeading}</h2>

        {fullList.length > 0 ? (
          <GameGrid games={fullList} />
        ) : (
          <p>No additional released games are available for this combination yet.</p>
        )}
      </section>
    </PageContainer>
  );
}