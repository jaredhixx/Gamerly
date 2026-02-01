// api/igdb.js
// IGDB endpoint — correct Out Now / Coming Soon behavior

let cachedToken = null;
let tokenExpiry = 0;

// ===== AUTH =====
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

// ===== CONSTANTS =====
const PLATFORM_MAP = {
  pc: [6],
  playstation: [48, 167],
  xbox: [49, 169],
  nintendo: [130],
  ios: [39],
  android: [34],
};

// ===== HELPERS =====
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
    rating: typeof g.rating === "number" ? Math.round(g.rating) : null,
    coverUrl: normalizeCover(g.cover?.url),
    platforms: Array.isArray(g.platforms)
      ? g.platforms.map(p => p.name).filter(Boolean)
      : [],
  };
}

// ===== QUERY BUILDER =====
function buildQuery({ platforms, limit }) {
  let platformIds = [];

  platforms.forEach(p => {
    if (PLATFORM_MAP[p]) platformIds.push(...PLATFORM_MAP[p]);
  });

  platformIds = [...new Set(platformIds)];

  const now = Math.floor(Date.now() / 1000);
  const sixMonthsAhead = now + 183 * 24 * 60 * 60;

  const where = [
    "name != null",
    "first_release_date != null",
    `first_release_date <= ${sixMonthsAhead}`, // ✅ future cap ONLY
  ];

  if (platformIds.length) {
    where.push(`platforms = (${platformIds.join(",")})`);
  }

  return `
    fields name, first_release_date, rating, cover.url, platforms.name;
    where ${where.join(" & ")};
    sort first_release_date desc;
    limit ${limit};
  `;
}

// ===== HANDLER =====
export default async function handler(req, res) {
  try {
    const platforms = (req.query.platforms || "").split(",").filter(Boolean);
    const mode = req.query.mode || "full";
    const limit = mode === "initial" ? 72 : 500;

    const token = await getTwitchToken();

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: buildQuery({ platforms, limit }),
    });

    const data = await igdbRes.json();
    if (!igdbRes.ok) throw new Error(JSON.stringify(data));

    res.status(200).json({
      ok: true,
      mode,
      games: data.map(normalizeGame),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
