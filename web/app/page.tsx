export const revalidate = 21600;

import type { Metadata } from "next";
import { fetchGames } from "../lib/igdb";
import { fetchTwitchStreams } from "../lib/twitch";
import {
  calculateHypeRankingScore,
  selectHomepageFeaturedGame,
  selectHomepageHypeGames,
  selectHomepagePcGames,
  selectHomepageTopRatedGamesWithoutUsed,
  selectHomepageUpcomingHero,
} from "../lib/game-ranking";
import GameCarousel from "../components/game/GameCarousel";
import PageContainer from "../components/layout/PageContainer";
import SectionHeading from "../components/ui/SectionHeading";
import SectionBlock from "../components/layout/SectionBlock";
import FeaturedHero from "../components/layout/FeaturedHero";
import PlatformStrip from "../components/layout/PlatformStrip";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New and Upcoming Video Games",
  description:
    "Discover new and upcoming video games by platform, genre, and release date on Gamerly.",
  alternates: {
    canonical: "https://www.gamerly.net/"
  }
};

function isUpcoming(date?: string | null) {
  if (!date) return false;
  return new Date(date) > new Date();
}

function isReleased(date?: string | null) {
  if (!date) return false;
  return new Date(date) <= new Date();
}

export default async function Home() {
  const games = await fetchGames();
  const streams = await fetchTwitchStreams();

  const twitchMap: Record<string, { viewers: number; streams: number }> = {};

  for (const stream of streams) {
    const name = stream.game_name?.trim().toLowerCase();
    if (!name) continue;

    if (!twitchMap[name]) {
      twitchMap[name] = { viewers: 0, streams: 0 };
    }

    twitchMap[name].viewers += stream.viewer_count;
    twitchMap[name].streams += 1;
  }

  const scoredGames = games.map((game) => {
    const twitch = twitchMap[game.name?.trim().toLowerCase()] || {
      viewers: 0,
      streams: 0
    };

    const hypeScore = calculateHypeRankingScore({
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams
    });

    return {
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams,
      hypeScore
    };
  });

  const liveGames = [...scoredGames]
    .filter((game) => (game.twitchViewers ?? 0) > 0)
    .sort((a, b) => (b.twitchViewers ?? 0) - (a.twitchViewers ?? 0))
    .slice(0, 20);

  const hypeGames = selectHomepageHypeGames(scoredGames);

  const newGames = [...games]
    .filter((g) => isReleased(g.releaseDate))
    .sort(
      (a, b) =>
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
    )
    .slice(0, 24);

  const upcomingGames = [...games]
    .filter((g) => isUpcoming(g.releaseDate))
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    )
    .slice(0, 24);

  const topRatedGames = selectHomepageTopRatedGamesWithoutUsed(scoredGames);
  const pcGames = selectHomepagePcGames(scoredGames);

  const featuredGame = selectHomepageFeaturedGame(scoredGames) || scoredGames[0];
  const featuredViewerCount = featuredGame?.twitchViewers ?? 0;

  const upcomingHero =
    selectHomepageUpcomingHero(scoredGames) || scoredGames[1] || scoredGames[0];

  return (
    <main style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <PageContainer>
        <FeaturedHero
          featured={featuredGame}
          upcoming={upcomingHero}
          viewerCount={featuredViewerCount}
        />

        <SectionBlock>
          <SectionHeading
            title="🔥 Most Hyped Games"
            subtitle="Games building the most excitement across ratings, releases, and player interest."
          />

          <GameCarousel games={hypeGames} />

          <div className="sectionMoreLink">
            <Link href="/hype">Browse all hyped games →</Link>
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="🔴 Live Games on Twitch"
            subtitle="Games currently attracting the most viewers on Twitch."
          />

          <GameCarousel games={liveGames} />

          <div className="sectionMoreLink">
            <Link href="/live-games">View all live games →</Link>
          </div>
        </SectionBlock>

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

        <div
          hidden
          aria-hidden="true"
          data-ad-slot="home-between-trending-and-new"
        />

        <SectionBlock>
          <SectionHeading
            title="New Games"
            subtitle="Recently released video games across all platforms."
          />
          <GameCarousel games={newGames} />

          <div className="sectionMoreLink">
            <Link href="/new-games">View all new games →</Link>
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Upcoming Games"
            subtitle="Video games releasing soon."
          />
          <GameCarousel games={upcomingGames} />

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
          <GameCarousel games={topRatedGames} />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="PC Games"
            subtitle="Popular games available on PC."
          />
          <GameCarousel games={pcGames} />

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

                <p
          style={{
            marginTop: "48px",
            marginBottom: "6px",
            color: "#9aa3b2",
            maxWidth: "760px",
            lineHeight: "1.6"
          }}
        >
          Gamerly helps players discover new and upcoming video games across PC,
          PlayStation, Xbox, and Nintendo Switch. Browse new releases, explore
          upcoming titles, find top rated games, and discover games by platform
          and genre.
        </p>

        <div hidden aria-hidden="true" data-ad-slot="home-bottom-anchor" />
      </PageContainer>
    </main>
  );
}