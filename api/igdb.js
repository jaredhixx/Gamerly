// api/igdb.js
// Gamerly IGDB API — STABLE, REVIEWED, MATCHES ORIGINAL WORKING BEHAVIOR

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
   HELPERS
========================= */
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
  };
}

/* =========================
   IGDB QUERY (THIS IS KEY)
========================= */
function buildIgdbQuery() {
  return `
    fields
      name,
      first_release_date,
      rating,
      cover.url,
      updated_at;
    sort updated_at desc;
    limit 200;
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
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: buildIgdbQuery(),
    });

    const rawGames = await igdbRes.json();

    if (!igdbRes.ok) {
      throw new Error(JSON.stringify(rawGames));
    }

    /* =========================
       SERVER-SIDE FUTURE CAP
    ========================= */
    const now = Date.now();
    const sixMonthsAhead = now + 183 * 24 * 60 * 60 * 1000;

    const filteredGames = rawGames.filter(g => {
      if (!g.first_release_date) return true; // allow unknown
      return g.first_release_date * 1000 <= sixMonthsAhead;
    });

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");

    res.status(200).json({
      ok: true,
      count: filteredGames.length,
      games: filteredGames.map(normalizeGame),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
