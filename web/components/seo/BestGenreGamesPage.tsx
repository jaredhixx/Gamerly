import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import { type GenreSlug } from "../../lib/genres";

type Props = {
  genreSlug: GenreSlug;
  pageTitle: string;
  pageSubtitle: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  exploreHeading: string;
  topSectionHeading: string;
  topSectionIntro: string;
  fullListHeading: string;
};

export default async function BestGenreGamesPage({
  genreSlug,
  pageTitle,
  pageSubtitle,
  introParagraphOne,
  introParagraphTwo,
  exploreHeading,
  topSectionHeading,
  topSectionIntro,
  fullListHeading,
}: Props) {
  const games = await fetchGames();

  const matchingGames = games.filter((game: any) => {
    if (!game.genreSlugs?.includes(genreSlug)) {
      return false;
    }

    if (!game.releaseDate) {
      return false;
    }

    return new Date(game.releaseDate) <= new Date();
  });

  const sortedGames = [...matchingGames].sort((a, b) => {
    const ratingA = a.aggregated_rating ?? 0;
    const ratingB = b.aggregated_rating ?? 0;
    const countA = a.aggregated_rating_count ?? 0;
    const countB = b.aggregated_rating_count ?? 0;

    const scoreA = ratingA * Math.log10(countA + 1);
    const scoreB = ratingB * Math.log10(countB + 1);

    return scoreB - scoreA;
  });

  const topPicks = sortedGames.slice(0, 10);
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
            <Link href={`/platform/pc/${genreSlug}`}>Best {pageTitle.replace("Best ", "").replace(" Games", "")} games on PC</Link>
          </li>
          <li>
            <Link href={`/platform/playstation/${genreSlug}`}>Best {pageTitle.replace("Best ", "").replace(" Games", "")} games on PlayStation</Link>
          </li>
          <li>
            <Link href={`/platform/xbox/${genreSlug}`}>Best {pageTitle.replace("Best ", "").replace(" Games", "")} games on Xbox</Link>
          </li>
          <li>
            <Link href={`/platform/switch/${genreSlug}`}>Best {pageTitle.replace("Best ", "").replace(" Games", "")} games on Switch</Link>
          </li>
          <li>
            <Link href={`/genre/${genreSlug}`}>Browse all {pageTitle.replace("Best ", "").replace(" Games", "")} games</Link>
          </li>
          <li>
            <Link href="/platform/pc/upcoming">Upcoming PC releases</Link>
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{topSectionHeading}</h2>

        <p style={{ maxWidth: "800px", marginBottom: "20px" }}>
          {topSectionIntro}
        </p>

        <GameGrid games={topPicks} />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{fullListHeading}</h2>
        <GameGrid games={fullList} />
      </section>
    </PageContainer>
  );
}