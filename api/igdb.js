// api/igdb.js
// Gamerly — BASELINE STABLE BACKEND (DO NOT TOUCH)

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
    throw new Error("Missing IGDB credentials");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const data = await res.json();
  if (!res.ok) throw new Error("OAuth failed");

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return cachedToken;
}

function unix(date) {
  return Math.floor(date.getTime() / 1000);
}

function normalizeCover(url) {
  if (!url) return null;
  return `https:${url}`.replace("t_thumb", "t_cover_big");
}

function normalizeGame(g) {
  return {
    id: g.id,
    name: g.name,
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString()
      : null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
    category: g.genres?.[0]?.name ?? null,
  };
}

function buildQuery() {
  const past = new Date();
  const future = new Date();

  past.setMonth(past.getMonth() - 6);
  future.setMonth(future.getMonth() + 12);

  return `
    fields
      name,
      first_release_date,
      cover.url,
      platforms.name,
      genres.name;
    where
      first_release_date >= ${unix(past)} &
      first_release_date <= ${unix(future)};
    sort first_release_date asc;
    limit 500;
  `;
}

export default async function handler(req, res) {
  try {
    const token = await getTwitchToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: buildQuery(),
    });

    const raw = await igdbRes.json();
    if (!igdbRes.ok) throw new Error("IGDB request failed");

    const games = raw
      .map(normalizeGame)
      .filter(g => g.releaseDate && g.coverUrl);

    res.status(200).json({
      ok: true,
      games, // frontend handles splitting
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
