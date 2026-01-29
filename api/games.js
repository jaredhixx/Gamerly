// /api/games.js
export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const { ordering = "-released", page_size = 80 } = req.query;
    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 3); // last 3 months default

    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("languages", "en");
    url.searchParams.set("page_size", page_size);
    url.searchParams.set("exclude_additions", "true");
    url.searchParams.set("ordering", ordering);
    url.searchParams.set("dates", `${start.toISOString().slice(0,10)},${today.toISOString().slice(0,10)}`);

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`RAWG error ${resp.status}`);

    // Clean & filter
    const results = (data.results || []).filter(g =>
      g.released &&
      !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.name || "") &&
      !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.slug || "")
    );

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
