import type { Metadata } from "next";
import Link from "next/link";
import { getDerivedGameData } from "../../lib/game-data";
import GameGrid from "../../components/game/GameGrid";
import GameCarousel from "../../components/game/GameCarousel";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import { buildCanonicalUrl } from "../../lib/site";

const PAGE_SIZE = 60;
const PLATFORM_PREVIEW_SIZE = 8;

export const metadata: Metadata = {
  title: "Top Rated Games",
  description:
    "Discover the highest rated video games across PC, PlayStation, Xbox, and Nintendo Switch.",
  alternates: {
    canonical: buildCanonicalUrl("/top-rated")
  }
};

export const revalidate = 3600;

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
    title: "Top Rated PC Games",
    href: "/platform/pc",
    description:
      "Browse the highest rated PC games and discover which releases are standing out most on the platform."
  },
  {
    slug: "playstation",
    title: "Top Rated PlayStation Games",
    href: "/platform/playstation",
    description:
      "See the highest rated PlayStation games and explore standout releases across Sony platforms."
  },
  {
    slug: "xbox",
    title: "Top Rated Xbox Games",
    href: "/platform/xbox",
    description:
      "Track the highest rated Xbox games and find the strongest reviewed titles on the platform."
  },
  {
    slug: "switch",
    title: "Top Rated Switch Games",
    href: "/platform/switch",
    description:
      "Explore the highest rated Nintendo Switch games and discover the best reviewed titles available there."
  }
] as const;

export default async function TopRatedPage() {
  const { topRated } = await getDerivedGameData();

  const now = new Date();
  const currentYear = now.getFullYear();

  const topRatedThisYear = topRated.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (Number.isNaN(releaseDate.getTime())) {
      return false;
    }

    return releaseDate.getFullYear() === currentYear;
  });

  const firstPageGames = topRated.slice(0, PAGE_SIZE);

  const topRatedByPlatform = platformSections.map((section) => ({
    ...section,
    games: topRated
      .filter((game) => hasPlatform(game.platforms, section.slug))
      .slice(0, PLATFORM_PREVIEW_SIZE)
  }));

  return (
    <PageContainer>
      <SectionHeading
        title="Top Rated Games"
        subtitle="Browse the strongest reviewed games across all major platforms."
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
          This page highlights the highest rated video games across PC,
          PlayStation, Xbox, and Nintendo Switch so you can quickly find the
          strongest reviewed releases worth your attention.
        </p>

        <p style={{ margin: 0 }}>
          Start with the top rated games from this year below, then explore the
          platform sections if you want to narrow the view by system, or keep
          scrolling for the broader top rated list.
        </p>
      </div>

      <section style={{ marginBottom: "48px" }}>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "12px"
  }}
>
  <h2
    style={{
      margin: 0,
      fontSize: "24px",
      fontWeight: 800,
      color: "#f5f7fb"
    }}
  >
    Best Games This Year
  </h2>

  <Link
    href="/releases"
    style={{
      color: "#8bb9ff",
      fontWeight: 800,
      textDecoration: "none"
    }}
  >
    View release calendar →
  </Link>
</div>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#a7b1c6",
            lineHeight: 1.7,
            maxWidth: "880px"
          }}
        >
          Browse the highest rated games released in {currentYear} to quickly
          see which recent titles are standing out most.
        </p>

        <GameCarousel games={topRatedThisYear.slice(0, 20)} />
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
          Browse Top Rated Games by Platform
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
          Use the sections below to focus on the strongest reviewed games for a
          specific platform, or continue to the main top rated list further down
          the page for a wider view.
        </p>

        <div style={{ display: "grid", gap: "40px" }}>
          {topRatedByPlatform.map((section) => {
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
                    Browse all {section.title.replace("Top Rated ", "")}
                  </Link>

                  <Link
                    href="/top-rated"
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    See all top rated games
                  </Link>

                  <Link
                    href="/new-games"
                    style={{
                      color: "#8bb9ff",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    Browse new games
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
          All Top Rated Games
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
          Browse the main top rated games grid below for a wider view across the
          strongest reviewed titles in the catalog.
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
            href="/upcoming-games"
            style={{
              color: "#8bb9ff",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Upcoming Games
          </Link>

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
        </div>
      </section>
    </PageContainer>
  );
}