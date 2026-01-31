// /api/games.js — Gamerly v4.1 (accurate “Newest” & “Highest Rated” logic)

export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const { ordering = "-released", page_size = 80, range = "3months" } = req.query;

    const today = new Date();
    const start = new Date();

    // --- Dynamic date windows ---
    if (range === "today") start.setDate(today.getDate() - 1);
    else if (range === "week") start.setDate(today.getDate() - 7);
    else if (range === "year" || range === "3months") start.setDate(today.getDate() - 120);
    else if (range === "all") start.setFullYear(2000);
    else start.setDate(today.getDate() - 120);

    // --- Ensure RAWG ordering matches ---
    const orderKey =
      ordering === "-rating" || ordering === "-metacritic" ? "-metacritic" : "-released";

    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("languages", "en");
    url.searchParams.set("page_size", page_size);
    url.searchParams.set("exclude_additions", "true");
    url.searchParams.set("ordering", orderKey);
    url.searchParams.set(
      "dates",
      `${start.toISOString().slice(0, 10)},${today.toISOString().slice(0, 10)}`
    );

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`RAWG error ${resp.status}`);

    // --- Clean / Filter ---
    let results = (data.results || []).filter(
      (g) =>
        g.released &&
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(g.slug || "")
    );

    // --- Local sort fallback (RAWG sometimes ignores ordering) ---
    if (orderKey === "-released") {
      results = results.sort((a, b) => new Date(b.released) - new Date(a.released));
    } else if (orderKey === "-metacritic") {
      results = results.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
    }

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("Server error in /api/games:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
