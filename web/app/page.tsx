export const revalidate = 300;

import type { Metadata } from "next";
import { fetchGames } from "../lib/igdb";
import {
  fetchExactTwitchTotalsForGameNames,
  fetchTwitchStreams
} from "../lib/twitch";
import {
  calculateHypeRankingScore,
  selectHomepageFeaturedGame,
  selectHomepageHypeGames,
  selectHomepageUpcomingHero
} from "../lib/game-ranking";
import GameCarousel from "../components/game/GameCarousel";
import PageContainer from "../components/layout/PageContainer";
import SectionHeading from "../components/ui/SectionHeading";
import SectionBlock from "../components/layout/SectionBlock";
import FeaturedHero from "../components/layout/FeaturedHero";
import PlatformStrip from "../components/layout/PlatformStrip";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Gamerly | New Video Games, Upcoming Releases, Hype Rankings, and Platform Guides",
  description:
    "Discover new video games, upcoming releases, live Twitch trends, and hype rankings across PC, PlayStation, Xbox, and Nintendo Switch on Gamerly.",
  alternates: {
    canonical: "https://www.gamerly.net/"
  }
};

function isUpcoming(date?: string | null) {
  if (!date) return false;
  return new Date(date) > new Date();
}

function normalizeTwitchName(name?: string | null): string {
  if (!name) {
    return "";
  }

  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildRoughTwitchMap(
  streams: Array<{
    game_name: string;
    viewer_count: number;
  }>
): Record<string, { viewers: number; streams: number }> {
  const twitchMap: Record<string, { viewers: number; streams: number }> = {};

  for (const stream of streams) {
    const key = normalizeTwitchName(stream.game_name);

    if (!key) {
      continue;
    }

    if (!twitchMap[key]) {
      twitchMap[key] = { viewers: 0, streams: 0 };
    }

    twitchMap[key].viewers += stream.viewer_count;
    twitchMap[key].streams += 1;
  }

  return twitchMap;
}

export default async function Home() {
  const games = await fetchGames();
  const streams = await fetchTwitchStreams();

  const roughTwitchMap = buildRoughTwitchMap(streams);

  const roughScoredGames = games.map((game) => {
    const twitch =
      roughTwitchMap[normalizeTwitchName(game.name)] || {
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

  const roughFeaturedGame =
    selectHomepageFeaturedGame(roughScoredGames) || roughScoredGames[0];

  const roughLiveGames = [...roughScoredGames]
    .filter((game) => (game.twitchViewers ?? 0) > 0)
    .sort((a, b) => (b.twitchViewers ?? 0) - (a.twitchViewers ?? 0))
    .slice(0, 20);

  const exactTargetNames = [
    ...new Set(
      [roughFeaturedGame?.name, ...roughLiveGames.slice(0, 8).map((game) => game.name)]
        .filter((name): name is string => Boolean(name))
    )
  ];

  const exactTwitchTotals = await fetchExactTwitchTotalsForGameNames(
    exactTargetNames
  );

  const scoredGames = roughScoredGames.map((game) => {
    const exact = game.name ? exactTwitchTotals[game.name] : undefined;

    if (!exact || exact.viewers <= 0) {
      return game;
    }

    const hypeScore = calculateHypeRankingScore({
      ...game,
      twitchViewers: exact.viewers,
      twitchStreams: exact.streams
    });

    return {
      ...game,
      twitchViewers: exact.viewers,
      twitchStreams: exact.streams,
      hypeScore
    };
  });

  const liveGames = [...scoredGames]
    .filter((game) => (game.twitchViewers ?? 0) > 0)
    .sort((a, b) => (b.twitchViewers ?? 0) - (a.twitchViewers ?? 0))
    .slice(0, 20);

  const liveGameIds = new Set(liveGames.map((game) => game.id));

const hypeGames = selectHomepageHypeGames(scoredGames).filter(
  (game) => !liveGameIds.has(game.id)
);

const now = new Date().getTime();
const thirtyDaysFromNow = now + 1000 * 60 * 60 * 24 * 30;

const upcomingGames = [...games]
  .filter((g) => {
    if (!g.releaseDate) return false;

    const releaseTime = new Date(g.releaseDate).getTime();

    if (Number.isNaN(releaseTime)) return false;

    return releaseTime > now && releaseTime <= thirtyDaysFromNow;
  })
  .sort(
    (a, b) =>
      new Date(a.releaseDate || "").getTime() -
      new Date(b.releaseDate || "").getTime()
  )
  .slice(0, 24);

  const featuredGame = selectHomepageFeaturedGame(scoredGames) || scoredGames[0];
  const featuredViewerCount = featuredGame?.twitchViewers ?? 0;

  const upcomingHero =
    selectHomepageUpcomingHero(scoredGames) || scoredGames[1] || scoredGames[0];

  const hasHypeGames = hypeGames.length > 0;
  const hasLiveGames = liveGames.length > 0;
  const hasUpcomingGames = upcomingGames.length > 0;

  return (
    <main style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <PageContainer>
        <section
          style={{
            marginBottom: "12px"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "0.95rem",
              lineHeight: "1.2",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9aa3b2"
            }}
          >
            Best New and Upcoming Games
          </h1>
        </section>

<FeaturedHero
  featured={featuredGame}
  upcoming={upcomingHero}
  viewerCount={featuredViewerCount}
/>

        {hasHypeGames ? (
          <SectionBlock>
            <SectionHeading
title="Most Anticipated Games"
subtitle="The upcoming games generating the most excitement right now."
            />

            <GameCarousel games={hypeGames} />

            <div className="sectionMoreLink">
              <Link href="/hype">Browse all hyped games →</Link>
            </div>
          </SectionBlock>
        ) : null}

        {hasLiveGames ? (
          <SectionBlock>
            <SectionHeading
title="Trending Now"
subtitle="The games drawing the most live attention right now."
            />

            <GameCarousel games={liveGames} />

            <div className="sectionMoreLink">
              <Link href="/live-games">View all live games →</Link>
            </div>
          </SectionBlock>
        ) : null}

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

        {hasUpcomingGames ? (
          <SectionBlock>
            <SectionHeading
title="Releasing Soon"
subtitle="Upcoming games arriving in the next 30 days."
            />
            <GameCarousel games={upcomingGames} />

            <div className="sectionMoreLink">
              <Link href="/upcoming-games">View all upcoming games →</Link>
            </div>
          </SectionBlock>
        ) : null}

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
          Gamerly is a discovery site for new and upcoming video games across
          PC, PlayStation, Xbox, and Nintendo Switch. Explore upcoming releases,
          check live Twitch interest, browse by platform and genre, and find the
          games worth paying attention to next.
        </p>

        <div hidden aria-hidden="true" data-ad-slot="home-bottom-anchor" />
      </PageContainer>
    </main>
  );
}