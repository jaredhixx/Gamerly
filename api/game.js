// /api/game.js — Final English-enforced version

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

    if (!response.ok) {
      const errText = await response.text();
      console.error("RAWG error:", errText);
      return res.status(response.status).json({ error: "Failed to fetch game detail" });
    }

    const data = await response.json();
    let description = data.description_raw || data.description || "";

    // --- Clean up HTML entities like &#1072; (Cyrillic letters) ---
    const temp = document ? document.createElement("textarea") : null;
    if (temp) {
      temp.innerHTML = description;
      description = temp.value;
    } else {
      description = description.replace(/&#(\d+);/g, (m, c) =>
        String.fromCharCode(c)
      );
    }

    // --- Strip HTML tags just in case ---
    description = description.replace(/<\/?[^>]+(>|$)/g, "");

    // --- Detect non-English content robustly ---
    const isEnglish = /^[\x00-\x7F\s.,;:'"!?()\-–—]+$/.test(description);

    // --- Auto-translate only if clearly not English ---
    if (!isEnglish) {
      try {
        const translateRes = await fetch("https://libretranslate.com/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: description.slice(0, 4000), // avoid API limits
            source: "auto",
            target: "en",
          }),
        });
        const json = await translateRes.json();
        if (json.translatedText) description = json.translatedText;
      } catch (tErr) {
        console.warn("Translation skipped:", tErr);
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
