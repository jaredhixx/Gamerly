import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../components/game/GameGrid";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Games Releasing This Month",
  description:
    "Video games releasing this month across PC, PlayStation, Xbox, Switch, and mobile.",
  alternates: {
    canonical: buildCanonicalUrl("/games-releasing-this-month")
  }
};

const monthNames = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
];

function buildMonthPath(date: Date) {
  const year = date.getUTCFullYear();
  const monthSlug = monthNames[date.getUTCMonth()];
  return `/releases/${year}/${monthSlug}`;
}

export default async function GamesThisMonthPage() {
  const { releasingThisMonth } = await getDerivedGameData();

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  const thisMonth = releasingThisMonth
    .filter((g) => {
      if (!g.releaseDate) return false;

      const release = new Date(g.releaseDate);

      return (
        release.getUTCMonth() === currentMonth &&
        release.getUTCFullYear() === currentYear
      );
    })
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() - new Date(b.releaseDate || "").getTime()
    );

  const nearbyMonths = Array.from({ length: 5 }, (_, index) => {
    const offset = index - 2;
    return new Date(Date.UTC(currentYear, currentMonth + offset, 1));
  });

  return (
    <main>
      <h1>Video Games Releasing This Month</h1>

      <p>Browse the full release calendar:</p>

      <ul>
        {nearbyMonths.map((date) => {
          const label = date.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC"
          });

          return (
            <li key={buildMonthPath(date)}>
              <Link href={buildMonthPath(date)}>{label}</Link>
            </li>
          );
        })}
      </ul>

      <GameGrid games={thisMonth} />
    </main>
  );
}