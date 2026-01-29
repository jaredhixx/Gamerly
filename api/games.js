export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 6); // 6-month rolling window

    const url = new URL("https://api.rawg.io/api/games");
    const fbUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=40&ordering=-released&dates=${fbStartStr},${fbEndStr}&languages=en`;

    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("languages", "en");

    url.searchParams.set("page_size", req.query.page_size || "80");
    url.searchParams.set("ordering", "-released");
    url.searchParams.set("dates", `${start.toISOString().slice(0, 10)},${today
      .toISOString()
      .slice(0, 10)}`);
    url.searchParams.set("exclude_additions", "true");

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });
    const data = await resp.json();
    let results = Array.isArray(data.results) ? data.results : [];

    const now = new Date();
    results = results.filter((g) => {
      if (!g.released) return false;
      const d = new Date(g.released);
      const safe =
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.slug || "");
      return d <= now && d.getFullYear() >= 2015 && safe;
    });

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
