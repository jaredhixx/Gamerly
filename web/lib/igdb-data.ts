import "server-only";
import { unstable_cache } from "next/cache";

export type GamerlyGame = {
  id: number;
  name: string;
  slug: string;
  releaseDate: string | null;
  aggregated_rating: number | null;
  aggregated_rating_count: number | null;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  summary: string | null;
  screenshots: string[];
  trailer: string | null;
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

function unixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function normalizeCover(url: string | undefined) {
  if (!url) return null;
  return `https:${url}`.replace("t_thumb", "t_1080p");
}

function normalizeScreenshot(url: string | undefined) {
  if (!url) return null;
  return `https:${url}`.replace("t_thumb", "t_1080p");
}

function slugifyGameName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeGame(g: any): GamerlyGame {
  const releaseDates: number[] = [];

  if (g.first_release_date) {
    releaseDates.push(g.first_release_date);
  }

  if (Array.isArray(g.release_dates)) {
    for (const rd of g.release_dates) {
      if (rd?.date) {
        releaseDates.push(rd.date);
      }
    }
  }

  const earliestReleaseDate =
    releaseDates.length > 0 ? Math.min(...releaseDates) : null;

    const trailer =
    Array.isArray(g.videos) &&
    g.videos.length > 0 &&
    g.videos[0]?.video_id
      ? `https://www.youtube.com/embed/${g.videos[0].video_id}`
      : null;

  return {
  id: g.id,
  name: g.name,
  slug: slugifyGameName(g.name),
  releaseDate: earliestReleaseDate
    ? new Date(earliestReleaseDate * 1000).toISOString()
    : null,
  aggregated_rating: g.aggregated_rating ?? null,
  aggregated_rating_count: g.aggregated_rating_count ?? null,
  coverUrl: normalizeCover(g.cover?.url),
  platforms: Array.isArray(g.platforms)
    ? g.platforms.map((p: any) => p.name).filter(Boolean)
    : [],
  genres: Array.isArray(g.genres)
    ? g.genres.map((gn: any) => gn.name).filter(Boolean)
    : [],
  summary: g.summary || g.storyline || null,
  screenshots: Array.isArray(g.screenshots)
    ? g.screenshots
        .map((s: any) => normalizeScreenshot(s.url))
        .filter(Boolean)
        .slice(0, 5)
    : [],
  trailer,
};
}

async function getTwitchToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing IGDB credentials");
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST",
      cache: "no-store",
    }
  );

const data = await response.json();

if (!response.ok || !data.access_token) {
  console.error(
    "IGDB OAuth error:",
    response.status,
    data
  );

  if (cachedToken) {
    return cachedToken;
  }

  throw new Error("IGDB authentication failed and no cached token exists.");
}

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;

  return data.access_token;
}

async function postIGDB(query: string, token: string) {
  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: query,
    next: {
      revalidate: 3600,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`IGDB request failed: ${response.status} ${responseText}`);
  }

  const data = JSON.parse(responseText);

  return Array.isArray(data) ? data : [];
}

function buildRecentQuery({ pastDays = 120, limit = 250, offset = 0 }) {
  const now = new Date();

  const endOfTodayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  );

  const past = new Date(now.getTime() - pastDays * 86400000);

  return `
    fields
      name,
      summary,
      storyline,
      first_release_date,
      release_dates.date,
      release_dates.platform,
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      screenshots.url,
      videos.video_id,
      platforms.name,
      genres.name;
    where
      (
        first_release_date >= ${unixSeconds(past)} &
        first_release_date <= ${unixSeconds(endOfTodayUTC)}
      ) |
      (
        release_dates.date >= ${unixSeconds(past)} &
        release_dates.date <= ${unixSeconds(endOfTodayUTC)}
      );
    sort first_release_date desc;
    limit ${limit};
offset ${offset};
  `;
}

function buildUpcomingQuery({ futureDays = 540, limit = 250, offset = 0 }) {
  const now = new Date();

  const endOfTodayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  );

  const future = new Date(now.getTime() + futureDays * 86400000);

  return `
    fields
      name,
      summary,
      storyline,
      first_release_date,
      release_dates.date,
      release_dates.platform,
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      screenshots.url,
      videos.video_id,
      platforms.name,
      genres.name;
    where
      (
        first_release_date > ${unixSeconds(endOfTodayUTC)} &
        first_release_date <= ${unixSeconds(future)}
      ) |
      (
        release_dates.date > ${unixSeconds(endOfTodayUTC)} &
        release_dates.date <= ${unixSeconds(future)}
      );
    sort first_release_date asc;
    limit ${limit};
offset ${offset};
  `;
}

const getRecentGamesCached = unstable_cache(
  async (): Promise<GamerlyGame[]> => {

    const token = await getTwitchToken();

    const pageSize = 250;
    const pages = 6;

    const results: any[] = [];

    for (let i = 0; i < pages; i++) {

      const offset = i * pageSize;

      const page = await postIGDB(
        buildRecentQuery({
          pastDays: 120,
          limit: pageSize,
          offset
        }),
        token
      );

      results.push(...page);
    }

    return results.map(normalizeGame);

  },
  ["recent-games"],
  { revalidate: 3600 }
);


const getUpcomingGamesCached = unstable_cache(
  async (): Promise<GamerlyGame[]> => {

    const token = await getTwitchToken();

    const pageSize = 250;
    const pages = 6;

    const results: any[] = [];

    for (let i = 0; i < pages; i++) {

      const offset = i * pageSize;

      const page = await postIGDB(
        buildUpcomingQuery({
          futureDays: 540,
          limit: pageSize,
          offset
        }),
        token
      );

      results.push(...page);
    }

    return results.map(normalizeGame);

  },
  ["upcoming-games"],
  { revalidate: 3600 }
);


export async function getAllGames(): Promise<GamerlyGame[]> {

  const [recent, upcoming] = await Promise.all([
    getRecentGamesCached(),
    getUpcomingGamesCached()
  ]);

  const merged = [...recent, ...upcoming]
    .filter((game) => game.releaseDate && game.coverUrl);

  const byId = new Map<number, GamerlyGame>();

  for (const game of merged) {
    byId.set(game.id, game);
  }

  return Array.from(byId.values());
}

export async function getGameByIdFromIGDB(id: number): Promise<GamerlyGame | null> {
  const games = await getAllGames();
  const game = games.find((g) => g.id === id);
  return game ?? null;
}