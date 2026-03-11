export const dynamic = "force-dynamic";
export const revalidate = 21600;

import type { Metadata } from "next";
import { fetchGames } from "../lib/igdb";
import GameGrid from "../components/game/GameGrid";
import PageContainer from "../components/layout/PageContainer";
import SectionHeading from "../components/ui/SectionHeading";
import SectionBlock from "../components/layout/SectionBlock";
import FeaturedHero from "../components/layout/FeaturedHero";
import PlatformStrip from "../components/layout/PlatformStrip";
import Link from "next/link";
import { calculateHypeScore } from "../lib/hype";

export const metadata: Metadata = {
  title: "New and Upcoming Video Games",
  description:
    "Discover new and upcoming video games by platform, genre, and release date on Gamerly.",
  alternates: {
    canonical: "https://www.gamerly.net/"
  }
};

export default async function Home() {
  const games = await fetchGames();

  const hypeGames =
  games
    .map((g) => ({
      ...g,
      hypeScore: calculateHypeScore(g)
    }))
    .sort((a, b) => b.hypeScore - a.hypeScore)
    .slice(0, 6);

  const featuredGame =
    games
      .filter(
        (g) =>
          (g.aggregated_rating ?? 0) > 85 &&
          (g.aggregated_rating_count ?? 0) > 40
      )
      .sort(
        (a, b) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0)
      )[0] || games[0];

  const upcomingHero =
    games
      .filter((g) => g.releaseDate && new Date(g.releaseDate) > new Date())
      .sort(
        (a, b) =>
          new Date(a.releaseDate!).getTime() -
          new Date(b.releaseDate!).getTime()
      )[0] || games[1];

  const trendingHero =
    games
      .filter((g) => (g.aggregated_rating_count ?? 0) > 100)
      .sort(
        (a, b) =>
          (b.aggregated_rating_count ?? 0) - (a.aggregated_rating_count ?? 0)
      )[0] || games[2];

  const newGames = games.slice(0, 24);

  const upcomingGames = games
    .filter((g) => g.releaseDate && new Date(g.releaseDate) > new Date())
    .slice(0, 24);

const trendingGames = [...games]
  .sort(
    (a, b) =>
      (b.aggregated_rating_count ?? 0) - (a.aggregated_rating_count ?? 0)
  )
  .slice(0, 24);

  const topRatedGames = [...games]
    .filter(
      (g) =>
        (g.aggregated_rating ?? 0) > 0 &&
        (g.aggregated_rating_count ?? 0) > 20
    )
    .sort((a, b) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0))
    .slice(0, 8);

  const pcGames = games
    .filter((g) => g.platforms?.some((p) => p.toLowerCase().includes("pc")))
    .slice(0, 8);

  return (
    <main style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <PageContainer>
                <FeaturedHero
          featured={featuredGame}
          upcoming={upcomingHero}
          trending={trendingHero}
        />

        <div hidden aria-hidden="true" data-ad-slot="home-top-leaderboard" />

        <SectionBlock>
          <SectionHeading
            title="Explore Gamerly"
            subtitle="Jump into the biggest discovery paths across new releases, upcoming launches, platforms, and genre pages."
          />

<section className="homeExplorePanel">
  <div className="homeExploreLinks">
    <Link href="/all-games">All Games</Link>
    <Link href="/new-games">New Games</Link>
    <Link href="/upcoming-games">Upcoming Games</Link>
    <Link href="/games-releasing-this-month">Games This Month</Link>
    <Link href="/releases">Release Calendar</Link>
    <Link href="/platform/pc">PC Games</Link>
    <Link href="/platform/playstation">PlayStation Games</Link>
    <Link href="/platform/xbox">Xbox Games</Link>
    <Link href="/genre/rpg">RPG Games</Link>
    <Link href="/genre/shooter">Shooter Games</Link>
    <Link href="/genre/strategy">Strategy Games</Link>
  </div>
</section>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Trending Games"
            subtitle="Popular games players are discovering right now."
          />
          <GameGrid games={trendingGames} />

          <div className="sectionMoreLink">
            <Link href="/all-games">Browse more games →</Link>
          </div>
        </SectionBlock>

        <div
          hidden
          aria-hidden="true"
          data-ad-slot="home-between-trending-and-new"
        />

        <SectionBlock>

<SectionHeading
  title="🔥 Trending Now"
  subtitle="Games gaining the most momentum across ratings, releases, and Twitch."
/>

<GameGrid games={hypeGames} />

</SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="New Games"
            subtitle="Recently released video games across all platforms."
          />
          <GameGrid games={newGames} />

          <div className="sectionMoreLink">
            <Link href="/new-games">View all new games →</Link>
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Upcoming Games"
            subtitle="Video games releasing soon."
          />
          <GameGrid games={upcomingGames} />

          <div className="sectionMoreLink">
            <Link href="/upcoming-games">View all upcoming games →</Link>
          </div>
        </SectionBlock>

        <div
          hidden
          aria-hidden="true"
          data-ad-slot="home-between-upcoming-and-platforms"
        />

        <SectionBlock>
          <SectionHeading
            title="Browse by Platform"
            subtitle="Start with your preferred platform and discover what is worth playing next."
          />
          <PlatformStrip />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Top Rated Games"
            subtitle="Highly rated games players love."
          />
          <GameGrid games={topRatedGames} />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="PC Games"
            subtitle="Popular games available on PC."
          />
          <GameGrid games={pcGames} />

          <div className="sectionMoreLink">
            <Link href="/platform/pc">Browse all PC games →</Link>
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Browse by Genre"
            subtitle="Discover games by genre."
          />

          <div className="genreGrid">
            <Link href="/all-games">All Games</Link>
            <Link href="/genre/rpg">RPG Games</Link>
            <Link href="/genre/shooter">Shooter Games</Link>
            <Link href="/genre/strategy">Strategy Games</Link>
            <Link href="/genre/adventure">Adventure Games</Link>
            <Link href="/genre/simulation">Simulation Games</Link>
            <Link href="/genre/puzzle">Puzzle Games</Link>
            <Link href="/genre/indie">Indie Games</Link>
            <Link href="/genre/fighting">Fighting Games</Link>
            <Link href="/genre/racing">Racing Games</Link>
            <Link href="/genre/sport">Sports Games</Link>
            <Link href="/platform/playstation">PlayStation Games</Link>
            <Link href="/platform/xbox">Xbox Games</Link>
            <Link href="/platform/switch">Nintendo Switch Games</Link>
          </div>
        </SectionBlock>

        <div
          hidden
          aria-hidden="true"
          data-ad-slot="home-bottom-anchor"
        />
      </PageContainer>
    </main>
  );
}