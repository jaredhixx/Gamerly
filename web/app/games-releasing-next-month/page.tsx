import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";
import Link from "next/link";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Best Games Releasing Next Month (What to Watch)",
  description:
    "See the best games releasing next month across PC, PlayStation, Xbox, Nintendo Switch, iOS, and Android. Discover what’s worth watching and plan what to play next.",
  alternates: {
    canonical: buildCanonicalUrl("/games-releasing-next-month")
  }
};

const READABLE_WIDTH = "820px";
const GRID_WIDTH = "1100px";

const HERO_SECTION_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 32px",
  textAlign: "center"
} as const;

const READABLE_SECTION_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 32px"
} as const;

const GRID_SECTION_STYLE = {
  maxWidth: GRID_WIDTH,
  margin: "0 auto 32px"
} as const;

const BOXED_SECTION_STYLE = {
  maxWidth: READABLE_WIDTH,
  margin: "0 auto 32px",
  padding: "24px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.02)"
} as const;

function getReleaseTimestamp(releaseDate?: string | null) {
  if (!releaseDate) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(releaseDate).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return timestamp;
}

export default async function GamesReleasingNextMonthPage() {
  const { games } = await getDerivedGameData();

  const now = new Date();

  const nextMonthDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1
  ));

  const targetYear = nextMonthDate.getUTCFullYear();
  const targetMonth = nextMonthDate.getUTCMonth();

  const filtered = games.filter((g: any) => {
    if (!g.releaseDate) {
      return false;
    }

    const date = new Date(g.releaseDate);

    return (
      date.getUTCFullYear() === targetYear &&
      date.getUTCMonth() === targetMonth
    );
  });

  const sortedByReleaseDate = [...filtered].sort((a: any, b: any) => {
    const releaseDiff =
      getReleaseTimestamp(a.releaseDate) -
      getReleaseTimestamp(b.releaseDate);

    if (releaseDiff !== 0) {
      return releaseDiff;
    }

    const ratingA = a.aggregated_rating ?? 0;
    const ratingB = b.aggregated_rating ?? 0;

    return ratingB - ratingA;
  });

  const featuredGames = [...filtered]
    .filter((g: any) => {
      const rating = g.aggregated_rating ?? 0;
      const ratingCount = g.aggregated_rating_count ?? 0;

      return rating >= 70 && ratingCount >= 1;
    })
    .sort((a: any, b: any) => {
      const ratingA = a.aggregated_rating ?? 0;
      const ratingB = b.aggregated_rating ?? 0;
      const ratingCountA = a.aggregated_rating_count ?? 0;
      const ratingCountB = b.aggregated_rating_count ?? 0;

      const scoreA = ratingA + Math.min(ratingCountA, 20) * 0.35;
      const scoreB = ratingB + Math.min(ratingCountB, 20) * 0.35;

      const scoreDiff = scoreB - scoreA;

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (
        getReleaseTimestamp(a.releaseDate) -
        getReleaseTimestamp(b.releaseDate)
      );
    })
    .slice(0, 12);

  const visibleGames = sortedByReleaseDate.slice(0, 60);

  const monthName = nextMonthDate.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC"
  });

  return (
    <main style={{ maxWidth: GRID_WIDTH, margin: "0 auto", padding: "40px 20px 72px" }}>
      <section style={HERO_SECTION_STYLE}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "fit-content",
            maxWidth: "100%",
            padding: "8px 12px",
            marginBottom: "16px",
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
          Next release window
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            color: "#f5f7fb"
          }}
        >
          Games Releasing Next Month
          <span style={{ display: "block", marginTop: "10px", color: "#8bb9ff" }}>
            {monthName} {targetYear}
          </span>
        </h1>

        <p
          style={{
            margin: "18px auto 0",
            maxWidth: READABLE_WIDTH,
            lineHeight: 1.7,
            color: "#a7b1c6",
            fontSize: "1.05rem"
          }}
        >
          See all video games scheduled to release next month across PC,
          PlayStation, Xbox, Nintendo Switch, iOS, and Android.
        </p>
      </section>

      {featuredGames.length > 0 && (
        <section style={GRID_SECTION_STYLE}>
          <div style={{ maxWidth: READABLE_WIDTH, margin: "0 auto 20px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Best Games Releasing Next Month
            </h2>

            <p style={{ maxWidth: "none", lineHeight: 1.7, color: "#a7b1c6" }}>
              These are the strongest upcoming releases in {monthName} {targetYear},
              ranked by rating strength and release quality signals.
            </p>
          </div>

          <GameGrid games={featuredGames} />
        </section>
      )}

      <section style={GRID_SECTION_STYLE}>
        <div style={{ maxWidth: READABLE_WIDTH, margin: "0 auto 20px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>
            {visibleGames.length > 0
              ? `All Games Releasing in ${monthName} ${targetYear}`
              : `No Major Games Listed for ${monthName} ${targetYear} Yet`}
          </h2>
        </div>

        {visibleGames.length > 0 ? (
          <GameGrid games={visibleGames} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <p>No major games releasing next month yet.</p>
          </div>
        )}
      </section>

      <section style={BOXED_SECTION_STYLE}>
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>
          Explore More Release Pages
        </h2>

        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
          <li>
            <Link href="/new-games-this-month">New games this month</Link>
          </li>
          <li>
            <Link href="/releases">Full video game release calendar</Link>
          </li>
          <li>
            <Link href="/upcoming-games">Upcoming games</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}