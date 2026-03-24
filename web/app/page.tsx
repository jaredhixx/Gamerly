export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title:
    "Gamerly | New Video Games, Upcoming Releases, Hype Rankings, and Platform Guides",
  description:
    "Discover new video games, upcoming releases, hype rankings, platform guides, and live player interest across PC, PlayStation, Xbox, and Nintendo Switch.",
  alternates: {
    canonical: "https://www.gamerly.net/"
  }
};

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

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
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

  const hypeGames = selectHomepageHypeGames(scoredGames)
    .filter((game) => !liveGameIds.has(game.id))
    .slice(0, 24);

  const now = new Date().getTime();
  const fourteenDaysFromNow = now + 1000 * 60 * 60 * 24 * 14;
  const thirtyDaysFromNow = now + 1000 * 60 * 60 * 24 * 30;

  const upcomingGames = [...games]
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const releaseTime = new Date(game.releaseDate).getTime();

      if (Number.isNaN(releaseTime)) {
        return false;
      }

      return releaseTime > now && releaseTime <= thirtyDaysFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    )
    .slice(0, 24);

  const releasingSoonGames = upcomingGames.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseTime = new Date(game.releaseDate).getTime();

    if (Number.isNaN(releaseTime)) {
      return false;
    }

    return releaseTime <= fourteenDaysFromNow;
  });

  const featuredGame = selectHomepageFeaturedGame(scoredGames) || scoredGames[0];
  const featuredViewerCount = featuredGame?.twitchViewers ?? 0;

  const upcomingHero =
    selectHomepageUpcomingHero(scoredGames) || scoredGames[1] || scoredGames[0];

  const hasHypeGames = hypeGames.length > 0;
  const hasLiveGames = liveGames.length > 0;
  const hasUpcomingGames = upcomingGames.length > 0;
  const hasReleasingSoonGames = releasingSoonGames.length > 0;

  const totalGamesCount = games.length;
  const liveGamesCount = liveGames.length;
  const upcomingThirtyDayCount = upcomingGames.length;

  const startHereCards = [
    {
      title: "Track what is getting real attention",
      description:
        "Use the live and hype sections to see which games are pulling players in right now instead of relying on announcement noise.",
      href: "/hype",
      linkLabel: "Open hype rankings"
    },
    {
      title: "Find the next release worth caring about",
      description:
        "Jump straight into the near-term release window to avoid wading through distant launch dates that do not matter yet.",
      href: "/upcoming-games",
      linkLabel: "Browse upcoming games"
    },
    {
      title: "Start from your platform, not from raw data",
      description:
        "Browse by PC, PlayStation, Xbox, or Nintendo Switch to narrow the site into a useful discovery path immediately.",
      href: "/platform/pc",
      linkLabel: "Start with platform guides"
    }
  ];

  const browseCards = [
    {
      title: "New releases",
      description:
        "Recently released games across all supported platforms.",
      href: "/new-games"
    },
    {
      title: "Upcoming releases",
      description:
        "Games scheduled to launch soon, with the short window prioritized on the homepage.",
      href: "/upcoming-games"
    },
    {
      title: "Release calendar",
      description:
        "A broader calendar view for users who want to plan ahead by month.",
      href: "/releases"
    },
    {
      title: "Games this month",
      description:
        "A fast path for users who only care about what is arriving soon.",
      href: "/games-releasing-this-month"
    },
    {
      title: "All games",
      description:
        "The full searchable discovery layer for deeper browsing.",
      href: "/all-games"
    },
    {
      title: "PC games",
      description:
        "One of the strongest discovery hubs for long-tail search growth.",
      href: "/platform/pc"
    }
  ];

  const genreLinks = [
    { href: "/genre/rpg", label: "RPG Games" },
    { href: "/genre/shooter", label: "Shooter Games" },
    { href: "/genre/strategy", label: "Strategy Games" },
    { href: "/genre/adventure", label: "Adventure Games" },
    { href: "/genre/simulation", label: "Simulation Games" },
    { href: "/genre/puzzle", label: "Puzzle Games" },
    { href: "/genre/indie", label: "Indie Games" },
    { href: "/genre/fighting", label: "Fighting Games" },
    { href: "/genre/racing", label: "Racing Games" },
    { href: "/genre/sport", label: "Sports Games" }
  ];

  return (
    <main style={{ paddingTop: "4px", paddingBottom: "64px" }}>
      <PageContainer>
        <section
  style={{
    marginBottom: "20px",
    display: "grid",
    gap: "16px"
  }}
>
  <div style={{ maxWidth: "760px" }}>
    <h1
      style={{
        margin: 0,
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: "#f5f7fb"
      }}
    >
      Find the games actually worth your time right now.
    </h1>

    <p
      style={{
        marginTop: "10px",
        marginBottom: 0,
        color: "#a7b1c6",
        fontSize: "1rem",
        lineHeight: 1.6
      }}
    >
      Ranked using real player activity, hype signals, and release timing so you can decide what to play next.
    </p>
  </div>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "6px"
    }}
  >
    <Link
      href="/hype"
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        background: "#6EA8FF",
        color: "#0B1020",
        fontWeight: 600,
        textDecoration: "none"
      }}
    >
      See What’s Trending →
    </Link>

    <Link
      href="/upcoming-games"
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f5f7fb",
        textDecoration: "none"
      }}
    >
      What’s Releasing Soon →
    </Link>

    <Link
      href="/platform/pc"
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f5f7fb",
        textDecoration: "none"
      }}
    >
      Start With Your Platform →
    </Link>
  </div>
</section>

<div
  style={{
    marginTop: "4px",
    marginBottom: "10px",
    color: "#9aa3b2",
    fontSize: "0.85rem"
  }}
>
  Top game right now based on player activity, hype, and live momentum
</div>


        <FeaturedHero
          featured={featuredGame}
          upcoming={upcomingHero}
          viewerCount={featuredViewerCount}
        />

        {hasHypeGames ? (
          <SectionBlock>
            <SectionHeading
              title="Most Anticipated Games"
              subtitle="These are the upcoming games building the strongest mix of player interest, rating strength, release proximity, and live momentum."
            />

            <GameCarousel games={hypeGames} />

            <div className="sectionMoreLink">
              <Link href="/hype">Browse all hyped games →</Link>
            </div>
          </SectionBlock>
        ) : null}

        <div hidden aria-hidden="true" data-ad-slot="home-top-leaderboard" />

        {hasReleasingSoonGames ? (
          <SectionBlock>
            <SectionHeading
              title="Releasing Soon"
              subtitle="The most immediate launch window on the site. These games are scheduled to arrive within the next 14 days."
            />

            <GameCarousel games={releasingSoonGames} />

            <div className="sectionMoreLink">
              <Link href="/upcoming-games">View all upcoming games →</Link>
            </div>
          </SectionBlock>
        ) : hasUpcomingGames ? (
          <SectionBlock>
            <SectionHeading
              title="Upcoming Releases"
              subtitle="The next wave of games scheduled to launch within the next 30 days."
            />

            <GameCarousel games={upcomingGames} />

            <div className="sectionMoreLink">
              <Link href="/upcoming-games">View all upcoming games →</Link>
            </div>
          </SectionBlock>
        ) : null}

        <SectionBlock>
          <SectionHeading
            title="Browse Gamerly by Intent"
            subtitle="These links are organized around what users usually want to do next, not around filler homepage sections."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px"
            }}
          >
            {browseCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                style={{
                  display: "block",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  padding: "18px",
                  textDecoration: "none"
                }}
              >
                <div
                  style={{
                    color: "#f5f7fb",
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    lineHeight: 1.35
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#a7b1c6",
                    lineHeight: 1.6
                  }}
                >
                  {card.description}
                </div>

                <div style={{ marginTop: "14px" }}>{card.title} →</div>
              </Link>
            ))}
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
            subtitle="Start from the hardware you actually play on and narrow the site into a more useful discovery path immediately."
          />
          <PlatformStrip />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading
            title="Browse by Genre"
            subtitle="Jump straight into high-intent genre paths that can scale into stronger discovery hubs over time."
          />

          <div className="genreGrid">
            {genreLinks.map((genre) => (
              <Link key={genre.href} href={genre.href}>
                {genre.label}
              </Link>
            ))}
            <Link href="/all-games">All Games</Link>
            <Link href="/platform/playstation">PlayStation Games</Link>
            <Link href="/platform/xbox">Xbox Games</Link>
            <Link href="/platform/switch">Nintendo Switch Games</Link>
          </div>
        </SectionBlock>

       </PageContainer>
    </main>
  );
}