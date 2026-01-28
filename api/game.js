export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  const RAWG_API_KEY = process.env.RAWG_KEY;
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Error fetching game details",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
