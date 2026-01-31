// /api/game.js
export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    const RAWG_KEY = process.env.RAWG_KEY || "ac669b002b534781818c488babf5aae4";
    const IGDB_CLIENT_ID = "7udxvmbguftujpbxqguez86hmzoe1a";
    const IGDB_ACCESS_TOKEN = "3n7ejvrxnchji3v53gmf9mzyw6r3h2";

    if (!slug) {
      return res.status(400).json({ error: "Missing slug parameter." });
    }

    // 1️⃣ RAWG API (base data)
    const base = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;
    const rawgRes = await fetch(base, { headers: { Accept: "application/json" } });
    const rawgData = await rawgRes.json();

    // 2️⃣ IGDB API (screenshots)
    const igdbQuery = `fields name, screenshots.image_id; search "${rawgData.name}"; limit 1;`;
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        "Authorization": `bearer ${IGDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: igdbQuery
    });

    let igdbData = [];
    try {
      igdbData = await igdbRes.json();
    } catch (e) {
      console.warn("IGDB JSON parse failed:", e);
    }

    const igdbScreenshots =
      igdbData?.[0]?.screenshots?.map(
        (s) => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`
      ) || [];

    // 3️⃣ Merge screenshots from RAWG + IGDB
    const screenshots =
      (rawgData.short_screenshots?.map((s) => s.image) || []).concat(igdbScreenshots);

    // 4️⃣ Final merged result
    const merged = {
      id: rawgData.id,
      slug: rawgData.slug,
      name: rawgData.name,
      released: rawgData.released,
      description_raw: rawgData.description_raw || rawgData.description || "",
      background_image: rawgData.background_image,
      metacritic: rawgData.metacritic,
      stores: rawgData.stores || [],
      genres: rawgData.genres || [],
      platforms: rawgData.platforms || [],
      screenshots
    };

    res.status(200).json(merged);
  } catch (err) {
    console.error("Server error in /api/game:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
