// api/igdb.js
// Gamerly — IGDB API with proper ratings support

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
   CONSTANTS
========================= */
const PLATFORM_MAP = {
  pc: [6],
  playstation: [48, 167],
  xbox: [49, 169],
  nintendo: [130],
  ios: [39],
  android: [34],
};

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
   QUERY BUILDER
========================= */
function buildQuery({ platforms }) {
  let platformIds = [];

  platforms.forEach(p => {
    if (PLATFORM_MAP[p]) {
      platformIds.push(...PLATFORM_MAP[p]);
    }
  });

  platformIds = [...new Set(platformIds)];

  const where = [
    "name != null",
    "first_release_date != null",
  ];

  if (platformIds.length) {
    where.push(`platforms = (${platformIds.join(",")})`);
  }

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
    where ${where.join(" & ")};
    sort first_release_date desc;
    limit 500;
  `;
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  try {
    const platforms = (req.query.platforms || "")
      .split(",")
      .filter(Boolean);

    const token = await getTwitchToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: buildQuery({ platforms }),
    });

    const data = await igdbRes.json();
    if (!igdbRes.ok) throw new Error("IGDB request failed");

    const now = Date.now();

    const outNow = [];
    const comingSoon = [];

    data.forEach(g => {
      const game = normalizeGame(g);
      if (!game.releaseDate) return;

      const releaseTime = new Date(game.releaseDate).getTime();
      releaseTime <= now ? outNow.push(game) : comingSoon.push(game);
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
