// /api/game.js — Stable Build (pre-screenshot)
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

    // Construct proper RAWG endpoint
    const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;

    const resp = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Gamerly/1.0" },
      cache: "no-store",
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("RAWG error:", data);
      return res
        .status(resp.status)
        .json({ error: data?.error || "RAWG fetch failed" });
    }

    // Clean up description formatting
    if (data?.description_raw) {
      data.description_raw = data.description_raw.replace(/\n{3,}/g, "\n\n");
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Server error in /api/game:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
