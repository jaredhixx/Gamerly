import { getDerivedGameData } from "../../lib/game-data";
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
  const { topRated } = await getDerivedGameData();

  const games = topRated.slice(0, 60);

  return (
    <PageContainer>
      <SectionHeading title="Top Rated Games" />
      <GameGrid games={games} />
    </PageContainer>
  );
}