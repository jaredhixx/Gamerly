export default async function handler(req, res) {
  const { platform, sort, start, end } = req.query;

  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

  // Build base URL
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", RAWG_KEY);
  url.searchParams.set("page_size", "40");
  url.searchParams.set("exclude_additions", "true");
  url.searchParams.set("metacritic", "1,100");
  if (platform) url.searchParams.set("platforms", platform);
  if (sort) url.searchParams.set("ordering", sort);

  // --- Smarter date logic: 45 days back, 90 forward
  const today = new Date();
  const startDate = start ? new Date(start) : new Date(today);
  const endDate = end ? new Date(end) : new Date(today);

  startDate.setDate(startDate.getDate() - 45);
  endDate.setDate(endDate.getDate() + 90);

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);
  url.searchParams.set("dates", `${startStr},${endStr}`);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store"
    });
    const data = await response.json();

    let results = data.results || [];

    // Fallback: if RAWG returns nothing, fetch popular games
    if (!results.length) {
      const fallbackUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=20&ordering=-rating`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      results = fallbackData.results || [];
    }

    // Filter NSFW
    const filtered = results.filter(
      g =>
        !/hentai|porn|sex|erotic/i.test(g.name || "") &&
        !/hentai|porn|sex|erotic/i.test(g.slug || "")
    );

    res.status(200).json({ count: filtered.length, results: filtered });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
