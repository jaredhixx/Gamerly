// /api/game.js — Final Node-safe English version (stable)
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
    // Fetch base game info
    const url = `https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RAWG error:", errText);
      return res.status(response.status).json({ error: "Failed to fetch game detail" });
    }

    const data = await response.json();
    let description = data.description_raw || data.description || "";

    // --- Decode HTML entities manually (no browser APIs) ---
    description = description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));

    // --- Strip remaining HTML tags ---
    description = description.replace(/<\/?[^>]+(>|$)/g, "");

    // --- Detect non-English ---
    const isEnglish = /^[\x00-\x7F\s.,;:'"!?()\-–—]+$/.test(description);

    // --- Translate only if not English ---
    if (!isEnglish && description.trim().length > 0) {
      try {
        const translateRes = await fetch("https://libretranslate.com/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: description.slice(0, 4000),
            source: "auto",
            target: "en",
          }),
        });

        const json = await translateRes.json();
        if (json.translatedText) {
          description = json.translatedText;
        }
      } catch (err) {
        console.warn("Translation skipped:", err.message);
      }
    }

    res.status(200).json({
      ...data,
      description_raw: description || "No English description available.",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
