import fs from "fs";
import path from "path";
import "server-only";
import { unstable_cache } from "next/cache";
import { platformIdToSlug, type PlatformSlug } from "./platforms";
import { genreNameToSlug, type GenreSlug } from "./genres";

const CACHE_FILE = path.join(process.cwd(), "igdb-cache.json");

export type GamerlyGame = {
  id: number;
  name: string;
  slug: string;
  releaseDate: string | null;
  aggregated_rating: number | null;
  aggregated_rating_count: number | null;
  coverUrl: string | null;
  platforms: string[];
  platformSlugs: PlatformSlug[];
  genres: string[];
  genreSlugs: GenreSlug[];
  summary: string | null;
  screenshots: string[];
  trailer: string | null;
};

function saveCache(games: GamerlyGame[]) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(games));
  } catch (err) {
    console.warn("Failed to write IGDB cache:", err);
  }
}

function normalizePlatformSlugsFromNames(platformNames: string[]): PlatformSlug[] {
  const slugs: PlatformSlug[] = [];

  for (const rawName of platformNames) {
    const name = rawName.trim().toLowerCase();

    if (
      name.includes("pc") ||
      name.includes("windows") ||
      name.includes("linux") ||
      name.includes("mac")
    ) {
      slugs.push("pc");
    }

    if (name.includes("playstation") || name.includes("ps4") || name.includes("ps5")) {
      slugs.push("playstation");
    }

    if (name.includes("xbox")) {
      slugs.push("xbox");
    }

    if (name.includes("switch") || name.includes("nintendo switch")) {
      slugs.push("switch");
    }

    if (name.includes("ios") || name.includes("iphone") || name.includes("ipad")) {
      slugs.push("ios");
    }

    if (name.includes("android")) {
      slugs.push("android");
    }
  }

  return Array.from(new Set(slugs));
}

function normalizeGenreSlugsFromNames(genreNames: string[]): GenreSlug[] {
  const slugs: GenreSlug[] = [];

  for (const rawName of genreNames) {
    const normalizedName = rawName.trim().toLowerCase();
    const mapped = genreNameToSlug[normalizedName];

    if (mapped) {
      slugs.push(mapped);
      continue;
    }

    if (normalizedName.includes("role playing") || normalizedName.includes("rpg")) {
      slugs.push("rpg");
    }

    if (normalizedName.includes("shooter")) {
      slugs.push("shooter");
    }

    if (normalizedName.includes("adventure")) {
      slugs.push("adventure");
    }

    if (normalizedName.includes("strategy")) {
      slugs.push("strategy");
    }

    if (normalizedName.includes("simulation")) {
      slugs.push("simulation");
    }

    if (normalizedName.includes("puzzle")) {
      slugs.push("puzzle");
    }

    if (normalizedName.includes("indie")) {
      slugs.push("indie");
    }

    if (normalizedName.includes("fighting")) {
      slugs.push("fighting");
    }

    if (normalizedName.includes("racing")) {
      slugs.push("racing");
    }

    if (normalizedName.includes("sport")) {
      slugs.push("sport");
    }
  }

  return Array.from(new Set(slugs));
}

function hydrateCachedGameShape(rawGame: any): GamerlyGame {
  const platforms = Array.isArray(rawGame?.platforms)
    ? rawGame.platforms.filter((value: unknown): value is string => typeof value === "string")
    : [];

  const genres = Array.isArray(rawGame?.genres)
    ? rawGame.genres.filter((value: unknown): value is string => typeof value === "string")
    : [];

  const platformSlugs = Array.isArray(rawGame?.platformSlugs)
    ? rawGame.platformSlugs.filter((value: unknown): value is PlatformSlug => typeof value === "string")
    : normalizePlatformSlugsFromNames(platforms);

  const genreSlugs = Array.isArray(rawGame?.genreSlugs)
    ? rawGame.genreSlugs.filter((value: unknown): value is GenreSlug => typeof value === "string")
    : normalizeGenreSlugsFromNames(genres);

  return {
    id: rawGame.id,
    name: rawGame.name,
    slug: rawGame.slug,
    releaseDate: rawGame.releaseDate ?? null,
    aggregated_rating: rawGame.aggregated_rating ?? null,
    aggregated_rating_count: rawGame.aggregated_rating_count ?? null,
    coverUrl: rawGame.coverUrl ?? null,
    platforms,
    platformSlugs,
    genres,
    genreSlugs,
    summary: rawGame.summary ?? null,
    screenshots: Array.isArray(rawGame?.screenshots)
      ? rawGame.screenshots.filter((value: unknown): value is string => typeof value === "string")
      : [],
    trailer: rawGame.trailer ?? null
  };
}

function loadCache(): GamerlyGame[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed.map(hydrateCachedGameShape);
      }
    }
  } catch (err) {
    console.warn("Failed to read IGDB cache:", err);
  }

  return [];
}

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

function normalizePlatformSlugs(rawPlatforms: any[]): PlatformSlug[] {
  if (!Array.isArray(rawPlatforms)) {
    return [];
  }

  const slugs = rawPlatforms
    .map((platform) => {
      const id = platform?.id;
      if (typeof id !== "number") {
        return null;
      }

      return platformIdToSlug[id] ?? null;
    })
    .filter((value): value is PlatformSlug => Boolean(value));

  return Array.from(new Set(slugs));
}

function normalizeGenreSlugs(rawGenres: any[]): GenreSlug[] {
  if (!Array.isArray(rawGenres)) {
    return [];
  }

  const genreNames = rawGenres
    .map((genre) => genre?.name)
    .filter((value): value is string => typeof value === "string");

  return normalizeGenreSlugsFromNames(genreNames);
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

  const platforms = Array.isArray(g.platforms)
    ? g.platforms.map((p: any) => p.name).filter(Boolean)
    : [];

  const genres = Array.isArray(g.genres)
    ? g.genres.map((gn: any) => gn.name).filter(Boolean)
    : [];

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
    platforms,
    platformSlugs: normalizePlatformSlugs(g.platforms),
    genres,
    genreSlugs: normalizeGenreSlugs(g.genres),
    summary: g.summary || g.storyline || null,
    screenshots: Array.isArray(g.screenshots)
      ? g.screenshots
          .map((s: any) => normalizeScreenshot(s.url))
          .filter(Boolean)
          .slice(0, 5)
      : [],
    trailer
  };
}

async function getTwitchToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing IGDB credentials");
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("IGDB OAuth error:", response.status, data);
    throw new Error(`IGDB OAuth failed: ${response.status}`);
  }

    cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;

  return data.access_token;
}

async function postIGDB(query: string, token: string) {
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing IGDB_CLIENT_ID");
  }

  if (!token) {
    throw new Error("Missing IGDB bearer token");
  }

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain"
    },
    body: query,
    next: {
      revalidate: 21600
    }
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`IGDB request failed: ${response.status} ${responseText}`);
  }

  const data = JSON.parse(responseText);

  return Array.isArray(data) ? data : [];
}

function buildRecentQuery({
  pastDays = 120,
  limit = 60,
  offset = 0
}: {
  pastDays?: number;
  limit?: number;
  offset?: number;
}) {
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
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      screenshots.url,
      videos.video_id,
      platforms.id,
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

function buildUpcomingQuery({
  futureDays = 540,
  limit = 60,
  offset = 0
}: {
  futureDays?: number;
  limit?: number;
  offset?: number;
}) {
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
      aggregated_rating,
      aggregated_rating_count,
      cover.url,
      screenshots.url,
      videos.video_id,
      platforms.id,
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

async function fetchPagedGames(mode: "recent" | "upcoming"): Promise<GamerlyGame[]> {
  const token = await getTwitchToken();

  const pageSize = 60;
  const pages = 4;
  const results: GamerlyGame[] = [];

  for (let i = 0; i < pages; i++) {
    const offset = i * pageSize;

    try {
      const query =
        mode === "recent"
          ? buildRecentQuery({
              pastDays: 120,
              limit: pageSize,
              offset
            })
          : buildUpcomingQuery({
              futureDays: 540,
              limit: pageSize,
              offset
            });

      const page = await postIGDB(query, token);
      const normalizedPage = page.map(normalizeGame);

      results.push(...normalizedPage);

      if (page.length < pageSize) {
        break;
      }
    } catch (error) {
      console.warn(`IGDB ${mode} page fetch failed at offset ${offset}.`, error);
      break;
    }
  }

  return results;
}

async function fetchRecentGames(): Promise<GamerlyGame[]> {
  return fetchPagedGames("recent");
}

async function fetchUpcomingGames(): Promise<GamerlyGame[]> {
  return fetchPagedGames("upcoming");
}

const getRecentGamesCached = unstable_cache(fetchRecentGames, ["recent-games"], {
  revalidate: 21600
});

const getUpcomingGamesCached = unstable_cache(fetchUpcomingGames, ["upcoming-games"], {
  revalidate: 21600
});

export async function getAllGames(): Promise<GamerlyGame[]> {
  try {
    const [recent, upcoming] = await Promise.all([
      getRecentGamesCached(),
      getUpcomingGamesCached()
    ]);

    const merged = [...recent, ...upcoming].filter(
      (game) => game.releaseDate && game.coverUrl
    );

    const byId = new Map<number, GamerlyGame>();

    for (const game of merged) {
      byId.set(game.id, game);
    }

    const games = Array.from(byId.values());

    if (games.length === 0) {
      throw new Error("IGDB returned zero games after merge");
    }

    saveCache(games);
    return games;
  } catch (error) {
    const fallbackGames = loadCache();

    if (fallbackGames.length > 0) {
      console.warn("Using igdb-cache.json fallback because live IGDB fetch failed.", error);
      return fallbackGames;
    }

    console.error("IGDB failed and no local cache was available.", error);
    throw error;
  }
}

export async function getGameByIdFromIGDB(id: number): Promise<GamerlyGame | null> {
  const games = await getAllGames();
  const game = games.find((g) => g.id === id);
  return game ?? null;
}