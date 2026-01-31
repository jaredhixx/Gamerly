// /api/igdb.js
export default async function handler(req, res) {
  try {
    const { search, sort = "first_release_date desc", limit = 40 } = req.query;

    // Get a fresh token (you can cache this later)
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // IGDB query body
    const body = `
      fields name, first_release_date, cover.url, total_rating, genres.name, platforms.name, screenshots.image_id;
      ${search ? `search "${search}";` : ""}
      sort ${sort};
      where category = 0 & version_parent = null;
      limit ${limit};
    `;

    // Call IGDB API
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
    res.status(200).json(data);
  } catch (err) {
    console.error("IGDB API error:", err);
    res.status(500).json({ error: "Failed to fetch from IGDB" });
  }
}
