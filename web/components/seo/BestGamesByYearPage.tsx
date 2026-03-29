import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";

const READABLE_WIDTH = "820px";
const GRID_WIDTH = "1100px";

const READABLE_SECTION_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 32px"
} as const;

const READABLE_SECTION_HEADER_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 20px"
} as const;

const CENTERED_READABLE_SECTION_STYLE = {
  ...READABLE_SECTION_STYLE,
  textAlign: "center"
} as const;

const CENTERED_READABLE_SECTION_HEADER_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 20px",
  textAlign: "center"
} as const;

const LEFT_ALIGNED_READABLE_SECTION_HEADER_STYLE = {
  ...READABLE_SECTION_HEADER_STYLE,
  textAlign: "left"
} as const;

const GRID_SECTION_STYLE = {
  maxWidth: GRID_WIDTH,
  margin: "0 auto 32px"
} as const;

const EXPLORE_SECTION_STYLE = {
  ...READABLE_SECTION_STYLE,
  padding: "24px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.02)"
} as const;

type Props = {
  year: number;
  pageTitle: string;
  pageSubtitle: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  exploreHeading: string;
  topSectionHeading: string;
  topSectionIntro: string;
  fullListHeading: string;
};

export default async function BestGamesByYearPage({
  year,
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

  const matchingGames = games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;

    return releaseYear === year && rating >= 70 && ratingCount >= 1;
  });

  const sortedGames = [...matchingGames].sort((a, b) => {
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

  const topPicks = sortedGames.slice(0, 12);
  const fullList = sortedGames.slice(0, 60);

  return (
    <PageContainer>
      <div style={CENTERED_READABLE_SECTION_STYLE}>
        <SectionHeading
          title={pageTitle}
          subtitle={pageSubtitle}
          centered
        />
      </div>

<div style={READABLE_SECTION_STYLE}>
  <p style={{ maxWidth: "none" }}>{introParagraphOne}</p>
  <p style={{ maxWidth: "none" }}>{introParagraphTwo}</p>

          <p style={{ marginTop: "16px", maxWidth: "none" }}>
          This page tracks the best games of {year} using released titles that have
          already started to stand out through review scores, audience response, and
          overall visibility across the market.
        </p>

          <p style={{ maxWidth: "none" }}>
          If you want the strongest games released in {year}, this list is built to
          surface the titles with the clearest quality signals while filtering out
          unreleased or low-signal entries.
        </p>

        <p style={{ maxWidth: "none" }}>
          Looking for more ways to narrow the list down? Browse games by{" "}
          <Link href="/platforms">platform</Link> or explore top picks by{" "}
          <Link href="/genres">genre</Link>.
        </p>
      </div>

      <section style={EXPLORE_SECTION_STYLE}>
        <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
          <h2>{exploreHeading}</h2>

<ul style={{ listStylePosition: "inside", paddingLeft: 0, margin: "16px 0 0" }}>
  {year === 2026 && (
    <>
      <li>
        <Link href="/best-pc-games-2026">
          Best PC games of 2026
        </Link>
      </li>
    <li>
      <Link href="/best-rpg-games-pc-2026">
        Best RPG games on PC in 2026
      </Link>
    </li>
      <li>
        <Link href="/best-playstation-games-2026">
          Best PlayStation games of 2026
        </Link>
      </li>
      <li>
        <Link href="/best-xbox-games-2026">
          Best Xbox games of 2026
        </Link>
      </li>
      <li>
        <Link href="/best-switch-games-2026">
          Best Switch games of 2026
        </Link>
      </li>
    </>
  )}

  <li>
    <Link href="/top-rated">
      Browse top-rated games across all years
    </Link>
  </li>
  <li>
    <Link href="/new-games">
      Browse newly released games
    </Link>
  </li>
  <li>
    <Link href="/upcoming-games">
      Browse upcoming games
    </Link>
  </li>
  <li>
    <Link href="/games-releasing-this-month">
      See games releasing this month
    </Link>
  </li>
  <li>
    <Link href="/genres">
      Browse games by genre
    </Link>
  </li>
  <li>
    <Link href="/platforms">
      Browse games by platform
    </Link>
  </li>
</ul>
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
          <GameGrid games={topPicks} />
        ) : (
          <div style={LEFT_ALIGNED_READABLE_SECTION_HEADER_STYLE}>
            <p>No strong ranked games are available for this year yet.</p>
          </div>
        )}
      </section>

      {year === 2026 && (
  <section style={GRID_SECTION_STYLE}>
    <div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
      <h2>Best Games by Platform in 2026</h2>

      <p style={{ maxWidth: "none" }}>
        Looking for the best games of {year} on your platform? These pages break
        down the strongest releases by system so you can find what to play faster.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px"
      }}
    >
      {[
        {
          title: "Best PC Games of 2026",
          href: "/best-pc-games-2026"
        },
        {
          title: "Best PlayStation Games of 2026",
          href: "/best-playstation-games-2026"
        },
        {
          title: "Best Xbox Games of 2026",
          href: "/best-xbox-games-2026"
        },
        {
          title: "Best Switch Games of 2026",
          href: "/best-switch-games-2026"
        }
      ].map((platform) => (
        <Link
          key={platform.href}
          href={platform.href}
          style={{
            display: "block",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
            padding: "18px",
            textDecoration: "none",
            transition: "border-color 160ms ease, transform 160ms ease"
          }}
        >
          <div
            style={{
              color: "#f5f7fb",
              fontSize: "1rem",
              fontWeight: 800,
              lineHeight: 1.35
            }}
          >
            {platform.title}
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#8bb9ff",
              fontWeight: 700
            }}
          >
            Explore → 
          </div>
        </Link>
      ))}
    </div>
  </section>
)}

      <section style={GRID_SECTION_STYLE}>
<div style={CENTERED_READABLE_SECTION_HEADER_STYLE}>
  <h2>{fullListHeading}</h2>
</div>

        {fullList.length > 0 ? (
          <GameGrid games={fullList} />
        ) : (
          <div style={LEFT_ALIGNED_READABLE_SECTION_HEADER_STYLE}>
            <p>No additional released games are available for this year yet.</p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}