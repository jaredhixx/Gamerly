import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import type { PlatformSlug } from "../../lib/platforms";

type Props = {
  year: number;
  platformSlug: PlatformSlug;
  pageTitle: string;
  pageSubtitle: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  exploreHeading: string;
  topSectionHeading: string;
  topSectionIntro: string;
  fullListHeading: string;
};

const READABLE_WIDTH = "820px";
const GRID_WIDTH = "1100px";

const READABLE_SECTION_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 40px"
} as const;

const INTRO_SECTION_STYLE = {
  maxWidth: "760px",
  margin: "0 auto 40px",
  textAlign: "left"
} as const;

const READABLE_SECTION_HEADER_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 20px"
} as const;

const CENTERED_READABLE_SECTION_HEADER_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 20px",
  textAlign: "center"
} as const;

const GRID_SECTION_STYLE = {
  maxWidth: GRID_WIDTH,
  margin: "0 auto 40px"
} as const;

const EXPLORE_SECTION_STYLE = {
  ...READABLE_SECTION_STYLE,
  padding: "24px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.02)"
} as const;

export default async function BestPlatformGamesByYearPage({
  year,
  platformSlug,
  pageTitle,
  pageSubtitle,
  introParagraphOne,
  introParagraphTwo,
  exploreHeading,
  topSectionHeading,
  topSectionIntro,
  fullListHeading
}: Props) {
  const games = await fetchGames();

  const allMatchingGames = games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (year !== new Date().getUTCFullYear() && releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const hasPlatform = game.platformSlugs?.includes(platformSlug);

    return releaseYear === year && hasPlatform;
  });

  const strongMatchingGames = allMatchingGames.filter((game) => {
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;

    return rating >= 70 && ratingCount >= 2;
  });

  const sortGames = (gamesToSort: typeof allMatchingGames) => {
    return [...gamesToSort].sort((a, b) => {
      const ratingA = a.aggregated_rating ?? 0;
      const ratingB = b.aggregated_rating ?? 0;
      const countA = a.aggregated_rating_count ?? 0;
      const countB = b.aggregated_rating_count ?? 0;

      const scoreA = ratingA + Math.min(countA, 20) * 0.35;
      const scoreB = ratingB + Math.min(countB, 20) * 0.35;

      const scoreDiff = scoreB - scoreA;

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      const ratingDiff = ratingB - ratingA;

      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      const countDiff = countB - countA;

      if (countDiff !== 0) {
        return countDiff;
      }

      return (
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
      );
    });
  };

  const sortedStrongGames = sortGames(strongMatchingGames);
  const sortedAllMatchingGames = sortGames(allMatchingGames);

  const topPicks = sortedStrongGames.slice(0, 12);
  const topPickIds = new Set(topPicks.map((game) => game.id));

  const fullList = sortedAllMatchingGames
    .filter((game) => !topPickIds.has(game.id))
    .slice(0, 60);

    const platformDisplayName =
    platformSlug === "pc"
      ? "PC"
      : platformSlug === "playstation"
        ? "PlayStation"
        : platformSlug === "xbox"
          ? "Xbox"
          : platformSlug === "switch"
            ? "Switch"
            : platformSlug;

  return (
    <PageContainer>
<div style={READABLE_SECTION_STYLE}>
  <SectionHeading
    title={pageTitle}
    subtitle={pageSubtitle}
    centered
  />

<div style={{ marginTop: "18px", textAlign: "center" }}>
  <div
    style={{
      marginBottom: "10px",
      fontSize: "0.95rem",
      color: "var(--text-muted)"
    }}
  >
    Quick paths:
  </div>

<div className="heroQuickLinks">
  <Link
    href={`/platform/${platformSlug}`}
    className="heroQuickLinkPill"
  >
    Browse all {platformDisplayName} games
  </Link>

  <Link
    href={`/best-games-${year}`}
    className="heroQuickLinkPill"
  >
    See the best games of {year}
  </Link>

  <Link
    href={`/platform/${platformSlug}/new`}
    className="heroQuickLinkPill"
  >
    See new {platformDisplayName} games
  </Link>
</div>
</div>
</div>

<div style={INTRO_SECTION_STYLE}>
<p
  style={{
    maxWidth: "720px",
    margin: "0 auto 18px auto",
    textAlign: "center",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#cfd6e6"
  }}
>
  Not all {platformDisplayName} games in {year} are worth your time. This page filters out low-signal releases and ranks only the strongest games based on review scores, player interest, and overall impact, so you can quickly find what is actually worth playing.
</p>
  <p style={{ maxWidth: "none" }}>{introParagraphOne}</p>
  <p style={{ maxWidth: "none" }}>{introParagraphTwo}</p>

    <p style={{ marginTop: "16px", maxWidth: "none" }}>
  <strong>How these games are ranked:</strong> Rankings are based on a combination of
  critic scores, player interest, and overall release impact. Games with stronger
  review performance, higher engagement, and more lasting relevance are prioritized
  higher on the list, while lower-signal or newly released titles may appear lower
  until more data becomes available.
</p>


<p style={{ maxWidth: "none" }}>
  This page tracks the best{" "}
  <Link href={`/best-games-${year}`} className="inlineTextLink">
    games of {year}
  </Link>{" "}
  on{" "}
  <Link href={`/platform/${platformSlug}`} className="inlineTextLink">
    {platformDisplayName}
  </Link>{" "}
  using released titles that have already started to separate themselves through review scores, audience response, and overall visibility.
</p>

  <p>
    If you want the strongest games available on {platformDisplayName} in {year}, this list is built to surface the titles with the clearest quality signals while filtering out unreleased or low-signal entries.
  </p>
</div>



<section style={GRID_SECTION_STYLE}>
  <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
    <h2>{topSectionHeading}</h2>

    <p style={{ maxWidth: "none" }}>
      {topSectionIntro}
    </p>
  </div>

{topPicks.length > 0 ? (
  <>
    <p
      style={{
        maxWidth: "700px",
        margin: "0 auto 18px auto",
        textAlign: "center"
      }}
    >
      These are the strongest {platformDisplayName} games of {year} based on rating and player interest. Click any game to see whether it is worth playing, including rating, release details, platforms, trailer, and similar games.
    </p>

    <GameGrid
      games={topPicks}
      prioritizedPlatformSlug={platformSlug}
    />
  </>
) : (
          <div style={READABLE_SECTION_HEADER_STYLE}>
            <p>No strong ranked platform games are available for this year yet.</p>
          </div>
        )}
      </section>

<section style={GRID_SECTION_STYLE}>
        <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
          <h2>{fullListHeading}</h2>
        </div>

        {fullList.length > 0 ? (
          <GameGrid
            games={fullList}
            prioritizedPlatformSlug={platformSlug}
          />
        ) : (
          <p>No strong ranked platform games are available for this year yet.</p>
        )}
      </section>

            <section style={EXPLORE_SECTION_STYLE}>
        <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
          <h2>{exploreHeading}</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
    marginTop: "18px"
  }}
>
  {[
    {
      href: `/platform/${platformSlug}`,
      label: `Browse all ${platformDisplayName} games`,
      tag: "Platform hub"
    },
    {
      href: `/best-games-${year}`,
      label: `Best games of ${year}`,
      tag: "Year page"
    },
    {
      href: `/best-rpg-games-${platformSlug}-${year}`,
      label: `Best RPG games on ${platformDisplayName} in ${year}`,
      tag: "RPG"
    },
    {
      href: `/best-shooter-games-${platformSlug}-${year}`,
      label: `Best shooter games on ${platformDisplayName} in ${year}`,
      tag: "Shooter"
    },
    {
      href: `/best-adventure-games-${platformSlug}-${year}`,
      label: `Best adventure games on ${platformDisplayName} in ${year}`,
      tag: "Adventure"
    },
    {
      href: `/best-strategy-games-${platformSlug}-${year}`,
      label: `Best strategy games on ${platformDisplayName} in ${year}`,
      tag: "Strategy"
    },
    {
      href: `/best-simulation-games-${platformSlug}-${year}`,
      label: `Best simulation games on ${platformDisplayName} in ${year}`,
      tag: "Simulation"
    },
    {
      href: `/best-indie-games-${platformSlug}-${year}`,
      label: `Best indie games on ${platformDisplayName} in ${year}`,
      tag: "Indie"
    }
  ].map((item) => (
<Link
  key={item.href}
  href={item.href}
  className="bestExploreTile"
>
  <div className="bestExploreTileTag">
    {item.tag}
  </div>

  <div className="bestExploreTileTitle">
    {item.label}
  </div>

  <div className="bestExploreTileCTA">
    Explore →
  </div>
</Link>
  ))}
</div>
        </div>
      </section>

    </PageContainer>
  );
}