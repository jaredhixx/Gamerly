import { Metadata } from "next";
import Link from "next/link";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Video Game Release Calendar",
  description:
    "Browse upcoming video game releases by month, including this month, next month, and the latest game release schedule across PC, PlayStation, Xbox, Switch, iOS, and Android.",
  alternates: {
    canonical: buildCanonicalUrl("/releases")
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

function buildMonthLabel(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

function buildMonthKey(year: number, monthIndex: number) {
  return `${year}-${monthNames[monthIndex]}`;
}

export default async function ReleasesHubPage() {
  const { games } = await getDerivedGameData();

  const monthSet = new Set<string>();

  games.forEach((g) => {
    if (!g.releaseDate) {
      return;
    }

    const date = new Date(g.releaseDate);
    const year = date.getUTCFullYear();
    const monthSlug = monthNames[date.getUTCMonth()];

    monthSet.add(`${year}-${monthSlug}`);
  });

  const months = Array.from(monthSet).sort((a, b) => {
    const [aYear, aMonthSlug] = a.split("-");
    const [bYear, bMonthSlug] = b.split("-");

    const aDate = new Date(
      Date.UTC(Number(aYear), monthNames.indexOf(aMonthSlug), 1)
    );
    const bDate = new Date(
      Date.UTC(Number(bYear), monthNames.indexOf(bMonthSlug), 1)
    );

    return bDate.getTime() - aDate.getTime();
  });

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();

  const featuredMonthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(currentYear, currentMonthIndex + index, 1));
    return buildMonthKey(date.getUTCFullYear(), date.getUTCMonth());
  }).filter((monthKey) => monthSet.has(monthKey));

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "20px" }}>
        Video Game Release Calendar
      </h1>

      <p style={{ marginBottom: "16px", color: "#666", lineHeight: 1.7 }}>
        Use Gamerly&apos;s video game release calendar to track games releasing this
        month, next month, and upcoming launches across PC, PlayStation, Xbox,
        Nintendo Switch, iOS, and Android.
      </p>

      <p style={{ marginBottom: "18px", color: "#666", lineHeight: 1.7 }}>
        Start with the featured months below if you want the most relevant game
        release schedules right now, browse{" "}
        <Link
          href="/new-games-this-month"
          style={{ color: "#8bb9ff", textDecoration: "underline", fontWeight: 600 }}
        >
          new games this month
        </Link>{" "}
        for the highest-current-intent view, check{" "}
        <Link
          href="/games-releasing-next-month"
          style={{ color: "#8bb9ff", textDecoration: "underline", fontWeight: 600 }}
        >
          games releasing next month
        </Link>{" "}
        if you want the next release window, or scroll down for the full monthly archive.
      </p>

            <section
        style={{
          marginBottom: "36px",
          padding: "20px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.02)"
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px" }}>
          Start With These Release Views
        </h2>

        <div
          style={{
            display: "grid",
            gap: "12px"
          }}
        >
          <Link
            href="/new-games-this-month"
            style={{
              display: "block",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              textDecoration: "none",
              color: "#f5f7fb",
              fontWeight: 700
            }}
          >
            New Games This Month → see what is releasing right now
          </Link>

          <Link
            href="/games-releasing-next-month"
            style={{
              display: "block",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              textDecoration: "none",
              color: "#f5f7fb",
              fontWeight: 700
            }}
          >
            Games Releasing Next Month → plan what to play next
          </Link>

          <Link
            href="/upcoming-games"
            style={{
              display: "block",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              textDecoration: "none",
              color: "#f5f7fb",
              fontWeight: 700
            }}
          >
            Upcoming Games → see everything coming soon
          </Link>
        </div>
      </section>

      {featuredMonthKeys.length > 0 && (
        <section
          style={{
            marginBottom: "36px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.02)"
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
            Featured Release Months
          </h2>

          <ul style={{ lineHeight: "32px", margin: 0, paddingLeft: "20px" }}>
            {featuredMonthKeys.map((m) => {
              const [year, monthSlug] = m.split("-");
              const monthIndex = monthNames.indexOf(monthSlug);

              return (
                <li key={m}>
                  <Link href={`/releases/${year}/${monthSlug}`}>
                    {buildMonthLabel(Number(year), monthIndex)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
          Full Release Calendar Archive
        </h2>

        <ul style={{ lineHeight: "32px" }}>
          {months.map((m) => {
            const [year, monthSlug] = m.split("-");
            const monthIndex = monthNames.indexOf(monthSlug);

            return (
              <li key={m}>
                <Link href={`/releases/${year}/${monthSlug}`}>
                  {buildMonthLabel(Number(year), monthIndex)}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}