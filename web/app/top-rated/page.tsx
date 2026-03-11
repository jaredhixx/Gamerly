import { fetchGames } from "../../lib/igdb";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export const metadata = {
  title: "Top Rated Games",
  description:
    "Discover the highest rated video games across PC, PlayStation, Xbox, Switch, and more."
};

export const revalidate = 3600;

export default async function TopRatedPage() {
  const games = await fetchGames();

  const topRated = games
    .filter(
      (g) =>
        (g.aggregated_rating ?? 0) > 85 &&
        (g.aggregated_rating_count ?? 0) > 40
    )
    .sort(
      (a, b) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0)
    )
    .slice(0, 60);

  return (
    <PageContainer>
      <SectionHeading title="Top Rated Games" />
      <GameGrid games={topRated} />
    </PageContainer>
  );
}