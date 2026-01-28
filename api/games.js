export default async function handler(req, res) {
  const { platform, sort, range } = req.query;
  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

  const today = new Date();
  let startDate, endDate;

  // ✅ Range logic driven by button clicks
  switch (range) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "upcoming":
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 90);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 45);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 45);
      break;
  }

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", RAWG_KEY);
  url.searchParams.set("page_size", "40");
  url.searchParams.set("ordering", sort || "-released");
  url.searchParams.set("dates", `${startStr},${endStr}`);
  url.searchParams.set("exclude_additions", "true");
  url.searchParams.set("metacritic", "1,100");
  if (platform) url.searchParams.set("platforms", platform);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });
    const data = await response.json();

    let results = data.results || [];

    // ✅ Filter NSFW & very old titles
    results = results.filter(
      (g) =>
        g.released &&
        parseInt(g.released.slice(0, 4)) >= 2020 &&
        !/hentai|porn|sex|erotic/i.test(g.name || "") &&
        !/hentai|porn|sex|erotic/i.test(g.slug || "")
    );

    // ✅ Fallback if range is empty
    if (!results.length) {
      const fallbackUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=20&ordering=-added&dates=2020-01-01,${endStr}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      results = fallbackData.results || [];
    }

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
