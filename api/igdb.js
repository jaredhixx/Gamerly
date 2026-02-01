// api/igdb.js
// Gamerly — FINAL stable backend (platform-safe)

let cachedToken = null;
let tokenExpiry = 0;

/* =========================
   AUTH
========================= */
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

/* =========================
   HELPERS
========================= */
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
    rating: g.rating ?? null,
    aggregated_rating: g.aggregated_rating ?? null,
    aggregated_rating_count: g.aggregated_rating_count ?? null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
    category: g.genres?.[0]?.name ?? null,
  };
}

/* =========================
   QUERY BUILDER (NO PLATFORM FILTER)
========================= */
function buildQuery() {
  const now = new Date();
  const past = new Date();
  const future = new Date();

  past.setMonth(past.getMonth() - 6);
  future.setMonth(future.getMonth() + 6);

  return `
    fields
      name,
      first_release_date,
      rating,
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      platforms.name,
      genres.name;
    where
      first_release_date >= ${unix(past)} &
      first_release_date <= ${unix(future)};
    sort first_release_date desc;
    limit 500;
  `;
}

/* =========================
   HANDLER
========================= */
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

    const data = await igdbRes.json();
    if (!igdbRes.ok) throw new Error("IGDB request failed");

    const now = Date.now();
    const outNow = [];
    const comingSoon = [];

    data.forEach(g => {
      const game = normalizeGame(g);
      if (!game.releaseDate) return;

      const t = new Date(game.releaseDate).getTime();
      t <= now ? outNow.push(game) : comingSoon.push(game);
    });

    res.status(200).json({
      ok: true,
      outNow,
      comingSoon,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
