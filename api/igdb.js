// api/igdb.js
// FINAL — Out Now / Coming Soon + platform + category support

let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60_000) return cachedToken;

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const data = await res.json();
  if (!res.ok) throw new Error("OAuth failed");

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return cachedToken;
}

const PLATFORM_MAP = {
  pc: [6],
  playstation: [48, 167],
  xbox: [49, 169],
  nintendo: [130],
  ios: [39],
  android: [34],
};

// Priority order matters (clean UX)
const CATEGORY_PRIORITY = [
  "Role-playing (RPG)",
  "Shooter",
  "Strategy",
  "Adventure",
  "Simulation",
  "Fighting",
  "Racing",
  "Puzzle",
  "Indie",
];

function normalizeCover(url) {
  if (!url) return null;
  return `https:${url}`.replace("t_thumb", "t_cover_big");
}

function pickPrimaryCategory(genres = []) {
  const names = genres.map(g => g.name);
  return CATEGORY_PRIORITY.find(c => names.includes(c)) || null;
}

function normalizeGame(g) {
  return {
    id: g.id,
    name: g.name,
    releaseDate: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString()
      : null,
    rating: typeof g.rating === "number" ? Math.round(g.rating) : null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
    category: pickPrimaryCategory(g.genres),
  };
}

function buildWhere({ platforms, mode }) {
  let platformIds = [];
  platforms.forEach(p => PLATFORM_MAP[p] && platformIds.push(...PLATFORM_MAP[p]));
  platformIds = [...new Set(platformIds)];

  const now = Math.floor(Date.now() / 1000);
  const sixMonths = 183 * 24 * 60 * 60;

  const where = ["name != null", "first_release_date != null"];

  if (mode === "out-now") where.push(`first_release_date <= ${now}`);
  if (mode === "coming-soon") {
    where.push(`first_release_date > ${now}`);
    where.push(`first_release_date <= ${now + sixMonths}`);
  }

  if (platformIds.length) {
    where.push(`platforms = (${platformIds.join(",")})`);
  }

  return where.join(" & ");
}

async function queryIGDB({ platforms, mode }) {
  const token = await getTwitchToken();

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `
      fields name, first_release_date, rating, cover.url,
             platforms.name, genres.name;
      where ${buildWhere({ platforms, mode })};
      sort first_release_date desc;
      limit 500;
    `,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.map(normalizeGame);
}

export default async function handler(req, res) {
  try {
    const platforms = (req.query.platforms || "").split(",").filter(Boolean);

    const [outNow, comingSoon] = await Promise.all([
      queryIGDB({ platforms, mode: "out-now" }),
      queryIGDB({ platforms, mode: "coming-soon" }),
    ]);

    res.status(200).json({ ok: true, outNow, comingSoon });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
