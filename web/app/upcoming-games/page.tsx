import type { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

const PAGE_SIZE = 60;
const PLATFORM_PREVIEW_SIZE = 8;

export const metadata: Metadata = {
  title: "Upcoming Games",
  description:
    "Browse upcoming video game releases across all major platforms, including PC, PlayStation, Xbox, and Nintendo Switch.",
  alternates: {
    canonical: buildCanonicalUrl("/upcoming-games")
  }
};

function hasPlatform(gamePlatforms: string[] | undefined, platformSlug: string) {
  if (!gamePlatforms || gamePlatforms.length === 0) {
    return false;
  }

  if (platformSlug === "pc") {
    return gamePlatforms.some((platform) => platform.includes("PC"));
  }

  if (platformSlug === "playstation") {
    return gamePlatforms.some((platform) => platform.includes("PlayStation"));
  }

  if (platformSlug === "xbox") {
    return gamePlatforms.some((platform) => platform.includes("Xbox"));
  }

  if (platformSlug === "switch") {
    return gamePlatforms.some((platform) => platform.includes("Switch"));
  }

  return false;
}

const platformSections = [
  {
    slug: "pc",
    title: "Upcoming PC Games",
    href: "/platform/pc",
    description:
      "See upcoming PC releases across major genres, from big launches to smaller breakout titles."
  },
  {
    slug: "playstation",
    title: "Upcoming PlayStation Games",
    href: "/platform/playstation",
    description:
      "Browse upcoming PlayStation releases and see what is coming soon to Sony platforms."
  },
  {
    slug: "xbox",
    title: "Upcoming Xbox Games",
    href: "/platform/xbox",
    description:
      "Track upcoming Xbox releases and discover what is scheduled to launch soon."
  },
  {
    slug: "switch",
    title: "Upcoming Switch Games",
    href: "/platform/switch",
    description:
      "Explore upcoming Nintendo Switch releases and find notable games arriving soon."
  }
] as const;

export default async function UpcomingGamesPage() {
  const { upcomingGames } = await getDerivedGameData();

  const firstPageGames = upcomingGames.slice(0, PAGE_SIZE);
  const totalPages = Math.ceil(upcomingGames.length / PAGE_SIZE);

  const upcomingByPlatform = platformSections.map((section) => ({
    ...section,
    games: upcomingGames
      .filter((game) => hasPlatform(game.platforms, section.slug))
      .slice(0, PLATFORM_PREVIEW_SIZE)
  }));

  return (
    <PageContainer>
      <SectionHeading
        title="Upcoming Video Games"
        subtitle="Browse upcoming releases across all major platforms."
      />

      <div
        style={{
          maxWidth: "880px",
          marginBottom: "28px",
          display: "grid",
          gap: "12px",
          color: "#a7b1c6",
          lineHeight: 1.7
        }}
      >
        <p style={{ margin: 0 }}>
          This page tracks upcoming video game releases across PC, PlayStation,
          Xbox, and Nintendo Switch so you can quickly see what is coming soon.
        </p>

        <p style={{ margin: 0 }}>
          Start with the platform sections below if you want a narrower view, or
          continue to the full release grid for a broader look across the
          upcoming catalog.
        </p>
      </div>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "12px",
            color: "#f5f7fb"
          }}
        >
          Browse Upcoming Games by Platform
        </h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#a7b1c6",
            lineHeight: 1.7,
            maxWidth: "880px"
          }}
        >
          Jump into a specific platform below, or use the full upcoming release
          grid further down the page if you want to browse everything in one
          place.
        </p>

        <div style={{ display: "grid", gap: "40px" }}>
          {upcomingByPlatform.map((section) => {
            if (section.games.length === 0) {
              return null;
            }

            return (
              <section key={section.slug}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "10px"
                  }}
                >
                  <div style={{ maxWidth: "760px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#f5f7fb"
                      }}
                    >
                      {section.title}
                    </h3>

                    <p
                      style={{
                        marginTop: "8px",
                        marginBottom: 0,
                        color: "#a7b1c6",
                        lineHeight: 1.6
                      }}
                    >
                      {section.description}
                    </p>
                  </div>

                  <Link
                    href={section.href}
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 800,
                      textDecoration: "none"
                    }}
                  >
                    View all →
                  </Link>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "14px",
                    marginBottom: "16px"
                  }}
                >
                  <Link
                    href={section.href}
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    Browse all {section.title.replace("Upcoming ", "")}
                  </Link>

                  <Link
                    href="/upcoming-games"
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    See all upcoming games
                  </Link>

                  <Link
                    href="/releases"
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    Open release calendar
                  </Link>
                </div>

                <GameGrid games={section.games} />
              </section>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "12px",
            color: "#f5f7fb"
          }}
        >
          All Upcoming Releases
        </h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#a7b1c6",
            lineHeight: 1.7,
            maxWidth: "880px"
          }}
        >
          Browse the main upcoming games grid below for a wider view across the
          full release pipeline.
        </p>

        <GameGrid games={firstPageGames} />
      </section>

      <section
        style={{
          marginTop: "48px",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)"
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "12px",
            fontSize: "22px",
            fontWeight: 800,
            color: "#f5f7fb"
          }}
        >
          Keep Browsing
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          <Link
            href="/new-games"
            style={{
              color: "#8bb9ff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            New Games
          </Link>

          <Link
            href="/games-releasing-this-month"
            style={{
              color: "#8bb9ff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Games Releasing This Month
          </Link>

          <Link
            href="/releases"
            style={{
              color: "#8bb9ff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Release Calendar
          </Link>

          <Link
            href="/top-rated"
            style={{
              color: "#8bb9ff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Top Rated Games
          </Link>
        </div>
      </section>

      {totalPages > 1 && (
        <div style={{ marginTop: "40px" }}>
          {Array.from({ length: totalPages - 1 }, (_, index) => {
            const page = index + 2;

            return (
              <Link
                key={page}
                href={`/upcoming-games/page/${page}`}
                style={{
                  marginRight: "12px",
                  color: "#6aa6ff"
                }}
              >
                Page {page}
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}