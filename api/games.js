export default async function handler(req, res) {
  const { platform, sort, start, end } = req.query;

  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) {
    return res.status(500).json({ error: "Server missing RAWG_KEY." });
  }

  // ✅ Build RAWG URL with key and filters
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", RAWG_KEY);
  url.searchParams.set("page_size", "40");

  if (platform) url.searchParams.set("platforms", platform);
  if (sort) url.searchParams.set("ordering", sort);

  // ✅ Smarter date logic
  const today = new Date();
  const startDate = start
    ? new Date(start)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const endDate = end
    ? new Date(end)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);
  url.searchParams.set("dates", `${startStr},${endStr}`);

  // ✅ Filter out NSFW content
  url.searchParams.set("exclude_additions", "true");
  url.searchParams.set("metacritic", "1,100");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "GamerlyApp/1.0 (https://gamerly.net)"
      },
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("RAWG /games error:", data);
      return res.status(500).json({ error: data?.error || "Error fetching games" });
    }

    // ✅ Filter out adult content from results
    const filtered = (data.results || []).filter(
      g =>
        !g.name.toLowerCase().includes("hentai") &&
        !g.name.toLowerCase().includes("porn") &&
        !g.name.toLowerCase().includes("sex")
    );

    return res.status(200).json({
      count: filtered.length,
      results: filtered
    });
  } catch (error) {
    console.error("Server error fetching games:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
