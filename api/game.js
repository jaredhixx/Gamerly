export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY;

    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;
    const resp = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    const data = await resp.json();

    console.log("🔍 RAWG full data preview:", Object.keys(data)); // ✅ This shows what we get back

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
