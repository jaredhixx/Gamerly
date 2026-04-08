import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import type { GenreSlug } from "../../lib/genres";
import type { PlatformSlug } from "../../lib/platforms";

type Props = {
  year: number;
  genreSlug: GenreSlug;
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

export default async function BestGenrePlatformGamesByYearPage({
  year,
  genreSlug,
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

    if (releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const hasGenre = game.genreSlugs?.includes(genreSlug);
    const hasPlatform = game.platformSlugs?.includes(platformSlug);

    return releaseYear === year && hasGenre && hasPlatform;
  });

  const strongMatchingGames = allMatchingGames.filter((game) => {
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;

    return rating >= 70 && ratingCount >= 1;
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
  const sortedAllGames = sortGames(allMatchingGames);

  const strongGameIds = new Set(sortedStrongGames.map((game) => game.id));

  const additionalGames = sortedAllGames.filter(
    (game) => !strongGameIds.has(game.id)
  );

  const topPicks = sortedStrongGames.slice(0, 12);
  const fullList = additionalGames.slice(0, 60);

  return (
    <PageContainer>
      <div style={READABLE_SECTION_STYLE}>
        <SectionHeading
          title={pageTitle}
          subtitle={pageSubtitle}
          centered
        />
      </div>

      <div style={INTRO_SECTION_STYLE}>
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
          This list of the best{" "}
          <Link
            href={`/best-${genreSlug}-games`}
            style={{ color: "#8bb9ff", fontWeight: 600 }}
          >
            {genreSlug} games
          </Link>{" "}
          on{" "}
          <Link
            href={`/platform/${platformSlug}`}
            style={{ color: "#8bb9ff", fontWeight: 600 }}
          >
            {platformSlug}
          </Link>{" "}
          in{" "}
          <Link
            href={`/best-games-${year}`}
            style={{ color: "#8bb9ff", fontWeight: 600 }}
          >
            {year}
          </Link>{" "}
          focuses on titles that have already released and built real momentum with players.
          Rankings are based on a combination of critic scores, player reception,
          and overall visibility within the current gaming landscape.
        </p>

        <p style={{ maxWidth: "none" }}>
          Whether you are looking for the highest rated releases or hidden gems that
          gained traction over time, this page highlights the strongest {genreSlug}
          experiences available on {platformSlug} in {year} without including
          unreleased or low-signal titles.
        </p>
      </div>

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
    href: `/best-${platformSlug}-games-${year}`,
    label: `Best ${platformSlug} games of ${year}`,
    tag: "Platform best"
  },
  {
    href: `/best-${genreSlug}-games`,
    label: `Best ${genreSlug.toUpperCase()} games`,
    tag: "Genre best"
  },
  {
    href: `/best-games-${year}`,
    label: `Best games of ${year}`,
    tag: "Year page"
  },
  {
    href: `/platform/${platformSlug}`,
    label: `Browse all ${platformSlug} games`,
    tag: "Platform hub"
  },
  {
    href: `/genre/${genreSlug}`,
    label: `Browse all ${genreSlug.toUpperCase()} games`,
    tag: "Genre hub"
  },
  {
    href: `/best-rpg-games-${platformSlug}-${year}`,
    label: `Best RPG games on ${platformSlug} in ${year}`,
    tag: "RPG"
  },
  {
    href: `/best-shooter-games-${platformSlug}-${year}`,
    label: `Best shooter games on ${platformSlug} in ${year}`,
    tag: "Shooter"
  },
  {
    href: `/best-strategy-games-${platformSlug}-${year}`,
    label: `Best strategy games on ${platformSlug} in ${year}`,
    tag: "Strategy"
  },
  {
    href: `/best-adventure-games-${platformSlug}-${year}`,
    label: `Best adventure games on ${platformSlug} in ${year}`,
    tag: "Adventure"
  },
  {
    href: `/best-simulation-games-${platformSlug}-${year}`,
    label: `Best simulation games on ${platformSlug} in ${year}`,
    tag: "Simulation"
  },
  {
    href: `/best-indie-games-${platformSlug}-${year}`,
    label: `Best indie games on ${platformSlug} in ${year}`,
    tag: "Indie"
  },
  {
    href: `/new-games`,
    label: `Browse newly released games`,
    tag: "Discovery"
  },
  {
    href: `/upcoming-games`,
    label: `Browse upcoming games`,
    tag: "Discovery"
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

      <section style={GRID_SECTION_STYLE}>
        <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
          <h2>{topSectionHeading}</h2>

          <p style={{ maxWidth: "none" }}>
            {topSectionIntro}
          </p>
        </div>

        {topPicks.length > 0 ? (
          <GameGrid
            games={topPicks}
            prioritizedPlatformSlug={platformSlug}
          />
        ) : (
          <div style={READABLE_SECTION_HEADER_STYLE}>
            <p>
              There are no strong ranked games for this combination yet, but you
              can still browse other released games below.
            </p>
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
          <div style={READABLE_SECTION_HEADER_STYLE}>
            <p>No additional released games are available for this combination yet.</p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}