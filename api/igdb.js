// api/igdb.js
// Gamerly — LOCKED backend (frontend handles Out Now / Coming Soon)
// Stable + ratings + summaries + screenshots added safely (ROI-first)

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

function normalizeScreenshot(url) {
  if (!url) return null;
  // Use large but safe size for gallery
  return `https:${url}`.replace("t_thumb", "t_screenshot_big");
}

function normalizeGame(g) {
  // Collect all possible release timestamps
  const dates = [];

  if (g.first_release_date) {
    dates.push(g.first_release_date);
  }

  if (Array.isArray(g.release_dates)) {
    g.release_dates.forEach(rd => {
      if (rd?.date) dates.push(rd.date);
    });
  }

  // Pick earliest valid date
  const earliest =
    dates.length > 0 ? Math.min(...dates) : null;

  return {
    id: g.id,
    name: g.name,
    releaseDate: g.first_release_date
  ? new Date(g.first_release_date * 1000).toISOString()
  : Array.isArray(g.release_dates) && g.release_dates.length
    ? new Date(
        Math.min(...g.release_dates.map(r => r.date)) * 1000
      ).toISOString()
    : null,
    aggregated_rating: g.aggregated_rating ?? null,
    aggregated_rating_count: g.aggregated_rating_count ?? null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
    category: g.genres?.[0]?.name ?? null,

    // SEO + trust
    summary: g.summary || g.storyline || null,

    screenshots: Array.isArray(g.screenshots)
      ? g.screenshots
          .map(s => normalizeScreenshot(s.url))
          .filter(Boolean)
          .slice(0, 5)
      : [],
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
const endOfTodayUTC = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59
  )
);
  const past = new Date(now.getTime() - pastDays * 86400000);

  return `
    fields
  name,
  summary,
  storyline,
  first_release_date,
  release_dates.date,
  release_dates.platform,
  aggregated_rating,
  aggregated_rating_count,
  cover.url,
  screenshots.url,
  platforms.name,
  genres.name;
    where
  (
    first_release_date <= ${unixSeconds(endOfTodayUTC)}
release_dates.date <= ${unixSeconds(endOfTodayUTC)}
  ) |
  (
    release_dates.date >= ${unixSeconds(past)} &
    release_dates.date <= ${unixSeconds(now)}
  );
    sort first_release_date desc;
    limit ${limit};
  `;
}

function buildUpcomingQuery({ futureDays = 540, limit = 250 }) {
  const now = new Date();
const endOfTodayUTC = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59
  )
);
  const future = new Date(now.getTime() + futureDays * 86400000);

  return `
    fields
  name,
  summary,
  storyline,
  first_release_date,
  release_dates.date,
  release_dates.platform,
  aggregated_rating,
  aggregated_rating_count,
  cover.url,
  screenshots.url,
  platforms.name,
  genres.name;
    where
  (
    first_release_date > ${unixSeconds(endOfTodayUTC)}
release_dates.date > ${unixSeconds(endOfTodayUTC)}
  ) |
  (
    release_dates.date > ${unixSeconds(now)} &
    release_dates.date <= ${unixSeconds(future)}
  );
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
