// /api/games.js — Gamerly v4 (Accurate filtering, sorting, and range fixes)

export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) {
      return res.status(500).json({ error: "Missing RAWG_KEY in environment." });
    }

    // Grab params from client (used in app.js)
    const { ordering = "-released", page_size = 80, range = "3months" } = req.query;

    const today = new Date();
    let start = new Date();

    // ----- Dynamic date range -----
    switch (range) {
      case "today":
        start = new Date(today);
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        break;
      case "year":
      case "3months":
        start.setMonth(today.getMonth() - 3);
        break;
      case "all":
        start = new Date("2000-01-01"); // show everything since Y2K
        break;
      default:
        start.setMonth(today.getMonth() - 3);
    }

    // ----- Build RAWG request -----
    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("languages", "en");
    url.searchParams.set("page_size", page_size);
    url.searchParams.set("exclude_additions", "true");
    url.searchParams.set("ordering", ordering);
    url.searchParams.set(
      "dates",
      `${start.toISOString().slice(0, 10)},${today.toISOString().slice(0, 10)}`
    );

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("RAWG error:", data);
      return res.status(resp.status).json({ error: data?.error || "RAWG fetch failed" });
    }

    // ----- Filter out unwanted / NSFW entries -----
    const results = (data.results || []).filter(
      (g) =>
        g.released &&
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.slug || "")
    );

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("Server error in /api/games:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
