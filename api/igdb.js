// api/igdb.js
// Gamerly IGDB API — FINAL FIX (handles null release dates correctly)

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
    throw new Error("Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Twitch OAuth failed: ${JSON.stringify(data)}`);
  }

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
    id: g.id ?? null,
    name: g.name ?? "Unknown title",
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString()
      : null,
    rating: typeof g.rating === "number" ? Math.round(g.rating) : null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
  };
}

/* =========================
   QUERY BUILDER
========================= */
function buildQuery({ platforms, range, sort }) {
  const nowUnix = unix(new Date());
  const sixMonthsAheadUnix = nowUnix + 183 * 24 * 60 * 60;

  const whereParts = [
    "name != null",
    "category = (0,8,9,10)",
    // 👇 THIS IS THE CRITICAL FIX
    `(first_release_date = null | first_release_date <= ${sixMonthsAheadUnix})`,
  ];

  // Past 3 months lower bound only
  if (range === "past_3_months") {
    whereParts.push(`first_release_date >= ${nowUnix - 90 * 24 * 60 * 60}`);
  }

  // Platform filtering
  let platformIds = [];
  platforms.forEach(p => {
    if (PLATFORM_MAP[p]) platformIds.push(...PLATFORM_MAP[p]);
  });
  platformIds = [...new Set(platformIds)];

  if (platformIds.length) {
    whereParts.push(`platforms = (${platformIds.join(",")})`);
  }

  let sortClause = "sort first_release_date desc;";
  if (sort === "highest_rated") sortClause = "sort rating desc;";
  if (sort === "az") sortClause = "sort name asc;";

  return `
    fields
      name,
      first_release_date,
      rating,
      cover.url,
      platforms.name;
    where ${whereParts.join(" & ")};
    ${sortClause}
    limit 36;
  `;
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  try {
    const platforms = (req.query.platforms || "").split(",").filter(Boolean);
    const range = req.query.range || "this_week";
    const sort = req.query.sort || "newest";

    const token = await getTwitchToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: buildQuery({ platforms, range, sort }),
    });

    const data = await igdbRes.json();

    if (!igdbRes.ok) {
      throw new Error(JSON.stringify(data));
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    res.status(200).json({
      ok: true,
      meta: { platforms, range, sort, futureCapMonths: 6 },
      games: data.map(normalizeGame),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
