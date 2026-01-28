export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: "Missing slug parameter." });
    }

    const apiKey = "ac669b002b534781818c488babf5aae4"; // RAWG key
    const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${apiKey}`;

    const rawgRes = await fetch(url);
    if (!rawgRes.ok) {
      return res
        .status(rawgRes.status)
        .json({ error: `RAWG error: ${rawgRes.statusText}` });
    }

    const data = await rawgRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error fetching game details." });
  }
}
