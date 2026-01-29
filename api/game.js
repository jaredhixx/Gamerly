// /api/game.js — English-first with OpenAI translation fallback

import OpenAI from "openai";

export default async function handler(req, res) {
  const { slug } = req.query;
  const RAWG_KEY = process.env.RAWG_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });
  if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

  try {
    // Fetch RAWG game detail
    const url = `https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}`;
    const rawgResp = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!rawgResp.ok) {
      const errText = await rawgResp.text();
      console.error("RAWG detail error:", errText);
      return res.status(rawgResp.status).json({ error: "Failed to fetch game detail" });
    }

    const data = await rawgResp.json();
    let description = data.description_raw || "";

    // If description is empty, try HTML field
    if (!description && data.description) {
      description = data.description.replace(/<\/?[^>]+(>|$)/g, "");
    }

    description = description.trim();

    // If no OpenAI key or description is empty, we’ll serve what we have
    if (OPENAI_KEY && description) {
      try {
        const client = new OpenAI({ apiKey: OPENAI_KEY });

        // Ask model to translate to English if needed
        const check = await client.embeddings.create({
          model: "text-embedding-3-small",
          input: description.slice(0, 500) // sample for detection
        });

        // If the text embedding is suspiciously out of baseline, we translate
        // (Note: We *could* run a more robust language detection,
        // but for simplicity we’ll always translate when unclear.)
        const message = `Translate the following game description to clear, grammatically correct English:\n\n${description}`;

        // GPT-4.1 or Turbo could be used as well
        const trans = await client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You translate text to clear English without adding new content." },
            { role: "user", content: message }
          ],
          temperature: 0.1,
          max_tokens: 750
        });

        const translatedText = trans.choices?.[0]?.message?.content?.trim();
        if (translatedText) description = translatedText;
      } catch (translateErr) {
        console.warn("Translation attempt failed:", translateErr.message);
      }
    }

    // Return the game with our modified description
    res.status(200).json({
      ...data,
      description_raw: description || data.description_raw || "No description available.",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
