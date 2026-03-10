import { Metadata } from "next";
import GameGrid from "../../../../components/game/GameGrid";
import { fetchGames } from "../../../../lib/igdb";
import { notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../../lib/site";

const months = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december"
];

function monthIndex(month?: string) {
  if (!month) return -1;
  return months.indexOf(month.toLowerCase());
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const year = params?.year;
  const month = params?.month;

  const idx = monthIndex(month);

  if (idx === -1) {
    return {
    title: `Games Releasing ${month}/${year} | Gamerly`,
    description: `See all video games releasing in ${month}/${year} across PC, PlayStation, Xbox, and Nintendo Switch.`,

    alternates: {
      canonical: buildCanonicalUrl(`/releases/${year}/${month}`)
    }
  };
}

  const monthName = months[idx];

return {
  title: `Games Releasing ${monthName} ${year} | Gamerly`,
  description: `Browse video games releasing in ${monthName} ${year} across PC, PlayStation, Xbox, Switch, iOS, and Android.`,
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

  const monthName = months[idx];

  const currentDate = new Date(Number(year), idx);

const prevDate = new Date(currentDate);
prevDate.setMonth(prevDate.getMonth() - 1);

const nextDate = new Date(currentDate);
nextDate.setMonth(nextDate.getMonth() + 1);

const prevYear = prevDate.getFullYear();
const prevMonth = months[prevDate.getMonth()];

const nextYear = nextDate.getFullYear();
const nextMonth = months[nextDate.getMonth()];

  return (
    <main>
      <h1>Games Releasing {monthName} {year}</h1>

      {filtered.length > 0 ? (
        <GameGrid games={filtered.slice(0, 60)} />
      ) : (
        <p>No major games releasing this month yet.</p>
      )}

      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
  <a
    href={`/releases/${prevYear}/${prevMonth}`}
    style={{ color: "#6aa6ff", textDecoration: "none", fontWeight: 600 }}
  >
    ← Previous Month
  </a>

  <a
    href={`/releases/${nextYear}/${nextMonth}`}
    style={{ color: "#6aa6ff", textDecoration: "none", fontWeight: 600 }}
  >
    Next Month →
  </a>
</div>

    </main>
  );
}