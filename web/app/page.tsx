export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { fetchGames } from "../lib/igdb";
import { fetchTwitchStreams } from "../lib/twitch";
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

export const metadata: Metadata = {
  title:
    "Gamerly | Discover New Games, Upcoming Releases, Hype Rankings, and Platform Guides",
  description:
    "Discover the video games actually worth your time with hype rankings, upcoming releases, platform guides, and curated discovery across PC, PlayStation, Xbox, and Nintendo Switch.",
  alternates: {
    canonical: "https://www.gamerly.net/"
  }
};

type TwitchStream = {
  game_name: string;
  viewer_count: number;
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
  streams: TwitchStream[]
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

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function buildUpcomingWindowGames(
  games: Awaited<ReturnType<typeof fetchGames>>,
  now: number,
  daysAhead: number
) {
  const endTime = now + 1000 * 60 * 60 * 24 * daysAhead;

  return [...games]
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const releaseTime = new Date(game.releaseDate).getTime();

      if (Number.isNaN(releaseTime)) {
        return false;
      }

      return releaseTime > now && releaseTime <= endTime;
    })
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    );
}

export default async function Home() {
const games = await fetchGames();
const streams = await fetchTwitchStreams().catch(() => []);

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

  const roughHypeGames = selectHomepageHypeGames(roughScoredGames).slice(0, 12);

  const scoredGames = roughScoredGames;

  const featuredGame = selectHomepageFeaturedGame(scoredGames) || scoredGames[0];
  const featuredViewerCount = featuredGame?.twitchViewers ?? 0;

  const hypeGames = selectHomepageHypeGames(scoredGames).slice(0, 24);

  const upcomingHero =
    selectHomepageUpcomingHero(scoredGames) || scoredGames[1] || scoredGames[0];

  const now = new Date().getTime();
  const upcomingWindowGames = buildUpcomingWindowGames(games, now, 30);
  const upcomingGames = upcomingWindowGames.slice(0, 24);
  const releasingSoonGames = upcomingWindowGames
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const releaseTime = new Date(game.releaseDate).getTime();
      const fourteenDaysAhead = now + 1000 * 60 * 60 * 24 * 14;

      if (Number.isNaN(releaseTime)) {
        return false;
      }

      return releaseTime > now && releaseTime <= fourteenDaysAhead;
    })
    .slice(0, 24);

  const hasHypeGames = hypeGames.length > 0;
  const hasUpcomingGames = upcomingGames.length > 0;
  const hasReleasingSoonGames = releasingSoonGames.length > 0;

  const totalGamesCount = games.length;
  const trackedLiveSignalCount = scoredGames.filter(
    (game) => (game.twitchViewers ?? 0) > 0
  ).length;
  const upcomingThirtyDayCount = upcomingWindowGames.length;

  const intentCards = [
    {
      title: "Most Hyped Games",
      description:
        "Go straight to the strongest momentum on the site when you want to know which games matter most right now.",
      href: "/hype",
      linkLabel: "Open hype rankings"
    },
    {
      title: "Releasing Soon",
      description:
        "See what is actually close to launch so you can decide what to play next without digging through distant dates.",
      href: "/upcoming-games",
      linkLabel: "Browse upcoming games"
    },
    {
      title: "New Releases",
      description:
        "Catch up on the newest games already out across supported platforms.",
      href: "/new-games",
      linkLabel: "View new releases"
    },
    {
      title: "Release Calendar",
      description:
        "Plan ahead by month when you want a broader view than a single homepage snapshot.",
      href: "/releases",
      linkLabel: "Open release calendar"
    },
    {
      title: "Start With PC",
      description:
        "Jump into one of the strongest discovery paths on the site by narrowing the catalog around your platform first.",
      href: "/platform/pc",
      linkLabel: "Browse PC games"
    },
    {
  title: "Explore PlayStation",
  description:
    "Discover PlayStation games across genres so you can quickly find what is worth playing on your system.",
  href: "/platform/playstation",
  linkLabel: "Browse PlayStation games"
},
{
  title: "Explore Xbox",
  description:
    "Discover Xbox games across genres so you can quickly find what is worth playing on your system.",
  href: "/platform/xbox",
  linkLabel: "Browse Xbox games"
},
{
  title: "Explore Switch",
  description:
    "Discover Nintendo Switch games across genres so you can quickly find what is worth playing on your system.",
  href: "/platform/switch",
  linkLabel: "Browse Switch games"
},
    {
      title: "Explore Everything",
      description:
        "Open the full index when you want the widest possible view of Gamerly instead of a curated front page.",
      href: "/all-games",
      linkLabel: "Browse all games"
    }
  ];

const genreLinks = [
  { href: "/best-rpg-games", label: "Best RPG Games" },
  { href: "/best-shooter-games", label: "Best Shooter Games" },
  { href: "/best-adventure-games", label: "Best Adventure Games" },
  { href: "/best-strategy-games", label: "Best Strategy Games" },
  { href: "/best-simulation-games", label: "Best Simulation Games" },
  { href: "/best-puzzle-games", label: "Best Puzzle Games" },
  { href: "/best-indie-games", label: "Best Indie Games" },
  { href: "/best-fighting-games", label: "Best Fighting Games" },
  { href: "/best-racing-games", label: "Best Racing Games" },
  { href: "/best-sports-games", label: "Best Sports Games" }
];

const yearLinks = [
  { href: "/best-games-2026", label: "Best Games of 2026" },
  { href: "/best-games-2025", label: "Best Games of 2025" },
  { href: "/best-games-2024", label: "Best Games of 2024" }
];

const bestPageClusters = [
  {
    title: "Best PC Games in 2025",
    links: [
      { href: "/best-pc-games-2025", label: "Best PC Games of 2025" },
      { href: "/best-rpg-games-pc-2025", label: "Best PC RPG Games of 2025" },
      { href: "/best-shooter-games-pc-2025", label: "Best PC Shooter Games of 2025" },
      { href: "/best-strategy-games-pc-2025", label: "Best PC Strategy Games of 2025" },
      { href: "/best-adventure-games-pc-2025", label: "Best PC Adventure Games of 2025" },
      { href: "/best-simulation-games-pc-2025", label: "Best PC Simulation Games of 2025" },
      { href: "/best-indie-games-pc-2025", label: "Best PC Indie Games of 2025" }
    ]
  },
  {
    title: "Best PlayStation Games in 2025",
    links: [
      { href: "/best-playstation-games-2025", label: "Best PlayStation Games of 2025" },
      { href: "/best-rpg-games-playstation-2025", label: "Best PlayStation RPG Games of 2025" },
      { href: "/best-shooter-games-playstation-2025", label: "Best PlayStation Shooter Games of 2025" },
      { href: "/best-strategy-games-playstation-2025", label: "Best PlayStation Strategy Games of 2025" },
      { href: "/best-adventure-games-playstation-2025", label: "Best PlayStation Adventure Games of 2025" },
      { href: "/best-simulation-games-playstation-2025", label: "Best PlayStation Simulation Games of 2025" },
      { href: "/best-indie-games-playstation-2025", label: "Best PlayStation Indie Games of 2025" }
    ]
  },
  {
    title: "Best Xbox Games in 2025",
    links: [
      { href: "/best-xbox-games-2025", label: "Best Xbox Games of 2025" },
      { href: "/best-rpg-games-xbox-2025", label: "Best Xbox RPG Games of 2025" },
      { href: "/best-shooter-games-xbox-2025", label: "Best Xbox Shooter Games of 2025" },
      { href: "/best-strategy-games-xbox-2025", label: "Best Xbox Strategy Games of 2025" },
      { href: "/best-adventure-games-xbox-2025", label: "Best Xbox Adventure Games of 2025" },
      { href: "/best-simulation-games-xbox-2025", label: "Best Xbox Simulation Games of 2025" },
      { href: "/best-indie-games-xbox-2025", label: "Best Xbox Indie Games of 2025" }
    ]
  },
  {
    title: "Best Switch Games in 2025",
    links: [
      { href: "/best-switch-games-2025", label: "Best Switch Games of 2025" },
      { href: "/best-rpg-games-switch-2025", label: "Best Switch RPG Games of 2025" },
      { href: "/best-shooter-games-switch-2025", label: "Best Switch Shooter Games of 2025" },
      { href: "/best-strategy-games-switch-2025", label: "Best Switch Strategy Games of 2025" },
      { href: "/best-adventure-games-switch-2025", label: "Best Switch Adventure Games of 2025" },
      { href: "/best-simulation-games-switch-2025", label: "Best Switch Simulation Games of 2025" },
      { href: "/best-indie-games-switch-2025", label: "Best Switch Indie Games of 2025" }
    ]
  }
];

  return (
    <main style={{ paddingTop: "8px", paddingBottom: "72px" }}>
      <PageContainer>
        <section
          style={{
            display: "grid",
            gap: "18px",
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              maxWidth: "100%",
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              color: "#c7d0e0",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.01em"
            }}
          >
            Curated game discovery built to cut through noise
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              maxWidth: "900px"
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.4rem, 5.4vw, 5rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                color: "#f5f7fb",
                maxWidth: "900px"
              }}
            >
              The fastest way to know what games matter right now.
            </h1>

<p
  style={{
    margin: 0,
    color: "#a7b1c6",
    fontSize: "1.08rem",
    lineHeight: 1.7,
    maxWidth: "760px"
  }}
>
  Gamerly cuts through generic game lists by ranking what actually matters using real player activity, release timing, and momentum signals. Instead of browsing endless titles, you get a clear, data-driven view of what is worth your time across PC, PlayStation, Xbox, and Nintendo Switch.
</p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <Link
              href="/hype"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#6EA8FF",
                color: "#0B1020",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(110,168,255,0.22)"
              }}
            >
              Explore Hype Rankings →
            </Link>

            <Link
              href="/upcoming-games"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#f5f7fb",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              See What Is Releasing Soon →
            </Link>

            <Link
              href="/platform/pc"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#f5f7fb",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Start With Your Platform →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px"
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))"
              }}
            >
              <div
                style={{
                  color: "#f5f7fb",
                  fontSize: "1.2rem",
                  fontWeight: 800
                }}
              >
                {formatCount(totalGamesCount)}+
              </div>
              <div
                style={{
                  marginTop: "4px",
                  color: "#a7b1c6",
                  lineHeight: 1.5
                }}
              >
                games tracked across the discovery index
              </div>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))"
              }}
            >
              <div
                style={{
                  color: "#f5f7fb",
                  fontSize: "1.2rem",
                  fontWeight: 800
                }}
              >
                {formatCount(upcomingThirtyDayCount)}
              </div>
              <div
                style={{
                  marginTop: "4px",
                  color: "#a7b1c6",
                  lineHeight: 1.5
                }}
              >
                launches scheduled in the next 30 days
              </div>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))"
              }}
            >
              <div
                style={{
                  color: "#f5f7fb",
                  fontSize: "1.2rem",
                  fontWeight: 800
                }}
              >
                {formatCount(trackedLiveSignalCount)}
              </div>
              <div
                style={{
                  marginTop: "4px",
                  color: "#a7b1c6",
                  lineHeight: 1.5
                }}
              >
                games showing live momentum signals
              </div>
            </div>
          </div>

<div
  style={{
    marginTop: "-2px",
    color: "#9aa3b2",
    fontSize: "0.86rem",
    lineHeight: 1.6
  }}
>
  Featured selection is based on momentum, release timing, and player
  attention instead of raw release lists alone. Gamerly continuously
  tracks thousands of games and real-time activity signals to surface
  what is actually worth paying attention to.
</div>
        </section>

        <FeaturedHero
          featured={featuredGame}
          upcoming={upcomingHero}
          viewerCount={featuredViewerCount}
        />

        <div hidden aria-hidden="true" data-ad-slot="home-top-leaderboard" />

{hasHypeGames ? (
  <SectionBlock>
    <SectionHeading
      title="Most Hyped Games"
      subtitle="These are the games building the strongest mix of player attention, release proximity, rating strength, and momentum."
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.35fr 1fr 1fr",
        gap: "14px",
        marginBottom: "18px"
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(110,168,255,0.12), rgba(255,255,255,0.03))",
          padding: "18px"
        }}
      >
        <div
          style={{
            color: "#8bb9ff",
            fontWeight: 800,
            marginBottom: "6px",
            letterSpacing: "0.02em",
            fontSize: "0.84rem"
          }}
        >
          WHY THIS MATTERS
        </div>

        <div
          style={{
            color: "#f5f7fb",
            fontWeight: 700,
            lineHeight: 1.5,
            fontSize: "1.05rem"
          }}
        >
          This is the fastest way to know which games actually matter right now.
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#a7b1c6",
            lineHeight: 1.6
          }}
        >
          It cuts through generic release lists and surfaces real momentum using
          live player activity, release timing, and broader attention signals.
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.03)",
          padding: "16px"
        }}
      >
        <div
          style={{
            color: "#f5f7fb",
            fontWeight: 700,
            marginBottom: "6px"
          }}
        >
          What drives rank
        </div>

        <div
          style={{
            color: "#a7b1c6",
            lineHeight: 1.6
          }}
        >
          Live activity, release timing, rating strength, and broader attention
          signals are combined instead of relying on one weak metric.
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.03)",
          padding: "16px"
        }}
      >
        <div
          style={{
            color: "#f5f7fb",
            fontWeight: 700,
            marginBottom: "6px"
          }}
        >
          When to use it
        </div>

        <div
          style={{
            color: "#a7b1c6",
            lineHeight: 1.6
          }}
        >
          Use this when you want one fast answer: what games are worth paying
          attention to right now.
        </div>
      </div>
    </div>

    <GameCarousel games={hypeGames} />

    <div className="sectionMoreLink">
      <Link href="/hype">Browse all hype rankings →</Link>
    </div>
  </SectionBlock>
) : null}

        {hasReleasingSoonGames ? (
          <SectionBlock>
            <SectionHeading
              title="Releasing Soon"
              subtitle="These are the launches closest to release when you are deciding what to play next, not just what to watch."
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
              subtitle="The next wave of scheduled launches across Gamerly in the next 30 days."
            />

            <GameCarousel games={upcomingGames} />

            <div className="sectionMoreLink">
              <Link href="/upcoming-games">View all upcoming games →</Link>
            </div>
          </SectionBlock>
        ) : null}

        <SectionBlock>
          <SectionHeading
            title="Choose Your Discovery Path"
            subtitle="Start from the intent that matches what you want to do next instead of bouncing between generic homepage sections."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}
          >
            {intentCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                style={{
                  display: "block",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
                  padding: "18px",
                  textDecoration: "none",
                  transition: "transform 160ms ease, border-color 160ms ease"
                }}
              >
                <div
                  style={{
                    color: "#f5f7fb",
                    fontSize: "1.04rem",
                    fontWeight: 800,
                    lineHeight: 1.35
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#a7b1c6",
                    lineHeight: 1.65
                  }}
                >
                  {card.description}
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    color: "#8bb9ff",
                    fontWeight: 700
                  }}
                >
                  {card.linkLabel} →
                </div>
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
    subtitle="Start from the system you actually play on so the site becomes useful immediately."
  />

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "14px",
      marginBottom: "18px"
    }}
  >
    <Link
      href="/platform/pc"
      style={{
        display: "block",
        padding: "16px",
        borderRadius: "14px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700
      }}
    >
      PC Games
    </Link>

    <Link
      href="/platform/playstation"
      style={{
        display: "block",
        padding: "16px",
        borderRadius: "14px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700
      }}
    >
      PlayStation Games
    </Link>

    <Link
      href="/platform/xbox"
      style={{
        display: "block",
        padding: "16px",
        borderRadius: "14px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700
      }}
    >
      Xbox Games
    </Link>

    <Link
      href="/platform/switch"
      style={{
        display: "block",
        padding: "16px",
        borderRadius: "14px",
        textDecoration: "none",
        color: "#f5f7fb",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700
      }}
    >
      Nintendo Switch Games
    </Link>
  </div>

</SectionBlock>

<SectionBlock>
  <SectionHeading
    title="Best Games by Platform in 2025"
    subtitle="These are the best games in 2025 for each platform, curated for you."
  />

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
      marginBottom: "18px"
    }}
  >
    {bestPageClusters.map((cluster) => (
      <div
        key={cluster.title}
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
          padding: "18px"
        }}
      >
        <div
          style={{
            color: "#f5f7fb",
            fontSize: "1rem",
            fontWeight: 800,
            lineHeight: 1.35,
            marginBottom: "12px"
          }}
        >
          {cluster.title}
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px"
          }}
        >
          {cluster.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "#8bb9ff",
                textDecoration: "none",
                fontWeight: 700,
                lineHeight: 1.5
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    ))}
  </div>
</SectionBlock>

<SectionBlock>
  <SectionHeading
    title="Best Games by Platform in 2026"
    subtitle="Explore the strongest games released in 2026 across each platform."
  />

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
      marginBottom: "18px"
    }}
  >
    {[
      {
        title: "Best PC Games in 2026",
        links: [
          { href: "/best-pc-games-2026", label: "Best PC Games of 2026" }
        ]
      },
      {
        title: "Best PlayStation Games in 2026",
        links: [
          { href: "/best-playstation-games-2026", label: "Best PlayStation Games of 2026" }
        ]
      },
      {
        title: "Best Xbox Games in 2026",
        links: [
          { href: "/best-xbox-games-2026", label: "Best Xbox Games of 2026" }
        ]
      },
      {
        title: "Best Switch Games in 2026",
        links: [
          { href: "/best-switch-games-2026", label: "Best Switch Games of 2026" }
        ]
      }
    ].map((cluster) => (
      <div
        key={cluster.title}
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
          padding: "18px"
        }}
      >
        <div
          style={{
            color: "#f5f7fb",
            fontSize: "1rem",
            fontWeight: 800,
            lineHeight: 1.35,
            marginBottom: "12px"
          }}
        >
          {cluster.title}
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px"
          }}
        >
          {cluster.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "#8bb9ff",
                textDecoration: "none",
                fontWeight: 700,
                lineHeight: 1.5
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    ))}
  </div>
</SectionBlock>

<SectionBlock>
  <SectionHeading
    title="Browse by Genre"
    subtitle="Jump straight into the type of game you want when you know the lane, but not the title."
  />

  <div className="genreGrid">
    {genreLinks.map((genre) => (
      <Link key={genre.href} href={genre.href}>
        {genre.label}
      </Link>
    ))}

    {yearLinks.map((year) => (
      <Link key={year.href} href={year.href}>
        {year.label}
      </Link>
    ))}
    <Link href="/all-games">All Games</Link>
    <Link href="/platform/playstation">PlayStation Games</Link>
    <Link href="/platform/playstation/rpg">PlayStation RPG Games</Link>
    <Link href="/platform/xbox">Xbox Games</Link>
    <Link href="/platform/switch">Nintendo Switch Games</Link>
  </div>
</SectionBlock>
      </PageContainer>
    </main>
  );
}