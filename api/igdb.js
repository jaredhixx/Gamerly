// api/igdb.js
// Gamerly IGDB API — FINAL FIX (time-windowed future releases)

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
  const date =
    g.first_release_date
      ? new Date(g.first_release_date * 1000)
      : g.release_dates?.[0]?.date
        ? new Date(g.release_dates[0].date * 1000)
        : null;

  return {
    id: g.id,
    name: g.name,
    releaseDate: date ? date.toISOString() : null,
    rating: g.rating ? Math.round(g.rating) : null,
    coverUrl: g.cover?.url
      ? `https:${g.cover.url}`.replace("t_thumb", "t_cover_big")
      : null,
    platforms: g.platforms?.map(p => p.name) || [],
  };
}

async function fetchWindow(token, whereParts, from, to) {
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `
      fields name, first_release_date, release_dates.date, rating, cover.url, platforms.name;
      where ${whereParts.join(" & ")} &
            release_dates.date >= ${from} &
            release_dates.date < ${to};
      sort release_dates.date asc;
      limit 500;
    `,
  });

  const batch = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(batch));
  return batch;
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

    // 🔹 Past + recently updated (unchanged)
    const baseRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `
        fields name, first_release_date, rating, cover.url, platforms.name, updated_at;
        where ${whereParts.join(" & ")};
        sort updated_at desc;
        limit 500;
      `,
    });

    const baseGames = await baseRes.json();
    baseGames.forEach(g => allGames.set(g.id, normalizeGame(g)));

    // 🔹 FUTURE WINDOWS (3-month slices)
    const YEAR_2026 = [
      [Date.UTC(2026, 0, 1), Date.UTC(2026, 3, 1)],
      [Date.UTC(2026, 3, 1), Date.UTC(2026, 6, 1)],
      [Date.UTC(2026, 6, 1), Date.UTC(2026, 9, 1)],
      [Date.UTC(2026, 9, 1), Date.UTC(2027, 0, 1)],
    ];

    for (const [fromMs, toMs] of YEAR_2026) {
      const from = Math.floor(fromMs / 1000);
      const to = Math.floor(toMs / 1000);

      const windowGames = await fetchWindow(token, whereParts, from, to);
      windowGames.forEach(g => allGames.set(g.id, normalizeGame(g)));
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
