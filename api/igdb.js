// api/igdb.js
// Stable IGDB API — platform filtering restored, ordering unchanged

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

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
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
        limit 150;
      `,
    });

    const games = await igdbRes.json();
    if (!igdbRes.ok) throw new Error(JSON.stringify(games));

    res.status(200).json({
      ok: true,
      games: games.map(g => ({
        name: g.name,
        releaseDate: g.first_release_date
          ? new Date(g.first_release_date * 1000).toISOString()
          : null,
        rating: g.rating ? Math.round(g.rating) : null,
        coverUrl: g.cover?.url
          ? `https:${g.cover.url}`.replace("t_thumb", "t_cover_big")
          : null,
        platforms: g.platforms?.map(p => p.name) || [],
      })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
