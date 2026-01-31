// /api/game.js — Stable & Resilient Version
export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY;

    if (!RAWG_KEY)
      return res.status(500).json({ error: "Missing RAWG_KEY in environment." });

    if (!slug)
      return res.status(400).json({ error: "Missing slug parameter." });

    const base = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}`;
    const url = `${base}?key=${RAWG_KEY}`;

    let resp = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Gamerly/1.0" },
      cache: "no-store",
    });

    // 🔁 RAWG sometimes fails slugs—retry with search
    if (!resp.ok) {
      const searchURL = `https://api.rawg.io/api/games?search=${encodeURIComponent(slug)}&key=${RAWG_KEY}`;
      const searchRes = await fetch(searchURL, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const searchData = await searchRes.json();
      const id = searchData?.results?.[0]?.id;
      if (id) {
        resp = await fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_KEY}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
      }
    }

    const data = await resp.json();

    if (!resp.ok || !data || data.detail === "Not found.")
      return res.status(404).json({ error: "Game not found on RAWG." });

    // 🧹 Clean up text formatting
    if (data.description_raw)
      data.description_raw = data.description_raw.replace(/\n{3,}/g, "\n\n");

    res.status(200).json(data);
  } catch (err) {
    console.error("Server error in /api/game:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
