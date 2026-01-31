// /api/game.js — Stable v2.3 (screenshots restored safely)
export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const base = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}`;
    const [mainRes, screenshotsRes] = await Promise.all([
      fetch(`${base}?key=${RAWG_KEY}`, { cache: "no-store" }),
      fetch(`${base}/screenshots?key=${RAWG_KEY}`, { cache: "no-store" }),
    ]);

    const [mainData, screenshotsData] = await Promise.all([
      mainRes.json(),
      screenshotsRes.json(),
    ]);

    if (!mainRes.ok) {
      console.error("RAWG error:", mainData);
      return res.status(mainRes.status).json({ error: "RAWG fetch failed" });
    }

    // Merge screenshots safely
    const merged = {
      ...mainData,
      screenshots: Array.isArray(screenshotsData?.results)
        ? screenshotsData.results
        : [],
    };

    // Cleanup
    if (merged.description_raw)
      merged.description_raw = merged.description_raw.replace(/\n{3,}/g, "\n\n");

    res.status(200).json(merged);
  } catch (err) {
    console.error("Server error in /api/game:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
