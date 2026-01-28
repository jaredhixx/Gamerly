export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  const RAWG_API_KEY = process.env.RAWG_KEY;
  if (!RAWG_API_KEY) {
    return res.status(500).json({ error: "Server missing RAWG API key." });
  }

  // ✅ Request all data including metacritic + screenshots
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(
    slug
  )}?key=${RAWG_API_KEY}&exclude_additions=false&expand=metacritic_platforms`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Error fetching game details",
      });
    }

    // ✅ Return cleaned + complete dataset
    const safeData = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      released: data.released,
      description_raw: data.description_raw,
      website: data.website,
      background_image: data.background_image,
      platforms: data.platforms || [],
      genres: data.genres || [],
      metacritic: data.metacritic ?? null,
      metacritic_platforms: data.metacritic_platforms || [],
      short_screenshots: data.short_screenshots || [],
      screenshots: data.screenshots || [],
    };

    return res.status(200).json(safeData);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
