// api/igdb.js
// Step 2: Twitch OAuth verification ONLY (no game queries yet)

let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  const now = Date.now();

  // Reuse token if still valid (60s buffer)
  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET");
  }

  const url =
    "https://id.twitch.tv/oauth2/token" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&grant_type=client_credentials`;

  const response = await fetch(url, { method: "POST" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Twitch OAuth failed: ${response.status} ${JSON.stringify(data)}`
    );
  }

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;

  return cachedToken;
}

export default async function handler(req, res) {
  try {
    const token = await getTwitchToken();

    res.status(200).json({
      ok: true,
      auth: "success",
      tokenPreview: token.slice(0, 6) + "…",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
