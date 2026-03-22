import { Metadata } from "next";
import Link from "next/link";
import { getDerivedGameData } from "../../lib/game-data";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Video Game Release Calendar | Gamerly",
  description: "Browse video game releases by month.",
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

export default async function ReleasesHubPage() {
  const { games } = await getDerivedGameData();

  const monthSet = new Set<string>();

  games.forEach((g) => {
    if (!g.releaseDate) return;

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

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "20px" }}>
        Video Game Release Calendar
      </h1>

      <p style={{ marginBottom: "30px", color: "#666" }}>
        Browse upcoming video game releases by month.
      </p>

      <ul style={{ lineHeight: "32px" }}>
        {months.map((m) => {
          const [year, monthSlug] = m.split("-");
          const monthIndex = monthNames.indexOf(monthSlug);

          const label = new Date(
            Date.UTC(Number(year), monthIndex, 1)
          ).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC"
          });

          return (
            <li key={m}>
              <Link href={`/releases/${year}/${monthSlug}`}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}