import fs from "fs";
import path from "path";
import "server-only";
import { platformIdToSlug, type PlatformSlug } from "./platforms";
import { genreNameToSlug, type GenreSlug } from "./genres";

const CACHE_FILE = path.join(process.cwd(), "igdb-cache.json");

const IGDB_GAME_FIELDS = `
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
  genres.name
`;

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
    fs.writeFileSync(CACHE_FILE, JSON.stringify(games, null, 2));
  } catch (error) {
    console.warn("Failed to write IGDB cache:", error);
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

    if (
      name.includes("playstation") ||
      name.includes("ps4") ||
      name.includes("ps5")
    ) {
      slugs.push("playstation");
    }

    if (name.includes("xbox")) {
      slugs.push("xbox");
    }

    if (name.includes("switch") || name.includes("nintendo switch")) {
      slugs.push("switch");
    }

    if (
      name.includes("ios") ||
      name.includes("iphone") ||
      name.includes("ipad")
    ) {
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

    if (
      normalizedName.includes("role playing") ||
      normalizedName.includes("role-playing") ||
      normalizedName.includes("rpg")
    ) {
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

    if (
      normalizedName.includes("simulation") ||
      normalizedName.includes("simulator") ||
      normalizedName.includes("sim")
    ) {
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
    ? rawGame.platformSlugs.filter(
        (value: unknown): value is PlatformSlug => typeof value === "string"
      )
    : normalizePlatformSlugsFromNames(platforms);

  const genreSlugs = Array.isArray(rawGame?.genreSlugs)
    ? rawGame.genreSlugs.filter(
        (value: unknown): value is GenreSlug => typeof value === "string"
      )
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
    if (!fs.existsSync(CACHE_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(hydrateCachedGameShape);
  } catch (error) {
    console.warn("Failed to read IGDB cache:", error);
    return [];
  }
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

function unixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function normalizeCover(url: string | undefined) {
  if (!url) {
    return null;
  }

  return `https:${url}`.replace("t_thumb", "t_1080p");
}

function normalizeScreenshot(url: string | undefined) {
  if (!url) {
    return null;
  }

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

function getNormalizedReleaseDate(game: any): string | null {
  const nowUnix = Math.floor(Date.now() / 1000);

  const releaseDates: number[] = [];

  if (typeof game?.first_release_date === "number") {
    releaseDates.push(game.first_release_date);
  }

  if (Array.isArray(game?.release_dates)) {
    for (const releaseDate of game.release_dates) {
      if (typeof releaseDate?.date === "number") {
        releaseDates.push(releaseDate.date);
      }
    }
  }

  if (releaseDates.length === 0) {
    return null;
  }

  const uniqueSortedReleaseDates = Array.from(new Set(releaseDates)).sort(
    (a, b) => a - b
  );

  const upcomingReleaseDate = uniqueSortedReleaseDates.find(
    (releaseDate) => releaseDate > nowUnix
  );

  if (typeof upcomingReleaseDate === "number") {
    return new Date(upcomingReleaseDate * 1000).toISOString();
  }

  const earliestReleaseDate = uniqueSortedReleaseDates[0];

  return new Date(earliestReleaseDate * 1000).toISOString();
}

function normalizeGame(game: any): GamerlyGame {
  const trailer =
    Array.isArray(game?.videos) &&
    game.videos.length > 0 &&
    game.videos[0]?.video_id
      ? `https://www.youtube.com/embed/${game.videos[0].video_id}`
      : null;

  const platforms = Array.isArray(game?.platforms)
    ? game.platforms
        .map((platform: any) => platform?.name)
        .filter((value: unknown): value is string => typeof value === "string")
    : [];

  const genres = Array.isArray(game?.genres)
    ? game.genres
        .map((genre: any) => genre?.name)
        .filter((value: unknown): value is string => typeof value === "string")
    : [];

  return {
    id: game.id,
    name: game.name,
    slug: slugifyGameName(game.name),
    releaseDate: getNormalizedReleaseDate(game),
    aggregated_rating: game.aggregated_rating ?? null,
    aggregated_rating_count: game.aggregated_rating_count ?? null,
    coverUrl: normalizeCover(game?.cover?.url),
    platforms,
    platformSlugs: normalizePlatformSlugs(game?.platforms ?? []),
    genres,
    genreSlugs: normalizeGenreSlugs(game?.genres ?? []),
    summary: game.summary || game.storyline || null,
    screenshots: Array.isArray(game?.screenshots)
      ? game.screenshots
          .map((screenshot: any) => normalizeScreenshot(screenshot?.url))
          .filter((value: string | null): value is string => Boolean(value))
          .slice(0, 5)
      : [],
    trailer
  };
}

function mergeStringArrays(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]));
}

function mergeGames(existing: GamerlyGame, incoming: GamerlyGame): GamerlyGame {
  return {
    ...existing,
    name: existing.name || incoming.name,
    slug: existing.slug || incoming.slug,
    releaseDate: existing.releaseDate ?? incoming.releaseDate ?? null,
    aggregated_rating:
      existing.aggregated_rating ?? incoming.aggregated_rating ?? null,
    aggregated_rating_count:
      existing.aggregated_rating_count ?? incoming.aggregated_rating_count ?? null,
    coverUrl: existing.coverUrl ?? incoming.coverUrl ?? null,
    platforms: mergeStringArrays(existing.platforms, incoming.platforms),
    platformSlugs: Array.from(
      new Set([...existing.platformSlugs, ...incoming.platformSlugs])
    ),
    genres: mergeStringArrays(existing.genres, incoming.genres),
    genreSlugs: Array.from(new Set([...existing.genreSlugs, ...incoming.genreSlugs])),
    summary: existing.summary ?? incoming.summary ?? null,
    screenshots: mergeStringArrays(existing.screenshots, incoming.screenshots).slice(0, 5),
    trailer: existing.trailer ?? incoming.trailer ?? null
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
    throw new Error("Missing IGDB client ID");
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
    body: query
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`IGDB request failed: ${response.status} ${responseText}`);
  }

  const data = JSON.parse(responseText);

  return Array.isArray(data) ? data : [];
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function getEndOfTodayUTC() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  );
}

type CatalogWindow = {
  label: string;
  startUnix: number;
  endUnix: number;
  sortDirection: "asc" | "desc";
  limit: number;
};

function buildCatalogQuery(window: CatalogWindow) {
  return `
    fields ${IGDB_GAME_FIELDS};
    where
      name != null &
      cover != null &
      (
        (first_release_date >= ${window.startUnix} & first_release_date <= ${window.endUnix}) |
        (release_dates.date >= ${window.startUnix} & release_dates.date <= ${window.endUnix})
      );
    sort first_release_date ${window.sortDirection};
    limit ${window.limit};
  `;
}

function buildCatalogWindows(): CatalogWindow[] {
  const endOfTodayUTC = getEndOfTodayUTC();
  const todayUnix = unixSeconds(endOfTodayUTC);
  const tomorrowUnix = todayUnix + 1;

  return [
    {
      label: "future-near",
      startUnix: tomorrowUnix,
      endUnix: tomorrowUnix + 180 * 86400,
      sortDirection: "asc",
      limit: 500
    },
    {
      label: "future-far",
      startUnix: tomorrowUnix + 181 * 86400,
      endUnix: tomorrowUnix + 365 * 86400,
      sortDirection: "asc",
      limit: 500
    },
    {
      label: "past-recent",
      startUnix: todayUnix - 365 * 86400,
      endUnix: todayUnix,
      sortDirection: "desc",
      limit: 500
    },
    {
      label: "past-mid",
      startUnix: todayUnix - 1095 * 86400,
      endUnix: todayUnix - 366 * 86400,
      sortDirection: "desc",
      limit: 500
    },
    {
      label: "past-deep",
      startUnix: todayUnix - 1825 * 86400,
      endUnix: todayUnix - 1096 * 86400,
      sortDirection: "desc",
      limit: 500
    }
  ];
}

async function fetchSharedCatalogFromIGDB(): Promise<GamerlyGame[]> {
  const token = await getTwitchToken();
  const windows = buildCatalogWindows();
  const mergedById = new Map<number, GamerlyGame>();

  for (const window of windows) {
    try {
      const rawGames = await postIGDB(buildCatalogQuery(window), token);
      const normalizedGames = rawGames
        .map(normalizeGame)
        .filter((game) => game.id && game.name && game.releaseDate);

      for (const game of normalizedGames) {
        const existing = mergedById.get(game.id);

        if (!existing) {
          mergedById.set(game.id, game);
          continue;
        }

        mergedById.set(game.id, mergeGames(existing, game));
      }

      await sleep(300);
    } catch (error) {
      console.warn(`IGDB catalog window failed: ${window.label}`, error);
      await sleep(500);
    }
  }

  const catalog = Array.from(mergedById.values())
    .filter((game) => game.releaseDate && game.coverUrl)
    .sort((a, b) => {
      const aTime = new Date(a.releaseDate || "").getTime();
      const bTime = new Date(b.releaseDate || "").getTime();
      return bTime - aTime;
    });

  if (catalog.length === 0) {
    throw new Error("IGDB shared catalog returned zero games");
  }

  return catalog;
}

export async function getAllGames(): Promise<GamerlyGame[]> {
  const forceRefresh = process.env.IGDB_FORCE_REFRESH === "true";
  const cachedGames = loadCache();

  if (!forceRefresh && cachedGames.length > 0) {
    return cachedGames;
  }

  try {
    const liveGames = await fetchSharedCatalogFromIGDB();
    saveCache(liveGames);
    return liveGames;
  } catch (error) {
    if (cachedGames.length > 0) {
      console.warn("Using igdb-cache.json fallback because live IGDB fetch failed.", error);
      return cachedGames;
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