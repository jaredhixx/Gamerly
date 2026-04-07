import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import { getBestPageBySlug } from "../../lib/best-pages-registry";
import { type GenreSlug } from "../../lib/genres";

type Props = {
  genreSlug: GenreSlug;
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

export default async function BestGenreGamesPage({
  genreSlug,
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

  const matchingGames = games.filter((game: any) => {
    if (!game.genreSlugs?.includes(genreSlug)) {
      return false;
    }

    if (!game.releaseDate) {
      return false;
    }

    return new Date(game.releaseDate) <= new Date();
  });

  const sortedGames = [...matchingGames].sort((a, b) => {
    const ratingA = a.aggregated_rating ?? 0;
    const ratingB = b.aggregated_rating ?? 0;
    const countA = a.aggregated_rating_count ?? 0;
    const countB = b.aggregated_rating_count ?? 0;

    const scoreA = ratingA * Math.log10(countA + 1);
    const scoreB = ratingB * Math.log10(countB + 1);

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

  const topPicks = sortedGames.slice(0, 12);
  const fullList = sortedGames.slice(0, 60);

  const genreDisplayName = pageTitle.replace("Best ", "").replace(" Games", "");

  const platformExploreLinks = [
    {
      href: `/best-${genreSlug}-games-pc-2025`,
      label: `Best ${genreDisplayName} games on PC in 2025`
    },
    {
      href: `/best-${genreSlug}-games-playstation-2025`,
      label: `Best ${genreDisplayName} games on PlayStation in 2025`
    },
    {
      href: `/best-${genreSlug}-games-xbox-2025`,
      label: `Best ${genreDisplayName} games on Xbox in 2025`
    },
    {
      href: `/best-${genreSlug}-games-switch-2025`,
      label: `Best ${genreDisplayName} games on Switch in 2025`
    }
  ].filter((link) => {
    const slug = link.href.replace("/", "");
    return Boolean(getBestPageBySlug(slug));
  });

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
          <strong>How these games are ranked:</strong> Rankings are based on a
          combination of critic scores, player interest, and overall release
          impact. Games with stronger review performance, higher engagement, and
          more lasting relevance are prioritized higher on the list, while
          lower-signal or niche titles may appear lower even if they fit the genre.
        </p>

        <p style={{ maxWidth: "none" }}>
          This page tracks the best{" "}
          <Link
            href={`/genre/${genreSlug}`}
            style={{ color: "#8bb9ff", fontWeight: 600 }}
          >
            {genreDisplayName.toLowerCase()}
          </Link>{" "}
          games available right now using released titles that have already
          separated themselves through review scores, audience response, and
          overall visibility.
        </p>

        <p style={{ maxWidth: "none" }}>
          If you want the strongest games in this genre without digging through
          weaker or lower-signal releases, this list is built to surface the
          titles with the clearest quality signals first.
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
    ...platformExploreLinks.map((link) => ({
      href: link.href,
      label: link.label,
      tag: "Platform best"
    })),
    {
      href: `/genre/${genreSlug}`,
      label: `Browse all ${genreDisplayName.toLowerCase()} games`,
      tag: "Genre hub"
    },
    {
      href: `/best-games-2026`,
      label: `Browse best games of 2026`,
      tag: "Year page"
    }
  ].map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className="exploreTile"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "118px",
        padding: "16px 18px",
        borderRadius: "16px",
        textDecoration: "none",
        color: "#f5f7fb",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
        border: "1px solid rgba(255,255,255,0.075)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        lineHeight: 1.35,
        textAlign: "left",
        transition: "all 180ms ease"
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#8bb9ff",
          marginBottom: "10px"
        }}
      >
        {item.tag}
      </div>

      <div
        style={{
          color: "#f5f7fb",
          fontSize: "16px",
          fontWeight: 700
        }}
      >
        {item.label}
      </div>

      <div
        style={{
          marginTop: "14px",
          color: "#9ec5ff",
          fontWeight: 700,
          fontSize: "14px"
        }}
      >
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
  <>
    <p
      style={{
        maxWidth: "700px",
        margin: "0 auto 18px auto",
        textAlign: "center"
      }}
    >
      These are the strongest {genreDisplayName.toLowerCase()} games available right now based on rating and player interest. Click any game to see whether it is worth playing, including rating, release details, platforms, trailer, and similar games.
    </p>

    <GameGrid games={topPicks} />
  </>
) : (
          <div style={READABLE_SECTION_HEADER_STYLE}>
            <p>No strong ranked genre games are available yet.</p>
          </div>
        )}
      </section>

      <section style={GRID_SECTION_STYLE}>
        <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
          <h2>{fullListHeading}</h2>
        </div>

        {fullList.length > 0 ? (
          <GameGrid games={fullList} />
        ) : (
          <p>No strong ranked genre games are available yet.</p>
        )}
      </section>
    </PageContainer>
  );
}