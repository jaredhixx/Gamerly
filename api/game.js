// /api/game.js
export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY;

    if (!slug) return res.status(400).json({ error: "Missing slug parameter" });
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const url = `https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}&languages=en`;

    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`RAWG error: ${response.status} ${text}`);
    }

    const data = await response.json();

    // Basic cleanup: make sure description is plain text
    if (data.description_raw === undefined && data.description) {
      data.description_raw = data.description.replace(/<[^>]+>/g, "");
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/game.js:", err);
    res.status(500).json({ error: "Failed to fetch game details" });
  }
}
