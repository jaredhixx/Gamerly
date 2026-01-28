export default async function handler(req, res) {
  const { slug } = req.query;
  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

  if (!slug) return res.status(400).json({ error: "Missing slug" });

  try {
    const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;
    const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error || "Error fetching game" });

    // Fetch screenshots separately (RAWG separates them)
    const shotsRes = await fetch(`https://api.rawg.io/api/games/${encodeURIComponent(slug)}/screenshots?key=${RAWG_KEY}`);
    const shotsData = await shotsRes.json();

    const screenshots = Array.isArray(shotsData.results)
      ? shotsData.results.slice(0, 5)
      : [];

    return res.status(200).json({ ...data, screenshots });
  } catch (err) {
    console.error("Error fetching detailed game data:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
