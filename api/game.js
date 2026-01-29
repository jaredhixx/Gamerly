// /api/game.js
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
    const url = `https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch game detail" });
    }

    let description = data.description_raw || "";

    // ⚡ Auto-translate if non-English detected
    if (/[^\x00-\x7F]/.test(description)) {
      try {
        const translateRes = await fetch("https://libretranslate.com/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: description,
            source: "auto",
            target: "en",
            format: "text"
          }),
        });
        const translateJson = await translateRes.json();
        if (translateJson.translatedText) {
          description = translateJson.translatedText;
        }
      } catch (tErr) {
        console.warn("Translate API failed:", tErr);
      }
    }

    // Return everything with English description override
    res.status(200).json({
      ...data,
      description_raw: description
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
