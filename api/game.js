// /api/game.js
export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

    const url = new URL(`https://api.rawg.io/api/games/${slug}`);
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("languages", "en");

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });
    const data = await resp.json();

    if (!resp.ok) {
      console.error("RAWG detail error", data);
      return res.status(500).json({ error: "Failed to fetch game detail" });
    }

    // Minimal cleanup
    const safe =
      !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(data.name || "") &&
      !/sex|porn|hentai|erotic|nsfw|nude|lewd/i.test(data.slug || "");
    if (!safe) return res.status(404).json({ error: "Game blocked by content filter" });

    res.status(200).json(data);
  } catch (err) {
    console.error("Server detail fetch error:", err);
    res.status(500).json({ error: "Server error fetching game" });
  }
}
