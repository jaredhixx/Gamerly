import { Metadata } from "next";
import Link from "next/link";
import GameGrid from "../../../../components/game/GameGrid";
import { fetchGames } from "../../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../lib/site";

const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

function monthIndex(month?: string) {
  if (!month) return -1;
  return months.indexOf(month.toLowerCase());
}

function getMonthDisplayName(month: string) {
  const idx = monthIndex(month);

  if (idx === -1) {
    return month;
  }

  return months[idx].charAt(0).toUpperCase() + months[idx].slice(1);
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const year = params?.year;
  const month = params?.month;

  const idx = monthIndex(month);

  if (idx === -1) {
    return {
      title: `Games Releasing ${month}/${year}`,
      description: `See all video games releasing in ${month}/${year} across PC, PlayStation, Xbox, and Nintendo Switch.`,
      alternates: {
        canonical: buildCanonicalUrl(`/releases/${year}/${month}`)
      }
    };
  }

  const monthName = months[idx].charAt(0).toUpperCase() + months[idx].slice(1);

  return {
    title: `Games Releasing ${monthName} ${year} | Gamerly`,
    description: `Browse video games releasing in ${monthName} ${year} across PC, PlayStation, Xbox, Switch, iOS, and Android, including major upcoming and newly released games this month.`,
    alternates: {
      canonical: buildCanonicalUrl(`/releases/${year}/${month}`)
    }
  };
}

export default async function ReleaseMonthPage(props: any) {
  const params = await props.params;

  const year = params?.year;
  const month = params?.month;

  const idx = monthIndex(month);

  if (idx === -1) {
    notFound();
  }

  const games = await fetchGames();

  const filtered = games.filter((g: any) => {
    if (!g.releaseDate) return false;

    const date = new Date(g.releaseDate);

    return (
      date.getUTCFullYear() === Number(year) &&
      date.getUTCMonth() === idx
    );
  });

  const monthName = getMonthDisplayName(month);

  const currentDate = new Date(Date.UTC(Number(year), idx, 1));

  const prevDate = new Date(currentDate);
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);

  const prevYear = prevDate.getUTCFullYear();
  const prevMonth = months[prevDate.getUTCMonth()];

  const nextYear = nextDate.getUTCFullYear();
  const nextMonth = months[nextDate.getUTCMonth()];

  const visibleGames = filtered.slice(0, 60);

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <section style={{ maxWidth: "820px", margin: "0 auto 32px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800 }}>
          Games Releasing {monthName} {year}
        </h1>

        <p style={{ margin: "16px auto 0", maxWidth: "820px", lineHeight: 1.7, color: "#a7b1c6" }}>
          Browse video games releasing in {monthName} {year} across PC, PlayStation,
          Xbox, Nintendo Switch, iOS, and Android. This page helps you quickly see
          which games are scheduled for this month so you can plan what to play next.
        </p>
      </section>

<section style={{ maxWidth: "820px", margin: "0 auto 32px" }}>
  <p style={{ lineHeight: 1.7, maxWidth: "820px", margin: "0 auto 16px" }}>
    Gamerly tracks the game release schedule for {monthName} {year} using
    confirmed release-date data across major platforms. If you are looking for
    games coming out in {monthName} {year}, this page is designed to surface
    the clearest monthly release view in one place.
  </p>

  <p style={{ lineHeight: 1.7, maxWidth: "820px", margin: "0 auto 16px" }}>
    Use this page to check what is releasing this month, compare major launches,
    and move between adjacent months as the release calendar changes.
  </p>

  <p style={{ lineHeight: 1.7, maxWidth: "820px", margin: "0 auto" }}>
    Want a broader view? Go back to the{" "}
    <Link href="/releases">full video game release calendar</Link>.
  </p>
</section>

      <section style={{ maxWidth: "1100px", margin: "0 auto 32px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto 20px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>
            {visibleGames.length > 0
              ? `Top Games Releasing ${monthName} ${year}`
              : `Game Release Schedule for ${monthName} ${year}`}
          </h2>

          <p style={{ maxWidth: "none", lineHeight: 1.7, color: "#a7b1c6" }}>
            {visibleGames.length > 0
              ? `These are the games currently listed for release in ${monthName} ${year}.`
              : `There are no major games listed for release in ${monthName} ${year} yet.`}
          </p>
        </div>

        {visibleGames.length > 0 ? (
          <GameGrid games={visibleGames} />
        ) : (
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
            <p>No major games releasing this month yet.</p>
          </div>
        )}
      </section>

      <section
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap"
        }}
      >
        <Link
          href={`/releases/${prevYear}/${prevMonth}`}
          style={{ color: "#8bb9ff", textDecoration: "none", fontWeight: 700 }}
        >
          ← {getMonthDisplayName(prevMonth)} {prevYear}
        </Link>

        <Link
          href="/releases"
          style={{ color: "#8bb9ff", textDecoration: "none", fontWeight: 700 }}
        >
          Full release calendar
        </Link>

        <Link
          href={`/releases/${nextYear}/${nextMonth}`}
          style={{ color: "#8bb9ff", textDecoration: "none", fontWeight: 700 }}
        >
          {getMonthDisplayName(nextMonth)} {nextYear} →
        </Link>
      </section>
    </main>
  );
}