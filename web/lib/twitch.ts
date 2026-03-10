export async function getTwitchAccessToken() {

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  return data.access_token;

}



export async function fetchTwitchStreams() {

  const token = await getTwitchAccessToken();

  const clientId = process.env.TWITCH_CLIENT_ID;

  const response = await fetch(
    "https://api.twitch.tv/helix/streams?first=100",
    {
      headers: {
        "Client-ID": clientId!,
        "Authorization": `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  return data.data;

}