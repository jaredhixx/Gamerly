// api/igdb.js
// Gamerly — LOCKED backend (frontend handles Out Now / Coming Soon)
// Stable + ratings added safely

let cachedToken = null;
let tokenExpiry = 0;

/* =========================
   AUTH
========================= */
async function getTwitchToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60_000) return cachedToken;

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
function unixSeconds(date) {
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
    aggregated_rating: g.aggregated_rating ?? null,
    aggregated_rating_count: g.aggregated_rating_count ?? null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
    category: g.genres?.[0]?.name ?? null,
  };
}

async function postIGDB(query, token) {
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  const data = await res.json();
  if (!res.ok) throw new Error("IGDB request failed");
  return Array.isArray(data) ? data : [];
}

/* =========================
   QUERIES
========================= */
function buildRecentQuery({ pastDays = 120, limit = 250 }) {
  const now = new Date();
  const past = new Date(now.getTime() - pastDays * 86400000);

  return `
    fields
      name,
      first_release_date,
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      platforms.name,
      genres.name;
    where
      first_release_date >= ${unixSeconds(past)} &
      first_release_date <= ${unixSeconds(now)};
    sort first_release_date desc;
    limit ${limit};
  `;
}

function buildUpcomingQuery({ futureDays = 540, limit = 250 }) {
  const now = new Date();
  const future = new Date(now.getTime() + futureDays * 86400000);

  return `
    fields
      name,
      first_release_date,
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      platforms.name,
      genres.name;
    where
      first_release_date > ${unixSeconds(now)} &
      first_release_date <= ${unixSeconds(future)};
    sort first_release_date asc;
    limit ${limit};
  `;
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  try {
    const token = await getTwitchToken();

    // Fetch recent + upcoming so frontend always has both
    const [recentRaw, upcomingRaw] = await Promise.all([
      postIGDB(buildRecentQuery({ pastDays: 120, limit: 250 }), token),
      postIGDB(buildUpcomingQuery({ futureDays: 540, limit: 250 }), token),
    ]);

    const merged = [...recentRaw, ...upcomingRaw]
      .map(normalizeGame)
      .filter(g => g.releaseDate && g.coverUrl);

    // De-duplicate by ID
    const byId = new Map();
    for (const g of merged) {
      byId.set(g.id, g);
    }

    res.status(200).json({
      ok: true,
      games: Array.from(byId.values()),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
