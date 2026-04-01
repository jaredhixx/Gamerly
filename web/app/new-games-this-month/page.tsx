import { Metadata } from "next";
import GameGrid from "../../components/game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import Link from "next/link";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "New Games This Month | Gamerly",
  description:
    "Browse all video games releasing this month across PC, PlayStation, Xbox, Nintendo Switch, iOS, and Android.",
  alternates: {
    canonical: buildCanonicalUrl("/new-games-this-month")
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

export default async function NewGamesThisMonthPage() {
  const games = await fetchGames();

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const filtered = games.filter((g: any) => {
    if (!g.releaseDate) {
      return false;
    }

    const date = new Date(g.releaseDate);

    return (
      date.getUTCFullYear() === currentYear &&
      date.getUTCMonth() === currentMonth
    );
  });

  const sortedByReleaseDate = [...filtered].sort((a: any, b: any) => {
    const releaseDiff = getReleaseTimestamp(a.releaseDate) - getReleaseTimestamp(b.releaseDate);

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

      return getReleaseTimestamp(a.releaseDate) - getReleaseTimestamp(b.releaseDate);
    })
    .slice(0, 12);

  const visibleGames = sortedByReleaseDate.slice(0, 60);

  const monthName = new Date(Date.UTC(currentYear, currentMonth, 1)).toLocaleString(
    "en-US",
    { month: "long", timeZone: "UTC" }
  );

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
          Current release window
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
          New Games This Month
          <span style={{ display: "block", marginTop: "10px", color: "#8bb9ff" }}>
            {monthName} {currentYear}
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
          Browse video games releasing this month across PC, PlayStation, Xbox,
          Nintendo Switch, iOS, and Android. This page is built to give you the
          clearest current-month release view on Gamerly without sending you through
          a full archive first.
        </p>
      </section>

      <section style={READABLE_SECTION_STYLE}>
        <p style={{ lineHeight: 1.7, maxWidth: "none", margin: "0 0 16px" }}>
          If you are looking for new games this month, this page is the fastest way
          to see what is launching right now across the major gaming platforms that
          Gamerly tracks. Instead of digging through distant release windows, you can
          use this page to focus on what is actually arriving in the current month.
        </p>

        <p style={{ lineHeight: 1.7, maxWidth: "none", margin: 0 }}>
          The featured section below highlights the strongest reviewed releases in
          the current month, while the full list is sorted by release date so the
          next launches appear first.
        </p>
      </section>

      {featuredGames.length > 0 && (
        <section style={GRID_SECTION_STYLE}>
          <div style={{ maxWidth: READABLE_WIDTH, margin: "0 auto 20px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "12px" }}>
              Best New Games This Month
            </h2>

            <p style={{ maxWidth: "none", lineHeight: 1.7, color: "#a7b1c6" }}>
              These are the strongest reviewed games releasing in {monthName} {currentYear},
              ranked using rating strength, review depth, and overall release quality.
            </p>
          </div>

          <GameGrid games={featuredGames} />
        </section>
      )}

      <section style={BOXED_SECTION_STYLE}>
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>
          Why use this page
        </h2>

        <p style={{ lineHeight: 1.7, maxWidth: "none", margin: "0 0 14px" }}>
          This is the strongest current-intent release page on Gamerly. Use it when
          you want to know what games are releasing this month without bouncing
          between platform stores, publisher calendars, and scattered release lists.
        </p>

        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
          <li>See the next games launching in the current month first</li>
          <li>Quickly compare the strongest reviewed new releases</li>
          <li>Jump into the full release calendar when you want a broader view</li>
        </ul>
      </section>

      <section style={GRID_SECTION_STYLE}>
        <div style={{ maxWidth: READABLE_WIDTH, margin: "0 auto 20px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>
            {visibleGames.length > 0
              ? `All Games Releasing in ${monthName} ${currentYear}`
              : `No Major Games Listed for ${monthName} ${currentYear} Yet`}
          </h2>

          <p style={{ maxWidth: "none", lineHeight: 1.7, color: "#a7b1c6" }}>
            {visibleGames.length > 0
              ? `These are the games currently listed for release in ${monthName} ${currentYear}, sorted so the next upcoming releases appear first.`
              : `Gamerly is not currently showing major confirmed game releases for ${monthName} ${currentYear} yet. Check the full calendar for adjacent months and broader release tracking.`}
          </p>
        </div>

        {visibleGames.length > 0 ? (
          <GameGrid games={visibleGames} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <p>No major games releasing this month yet.</p>
          </div>
        )}
      </section>

      <section style={BOXED_SECTION_STYLE}>
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>
          Explore More Release Pages
        </h2>

        <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.9 }}>
          <li>
            <Link href="/releases">Full video game release calendar</Link>
          </li>
          <li>
            <Link href="/upcoming-games">Upcoming games</Link>
          </li>
          <li>
            <Link href="/new-games">Newly released games</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}