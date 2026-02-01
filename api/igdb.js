// api/igdb.js
// Gamerly IGDB API — FINAL COVERAGE FIX (includes release_dates)

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
  if (!res.ok) throw new Error(JSON.stringify(data));

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

function normalizeGame(g) {
  const releaseDate =
    g.first_release_date
      ? new Date(g.first_release_date * 1000)
      : g.release_dates?.[0]?.date
        ? new Date(g.release_dates[0].date * 1000)
        : null;

  return {
    id: g.id,
    name: g.name,
    releaseDate: releaseDate ? releaseDate.toISOString() : null,
    rating: g.rating ? Math.round(g.rating) : null,
    coverUrl: g.cover?.url
      ? `https:${g.cover.url}`.replace("t_thumb", "t_cover_big")
      : null,
    platforms: g.platforms?.map(p => p.name) || [],
  };
}

export default async function handler(req, res) {
  try {
    const platforms = (req.query.platforms || "").split(",").filter(Boolean);

    let platformIds = [];
    platforms.forEach(p => {
      if (PLATFORM_MAP[p]) platformIds.push(...PLATFORM_MAP[p]);
    });
    platformIds = [...new Set(platformIds)];

    const whereParts = ["name != null"];
    if (platformIds.length) {
      whereParts.push(`platforms = (${platformIds.join(",")})`);
    }

    const token = await getTwitchToken();
    const allGames = new Map();

    const PAGE_SIZE = 200;
    const MAX_PAGES = 3;

    // 1️⃣ Recently UPDATED
    for (let page = 0; page < MAX_PAGES; page++) {
      const r = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.IGDB_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `
          fields name, rating, cover.url, platforms.name, updated_at;
          where ${whereParts.join(" & ")};
          sort updated_at desc;
          limit ${PAGE_SIZE};
          offset ${page * PAGE_SIZE};
        `,
      });

      const batch = await r.json();
      if (!r.ok || !batch.length) break;
      batch.forEach(g => allGames.set(g.id, normalizeGame(g)));
    }

    // 2️⃣ Recently RELEASED (first_release_date)
    for (let page = 0; page < MAX_PAGES; page++) {
      const r = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.IGDB_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `
          fields name, first_release_date, rating, cover.url, platforms.name;
          where ${whereParts.join(" & ")};
          sort first_release_date desc;
          limit ${PAGE_SIZE};
          offset ${page * PAGE_SIZE};
        `,
      });

      const batch = await r.json();
      if (!r.ok || !batch.length) break;
      batch.forEach(g => allGames.set(g.id, normalizeGame(g)));
    }

    // 3️⃣ PER-PLATFORM RELEASE DATES (THE MISSING WINDOW FIX)
    for (let page = 0; page < MAX_PAGES; page++) {
      const r = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.IGDB_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `
          fields name, release_dates.date, rating, cover.url, platforms.name;
          where ${whereParts.join(" & ")};
          sort release_dates.date desc;
          limit ${PAGE_SIZE};
          offset ${page * PAGE_SIZE};
        `,
      });

      const batch = await r.json();
      if (!r.ok || !batch.length) break;
      batch.forEach(g => allGames.set(g.id, normalizeGame(g)));
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    res.status(200).json({
      ok: true,
      games: Array.from(allGames.values()),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
