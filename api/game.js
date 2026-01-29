export default async function handler(req, res) {
  const { slug } = req.query;
  const RAWG_KEY = process.env.RAWG_KEY;

  if (!RAWG_KEY) {
    return res.status(500).json({ error: "Missing RAWG_KEY" });
  }

  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  try {
    const url = `https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}&language=en`;

    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RAWG error:", errorText);
      return res.status(response.status).json({ error: "Failed to fetch game detail" });
    }

    const data = await response.json();

    // Remove non-English or unsafe descriptions if any slipped through
    const cleanDesc = data.description_raw?.replace(/<\/?[^>]+(>|$)/g, "") || "";

    res.status(200).json({
      ...data,
      description_raw: cleanDesc,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
