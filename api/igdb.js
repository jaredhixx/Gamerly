// /api/igdb.js
// Production-ready IGDB proxy for Vercel + local.
// - Handles Twitch OAuth (token caching)
// - Accepts filters via query params
// - Returns normalized game objects for your frontend

let tokenCache = {
  accessToken: null,
  expiresAtMs: 0,
};

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function getTwitchAccessToken() {
  const now = Date.now();

  // Use cached token if still valid (with a 60s safety buffer)
  if (tokenCache.accessToken && now < tokenCache.expiresAtMs - 60_000) {
    return tokenCache.accessToken;
  }

  const clientId = getEnv("IGDB_CLIENT_ID");
  const clientSecret = getEnv("IGDB_CLIENT_SECRET");

  const url =
    "https://id.twitch.tv/oauth2/token" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&grant_type=client_credentials`;

  const resp = await fetch(url, { method: "POST" });
  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(
      `Twitch OAuth failed (${resp.status}): ${JSON.stringify(data)}`
    );
  }

  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAtMs = now + (data.expires_in * 1000);

  return tokenCache.accessToken;
}

// Platform groups (IDs from IGDB)
const PLATFORM_GROUPS = {
  pc: [6],
  playstation: [48, 167],      // PS4, PS5
  xbox: [49, 169],             // Xbox One, Series X|S
  nintendo: [130],             // Switch
  ios: [39],
  android: [34],
};

function parseCommaList(v) {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function unixSeconds(dateObj) {
  return Math.floor(dateObj.getTime() / 1000);
}

function buildIgdbQuery({ platforms, sort, range, limit, offset }) {
  const now = new Date();
  const nowSec = unixSeconds(now);

  // Range filter
  // this_week: last 7 days through next ~14 days (helps catch near releases)
  // past_3_months: last 90 days through next ~30 days
  // all_time: no lower bound
  let lowerBound = null;
  let upperBound = null;

  if (range === "this_week") {
    lowerBound = nowSec - (7 * 24 * 60 * 60);
    upperBound = nowSec + (14 * 24 * 60 * 60);
  } else if (range === "past_3_months") {
    lowerBound = nowSec - (90 * 24 * 60 * 60);
    upperBound = nowSec + (30 * 24 * 60 * 60);
  } else {
    // all_time
    lowerBound = null;
    upperBound = null;
  }

  // Collect platform IDs from group keys
  const platformIds = [];
  for (const key of platforms) {
    const ids = PLATFORM_GROUPS[key];
    if (ids) platformIds.push(...ids);
  }

  // Sorting
  // newest => first_release_date desc
  // highest_rated => rating desc (fallback to first_release_date desc)
  // az => name asc
  let sortClause = "sort first_release_date desc;";
  if (sort === "highest_rated") {
    sortClause = "sort rating desc;";
  } else if (sort === "az") {
    sortClause = "sort name asc;";
  }

  // Where conditions
  const whereParts = [];

  // Only real games (avoid some junky entries)
  whereParts.push("category = (0,8,9,10)"); // main game + remaster/remake/expanded/port (helps completeness)

  // Must have a name
  whereParts.push("name != null");

  // Release date bounds using first_release_date
  if (lowerBound != null) whereParts.push(`first_release_date >= ${lowerBound}`);
  if (upperBound != null) whereParts.push(`first_release_date <= ${upperBound}`);

  // Platforms filter
  if (platformIds.length) {
    const uniq = [...new Set(platformIds)];
    whereParts.push(`platforms = (${uniq.join(",")})`);
  }

  // Build IGDB query body
  // NOTE: cover.url returns //images.igdb.com/... (we'll normalize in response)
  const fields =
    "fields name,slug,summary,first_release_date,rating,rating_count," +
    "cover.url,platforms.name,genres.name,websites.url;";

  const whereClause = `where ${whereParts.join(" & ")};`;

  const q =
    [
      fields,
      whereClause,
      sortClause,
      `limit ${limit};`,
      `offset ${offset};`,
    ].join("\n");

  return q;
}

function normalizeCoverUrl(url) {
  if (!url) return null;
  // IGDB often returns URLs starting with //
  const withProto = url.startsWith("//") ? `https:${url}` : url;

  // Optional: bump image size for nicer cards
  // t_thumb / t_cover_small / t_cover_big / t_720p etc.
  return withProto.replace("t_thumb", "t_cover_big");
}

function normalizeGame(g) {
  const releaseMs = g.first_release_date ? g.first_release_date * 1000 : null;

  return {
    id: g.id ?? null,
    name: g.name ?? "Unknown title",
    slug: g.slug ?? null,
    summary: g.summary ?? null,
    releaseDate: releaseMs ? new Date(releaseMs).toISOString() : null,
    rating: typeof g.rating === "number" ? Math.round(g.rating) : null, // 0-100
    ratingCount: typeof g.rating_count === "number" ? g.rating_count : null,
    coverUrl: normalizeCoverUrl(g.cover?.url),
    platforms: Array.isArray(g.platforms) ? g.platforms.map(p => p.name).filter(Boolean) : [],
    genres: Array.isArray(g.genres) ? g.genres.map(x => x.name).filter(Boolean) : [],
    websites: Array.isArray(g.websites) ? g.websites.map(w => w.url).filter(Boolean) : [],
  };
}

export default async function handler(req, res) {
  try {
    // Query params
    const platforms = parseCommaList(req.query.platforms); // e.g. "pc,xbox"
    const sort = (req.query.sort || "newest").toString(); // newest | highest_rated | az
    const range = (req.query.range || "this_week").toString(); // this_week | past_3_months | all_time

    const limit = Math.min(Math.max(parseInt(req.query.limit || "36", 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const clientId = getEnv("IGDB_CLIENT_ID");
    const token = await getTwitchAccessToken();

    const body = buildIgdbQuery({ platforms, sort, range, limit, offset });

    const igdbResp = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    const igdbData = await igdbResp.json();

    if (!igdbResp.ok) {
      return res.status(igdbResp.status).json({
        error: "IGDB request failed",
        details: igdbData,
      });
    }

    const games = Array.isArray(igdbData) ? igdbData.map(normalizeGame) : [];

    // Cache response briefly (Vercel edge/browser) to reduce rate hits
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json({
      ok: true,
      meta: { platforms, sort, range, limit, offset, count: games.length },
      games,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Unknown server error",
    });
  }
}
