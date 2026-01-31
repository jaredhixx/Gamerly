// api/igdb.js
// Step 3: Verify IGDB game data fetch (hardcoded query)

let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET");
  }

  const tokenRes = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    throw new Error(`OAuth failed: ${JSON.stringify(tokenData)}`);
  }

  cachedToken = tokenData.access_token;
  tokenExpiry = now + tokenData.expires_in * 1000;

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
        fields name, first_release_date, rating;
        sort first_release_date desc;
        limit 10;
      `,
    });

    const games = await igdbRes.json();

    if (!igdbRes.ok) {
      throw new Error(`IGDB error: ${JSON.stringify(games)}`);
    }

    res.status(200).json({
      ok: true,
      count: games.length,
      games,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
