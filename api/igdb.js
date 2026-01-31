// /api/igdb.js — Gamerly v5.0 Data Bridge
// Safely fetches IGDB data via Twitch API using your credentials

export default async function handler(req, res) {
  try {
    const { search, sort = "first_release_date desc", limit = 40 } = req.query;

    // === Step 1: Get a valid Twitch OAuth token ===
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("❌ IGDB token fetch failed:", tokenData);
      return res.status(500).json({ error: "Failed to get IGDB token" });
    }

    // === Step 2: Build the IGDB query ===
    const body = `
      fields name, first_release_date, cover.url, total_rating, genres.name, platforms.name, screenshots.image_id;
      ${search ? `search "${search}";` : ""}
      sort ${sort};
      where category = 0 & version_parent = null & cover != null;
      limit ${limit};
    `;

    // === Step 3: Call IGDB API ===
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    const data = await igdbRes.json();

    if (!Array.isArray(data)) {
      console.error("❌ IGDB data error:", data);
      return res.status(500).json({ error: "Invalid IGDB response" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("🔥 IGDB API Error:", err);
    res.status(500).json({ error: "Server error contacting IGDB" });
  }
}
