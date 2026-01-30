// /api/game.js
export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY;

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "Missing RAWG_KEY in environment." });
    }
    if (!slug) {
      return res.status(400).json({ error: "Missing slug parameter." });
    }

    // RAWG endpoints
    const base = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}`;
    const mainURL = `${base}?key=${RAWG_KEY}`;
    const moviesURL = `${base}/movies?key=${RAWG_KEY}`;
    const screenshotsURL = `${base}/screenshots?key=${RAWG_KEY}`;

    // Fetch all three in parallel
    const [mainRes, moviesRes, screenshotsRes] = await Promise.all([
      fetch(mainURL, {
        headers: { Accept: "application/json", "User-Agent": "Gamerly/1.0" },
        cache: "no-store",
      }),
      fetch(moviesURL, {
        headers: { Accept: "application/json", "User-Agent": "Gamerly/1.0" },
        cache: "no-store",
      }),
      fetch(screenshotsURL, {
        headers: { Accept: "application/json", "User-Agent": "Gamerly/1.0" },
        cache: "no-store",
      }),
    ]);

    const [mainData, moviesData, screenshotsData] = await Promise.all([
      mainRes.json(),
      moviesRes.json(),
      screenshotsRes.json(),
    ]);

    if (!mainRes.ok) {
      console.error("RAWG error:", mainData);
      return res
        .status(mainRes.status)
        .json({ error: mainData?.error || "RAWG fetch failed" });
    }

    // 🧩 Merge results cleanly
    const merged = {
      ...mainData,
      movies: moviesData?.results || [],
      screenshots: screenshotsData?.results || [],
    };

    // Clean up formatting
    if (merged.description_raw) {
      merged.description_raw = merged.description_raw.replace(/\n{3,}/g, "\n\n");
    }

    res.status(200).json(merged);
  } catch (err) {
    console.error("Server error in /api/game:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
