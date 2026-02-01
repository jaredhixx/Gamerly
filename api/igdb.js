// api/igdb.js
// Stable baseline — NO date logic, NO fragile filters

let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60_000) return cachedToken;

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  try {
    const token = await getTwitchToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `
        fields name, first_release_date, rating, cover.url;
        sort updated_at desc;
        limit 100;
      `,
    });

    const games = await igdbRes.json();
    if (!igdbRes.ok) throw new Error(JSON.stringify(games));

    res.status(200).json({
      ok: true,
      games: games.map(g => ({
        name: g.name,
        releaseDate: g.first_release_date
          ? new Date(g.first_release_date * 1000).toISOString()
          : null,
        rating: g.rating ? Math.round(g.rating) : null,
        coverUrl: g.cover?.url
          ? `https:${g.cover.url}`.replace("t_thumb", "t_cover_big")
          : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
