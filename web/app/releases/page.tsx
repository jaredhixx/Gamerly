import { Metadata } from "next";
import { fetchGames } from "../../lib/igdb";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Video Game Release Calendar | Gamerly",
  description: "Browse video game releases by month.",
  alternates: {
    canonical: buildCanonicalUrl("/releases")
  }
};

export default async function ReleasesHubPage() {

  const games = await fetchGames();

  const monthSet = new Set<string>();

  games.forEach((g: any) => {
    if (!g.releaseDate) return;

    const date = new Date(g.releaseDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    monthSet.add(`${year}-${month}`);
  });

  const months = Array.from(monthSet)
    .sort((a, b) => b.localeCompare(a));

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

          const [year, month] = m.split("-");

          const date = new Date(Number(year), Number(month) - 1);

          const label = date.toLocaleString("default", {
            month: "long",
            year: "numeric"
          });

          return (
            <li key={m}>
              <a href={`/releases/${year}/${month}`}>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}