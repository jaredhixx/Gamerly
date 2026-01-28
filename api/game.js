export default async function handler(req, res) {
  const { slug } = req.query;

  // ✅ Validate slug
  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  // ✅ Use your RAWG API key from environment
  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) {
    return res.status(500).json({ error: "Missing RAWG_KEY in environment" });
  }

  // ✅ Use HTTPS (not http) and always include key in query
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;

  try {
    // ✅ Explicitly disable caching and set headers RAWG expects
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "GamerlyApp/1.0 (https://gamerly.net)"
      },
      cache: "no-store"
    });

    const data = await response.json();

    // ✅ Handle errors gracefully
    if (!response.ok || data.error) {
      console.error("RAWG API error:", data);
      return res.status(500).json({ error: data?.error || "Error fetching game details" });
    }

    // ✅ Success
    return res.status(200).json(data);

  } catch (error) {
    console.error("Server error fetching RAWG data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
