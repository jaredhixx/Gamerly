// /api/game.js — Hybrid RAWG + IGDB integration (2026 build)
import { CONFIG } from "./config.js";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const RAWG_KEY = CONFIG.RAWG_KEY;
    const IGDB_ID = CONFIG.IGDB_CLIENT_ID;
    const IGDB_TOKEN = CONFIG.IGDB_ACCESS_TOKEN;

    // --- RAWG Base Info ---
    const rawgUrl = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;
    const rawgRes = await fetch(rawgUrl);
    const rawgData = await rawgRes.json();

    if (!rawgRes.ok) {
      console.error("RAWG fetch error:", rawgData);
      return res.status(rawgRes.status).json({ error: "RAWG fetch failed" });
    }

    // --- IGDB Supplement (adds images/trailers if missing) ---
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_ID,
        Authorization: `Bearer ${IGDB_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: `fields name, cover.image_id, screenshots.image_id, artworks.image_id, summary, genres.name, platforms.name, videos.video_id, url; search "${rawgData.name}"; limit 1;`,
    });

    let igdbData = [];
    try {
      igdbData = await igdbRes.json();
    } catch (e) {
      console.warn("IGDB JSON parse error:", e);
    }

    const igdb = igdbData?.[0] || {};

    // --- Merge IGDB Data ---
    const screenshots =
      (rawgData.short_screenshots && rawgData.short_screenshots.length)
        ? rawgData.short_screenshots.map(s => s.image)
        : igdb.screenshots
        ? igdb.screenshots.map(s => `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${s.image_id}.jpg`)
        : [];

    const cover = igdb.cover
      ? `https://images.igdb.com/igdb/image/upload/t_1080p/${igdb.cover.image_id}.jpg`
      : rawgData.background_image;

    const merged = {
      id: rawgData.id,
      slug: rawgData.slug,
      name: rawgData.name,
      released: rawgData.released,
      description: rawgData.description_raw || igdb.summary || "No description available.",
      genres: rawgData.genres?.length ? rawgData.genres : igdb.genres || [],
      platforms: rawgData.platforms?.length ? rawgData.platforms : igdb.platforms || [],
      metacritic: rawgData.metacritic || null,
      background_image: cover,
      screenshots,
      stores: rawgData.stores || [],
      website: rawgData.website || igdb.url || "",
    };

    res.status(200).json(merged);
  } catch (err) {
    console.error("Hybrid fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
