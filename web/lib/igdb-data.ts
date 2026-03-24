import fs from "fs";
import path from "path";
import "server-only";
import { platformIdToSlug, type PlatformSlug } from "./platforms";
import { genreNameToSlug, type GenreSlug } from "./genres";
import type { ReleaseDatePrecision } from "./release-date";

const CACHE_FILE = path.join(process.cwd(), "igdb-cache.json");

const CACHE_STALE_WARNING_HOURS = 24;
const CACHE_STALE_ERROR_HOURS = 72;
const MIN_REASONABLE_CACHE_SIZE = 100;

type IGDBCacheFile = {
  lastUpdated: string;
  games: GamerlyGame[];
};

const IGDB_GAME_FIELDS = `
  name,
  summary,
  storyline,
  first_release_date,
  release_dates.date,
  release_dates.y,
  release_dates.m,
  release_dates.d,
  release_dates.human,
  release_dates.date_format,
  release_dates.status,
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
releaseDateDisplay: string | null;
releaseDatePrecision: ReleaseDatePrecision;
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
    const payload: IGDBCacheFile = {
      lastUpdated: new Date().toISOString(),
      games
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2));
    console.log(
      `[IGDB] Cache saved successfully. games=${games.length} file=${CACHE_FILE}`
    );
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
releaseDateDisplay:
  rawGame.releaseDateDisplay ??
  rawGame.releaseDisplayDate ??
  null,
releaseDatePrecision: rawGame.releaseDatePrecision ?? "unknown",
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

function loadCache(): {
  games: GamerlyGame[];
  lastUpdated: string | null;
  isLegacyFormat: boolean;
} {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      console.warn("[IGDB] Cache file not found.");
      return {
        games: [],
        lastUpdated: null,
        isLegacyFormat: false
      };
    }

    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const games = parsed.map(hydrateCachedGameShape);

      console.warn(
        `[IGDB] Loaded legacy cache format. games=${games.length} file=${CACHE_FILE}`
      );

      return {
        games,
        lastUpdated: null,
        isLegacyFormat: true
      };
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.games)
    ) {
      const games = parsed.games.map(hydrateCachedGameShape);
      const lastUpdated =
        typeof parsed.lastUpdated === "string" ? parsed.lastUpdated : null;

      return {
        games,
        lastUpdated,
        isLegacyFormat: false
      };
    }

    console.warn("[IGDB] Cache file exists but format is invalid.");
    return {
      games: [],
      lastUpdated: null,
      isLegacyFormat: false
    };
  } catch (error) {
    console.warn("Failed to read IGDB cache:", error);
    return {
      games: [],
      lastUpdated: null,
      isLegacyFormat: false
    };
  }
}

function getCacheAgeHours(lastUpdated: string | null): number | null {
  if (!lastUpdated) {
    return null;
  }

  const timestamp = new Date(lastUpdated).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return (Date.now() - timestamp) / (1000 * 60 * 60);
}

function logCacheHealth(
  games: GamerlyGame[],
  lastUpdated: string | null,
  isLegacyFormat: boolean
) {
  const ageHours = getCacheAgeHours(lastUpdated);

  if (games.length === 0) {
    console.warn("[IGDB] Cache is empty.");
    return;
  }

  if (isLegacyFormat) {
    console.warn(
      `[IGDB] Cache is using legacy array format. games=${games.length}`
    );
    return;
  }

  if (!lastUpdated) {
    console.warn(
      `[IGDB] Cache metadata is missing lastUpdated. games=${games.length}`
    );
    return;
  }

  if (ageHours !== null && ageHours >= CACHE_STALE_ERROR_HOURS) {
    console.warn(
      `[IGDB] Cache is very stale. ageHours=${ageHours.toFixed(1)} games=${games.length} lastUpdated=${lastUpdated}`
    );
    return;
  }

  if (ageHours !== null && ageHours >= CACHE_STALE_WARNING_HOURS) {
    console.warn(
      `[IGDB] Cache is getting stale. ageHours=${ageHours.toFixed(1)} games=${games.length} lastUpdated=${lastUpdated}`
    );
    return;
  }

  console.log(
    `[IGDB] Cache loaded. ageHours=${ageHours?.toFixed(1) ?? "unknown"} games=${games.length} lastUpdated=${lastUpdated}`
  );
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

const RELEASE_DATE_PRECISION_RANK: Record<ReleaseDatePrecision, number> = {
  unknown: 0,
  tbd: 1,
  year: 2,
  quarter: 3,
  "year-month": 4,
  day: 5
};

function getDaysInMonthUTC(year: number, monthNumber: number) {
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

function getReleasePrecisionFromDateFormat(
  value: unknown
): ReleaseDatePrecision {
  if (typeof value !== "number") {
    return "unknown";
  }

  if (value === 0) {
    return "day";
  }

  if (value === 1) {
    return "year-month";
  }

  if (value === 2) {
    return "year";
  }

  if (value === 3 || value === 4 || value === 5 || value === 6) {
    return "quarter";
  }

  if (value === 7) {
    return "tbd";
  }

  return "unknown";
}

function buildQuarterEndDateISO(year: number, quarterFormat: number) {
  if (quarterFormat === 3) {
    return new Date(Date.UTC(year, 2, 31, 23, 59, 59, 999)).toISOString();
  }

  if (quarterFormat === 4) {
    return new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999)).toISOString();
  }

  if (quarterFormat === 5) {
    return new Date(Date.UTC(year, 8, 30, 23, 59, 59, 999)).toISOString();
  }

  if (quarterFormat === 6) {
    return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
  }

  return null;
}

function buildQuarterDisplayLabel(year: number, quarterFormat: number) {
  if (quarterFormat === 3) {
    return `Q1 ${year}`;
  }

  if (quarterFormat === 4) {
    return `Q2 ${year}`;
  }

  if (quarterFormat === 5) {
    return `Q3 ${year}`;
  }

  if (quarterFormat === 6) {
    return `Q4 ${year}`;
  }

  return String(year);
}

function getNormalizedReleaseInfo(game: any): {
  releaseDate: string | null;
  releaseDateDisplay: string | null;
  releaseDatePrecision: ReleaseDatePrecision;
} {
  if (Array.isArray(game?.release_dates) && game.release_dates.length > 0) {
    const validReleaseDates = game.release_dates
      .filter((releaseDate: any) => typeof releaseDate?.date === "number")
      .sort((a: any, b: any) => a.date - b.date);

    for (const releaseDate of validReleaseDates) {
      const year =
        typeof releaseDate?.y === "number"
          ? releaseDate.y
          : typeof releaseDate?.date === "number"
          ? new Date(releaseDate.date * 1000).getUTCFullYear()
          : null;

      const month =
        typeof releaseDate?.m === "number" ? releaseDate.m : null;

      const day =
        typeof releaseDate?.d === "number" ? releaseDate.d : null;

      const dateFormat =
        typeof releaseDate?.date_format === "number"
          ? releaseDate.date_format
          : null;

      const human =
        typeof releaseDate?.human === "string" && releaseDate.human.trim().length > 0
          ? releaseDate.human.trim()
          : null;

      const precision = getReleasePrecisionFromDateFormat(dateFormat);

      if (precision === "tbd") {
        continue;
      }

      if (precision === "day") {
        return {
          releaseDate: new Date(releaseDate.date * 1000).toISOString(),
          releaseDateDisplay: human,
          releaseDatePrecision: "day"
        };
      }

      if (precision === "year-month" && year && month) {
        const lastDayOfMonth = getDaysInMonthUTC(year, month);

        return {
          releaseDate: new Date(
            Date.UTC(year, month - 1, lastDayOfMonth, 23, 59, 59, 999)
          ).toISOString(),
          releaseDateDisplay: human ?? `${new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "long"
          })}`,
          releaseDatePrecision: "year-month"
        };
      }

      if (precision === "year" && year) {
        return {
          releaseDate: new Date(
            Date.UTC(year, 11, 31, 23, 59, 59, 999)
          ).toISOString(),
          releaseDateDisplay: human ?? String(year),
          releaseDatePrecision: "year"
        };
      }

      if (precision === "quarter" && year && dateFormat) {
        const quarterEndDateISO = buildQuarterEndDateISO(year, dateFormat);

        if (quarterEndDateISO) {
          return {
            releaseDate: quarterEndDateISO,
            releaseDateDisplay: human ?? buildQuarterDisplayLabel(year, dateFormat),
            releaseDatePrecision: "quarter"
          };
        }
      }

      if (year && month && day) {
        return {
          releaseDate: new Date(
            Date.UTC(year, month - 1, day, 23, 59, 59, 999)
          ).toISOString(),
          releaseDateDisplay: human,
          releaseDatePrecision: "day"
        };
      }
    }
  }

  if (typeof game?.first_release_date === "number") {
    const fallbackDate = new Date(game.first_release_date * 1000);

    return {
      releaseDate: fallbackDate.toISOString(),
      releaseDateDisplay: fallbackDate.toLocaleDateString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      releaseDatePrecision: "day"
    };
  }

  return {
    releaseDate: null,
    releaseDateDisplay: null,
    releaseDatePrecision: "unknown"
  };
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

  const releaseInfo = getNormalizedReleaseInfo(game);

  return {
    id: game.id,
    name: game.name,
    slug: slugifyGameName(game.name),
    releaseDate: releaseInfo.releaseDate,
    releaseDateDisplay: releaseInfo.releaseDateDisplay,
    releaseDatePrecision: releaseInfo.releaseDatePrecision,
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
  const existingPrecisionRank =
    RELEASE_DATE_PRECISION_RANK[existing.releaseDatePrecision] ?? 0;

  const incomingPrecisionRank =
    RELEASE_DATE_PRECISION_RANK[incoming.releaseDatePrecision] ?? 0;

  const shouldUseIncomingRelease =
    !existing.releaseDate ||
    (Boolean(incoming.releaseDate) && incomingPrecisionRank > existingPrecisionRank);

  return {
    ...existing,
    name: existing.name || incoming.name,
    slug: existing.slug || incoming.slug,
    releaseDate: shouldUseIncomingRelease
      ? incoming.releaseDate ?? existing.releaseDate ?? null
      : existing.releaseDate ?? incoming.releaseDate ?? null,
    releaseDateDisplay: shouldUseIncomingRelease
      ? incoming.releaseDateDisplay ?? existing.releaseDateDisplay ?? null
      : existing.releaseDateDisplay ?? incoming.releaseDateDisplay ?? null,
    releaseDatePrecision: shouldUseIncomingRelease
      ? incoming.releaseDatePrecision
      : existing.releaseDatePrecision,
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
    cache: "no-store",
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

const CATALOG_PAGE_SIZE = 500;
const CATALOG_MAX_PAGES_PER_WINDOW = 6;

type CatalogWindow = {
  label: string;
  startUnix: number;
  endUnix: number;
  sortDirection: "asc" | "desc";
};

function buildCatalogQuery(
  window: CatalogWindow,
  dateField: "first_release_date" | "release_dates.date",
  offset = 0
) {
  return `
    fields ${IGDB_GAME_FIELDS};
    where
      name != null &
      cover != null &
      ${dateField} >= ${window.startUnix} &
      ${dateField} <= ${window.endUnix};
    sort ${dateField} ${window.sortDirection};
    limit ${CATALOG_PAGE_SIZE};
    offset ${offset};
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
      sortDirection: "asc"
    },
    {
      label: "future-far",
      startUnix: tomorrowUnix + 181 * 86400,
      endUnix: tomorrowUnix + 365 * 86400,
      sortDirection: "asc"
    },
    {
      label: "past-recent-1a-1",
      startUnix: todayUnix - 30 * 86400,
      endUnix: todayUnix,
      sortDirection: "desc"
    },
    {
      label: "past-recent-1a-2",
      startUnix: todayUnix - 60 * 86400,
      endUnix: todayUnix - 31 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-1b-1",
      startUnix: todayUnix - 90 * 86400,
      endUnix: todayUnix - 61 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-1b-2",
      startUnix: todayUnix - 120 * 86400,
      endUnix: todayUnix - 91 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-2a-1",
      startUnix: todayUnix - 150 * 86400,
      endUnix: todayUnix - 121 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-2a-2",
      startUnix: todayUnix - 180 * 86400,
      endUnix: todayUnix - 151 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-2b-1",
      startUnix: todayUnix - 210 * 86400,
      endUnix: todayUnix - 181 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-2b-2",
      startUnix: todayUnix - 240 * 86400,
      endUnix: todayUnix - 211 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-3a-1",
      startUnix: todayUnix - 270 * 86400,
      endUnix: todayUnix - 241 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-3a-2",
      startUnix: todayUnix - 300 * 86400,
      endUnix: todayUnix - 271 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-3b-1",
      startUnix: todayUnix - 333 * 86400,
      endUnix: todayUnix - 301 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-recent-3b-2",
      startUnix: todayUnix - 365 * 86400,
      endUnix: todayUnix - 334 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1a-1a",
      startUnix: todayUnix - 272 * 86400,
      endUnix: todayUnix - 241 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1a-1b",
      startUnix: todayUnix - 303 * 86400,
      endUnix: todayUnix - 273 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1a-2a",
      startUnix: todayUnix - 334 * 86400,
      endUnix: todayUnix - 304 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1a-2b",
      startUnix: todayUnix - 365 * 86400,
      endUnix: todayUnix - 335 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1b-1a-1",
      startUnix: todayUnix - 411 * 86400,
      endUnix: todayUnix - 366 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1b-1a-2",
      startUnix: todayUnix - 457 * 86400,
      endUnix: todayUnix - 412 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1b-1b",
      startUnix: todayUnix - 548 * 86400,
      endUnix: todayUnix - 458 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-1b-2",
      startUnix: todayUnix - 730 * 86400,
      endUnix: todayUnix - 549 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-mid-2",
      startUnix: todayUnix - 1095 * 86400,
      endUnix: todayUnix - 731 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-deep-1",
      startUnix: todayUnix - 1460 * 86400,
      endUnix: todayUnix - 1096 * 86400,
      sortDirection: "desc"
    },
    {
      label: "past-deep-2",
      startUnix: todayUnix - 1825 * 86400,
      endUnix: todayUnix - 1461 * 86400,
      sortDirection: "desc"
    }
  ];
}

async function fetchSharedCatalogFromIGDB(): Promise<GamerlyGame[]> {
  const token = await getTwitchToken();
  const windows = buildCatalogWindows();
  const mergedById = new Map<number, GamerlyGame>();

  for (const window of windows) {
    try {
      const dateFields: Array<"first_release_date" | "release_dates.date"> = [
        "first_release_date",
        "release_dates.date"
      ];

      for (const dateField of dateFields) {
        let hitWindowPageCap = true;

        for (let pageIndex = 0; pageIndex < CATALOG_MAX_PAGES_PER_WINDOW; pageIndex += 1) {
          const offset = pageIndex * CATALOG_PAGE_SIZE;
          const rawGames = await postIGDB(
            buildCatalogQuery(window, dateField, offset),
            token
          );
          const normalizedGames = rawGames
            .map(normalizeGame)
            .filter((game) => game.id && game.name && game.releaseDate);

          console.log(
            `[IGDB] Catalog page fetched. window=${window.label} dateField=${dateField} pageIndex=${pageIndex} offset=${offset} raw=${rawGames.length} normalized=${normalizedGames.length}`
          );

          for (const game of normalizedGames) {
            const existing = mergedById.get(game.id);

            if (!existing) {
              mergedById.set(game.id, game);
              continue;
            }

            mergedById.set(game.id, mergeGames(existing, game));
          }

          if (rawGames.length < CATALOG_PAGE_SIZE) {
            hitWindowPageCap = false;
            break;
          }

          await sleep(300);
        }

        if (hitWindowPageCap) {
          console.warn(
            `[IGDB] Catalog window hit page cap. window=${window.label} dateField=${dateField} pageSize=${CATALOG_PAGE_SIZE} maxPages=${CATALOG_MAX_PAGES_PER_WINDOW}`
          );
        }
      }
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
  const cache = loadCache();
  const cachedGames = cache.games;

  logCacheHealth(cachedGames, cache.lastUpdated, cache.isLegacyFormat);

  const cacheLooksUsable =
    cachedGames.length >= MIN_REASONABLE_CACHE_SIZE;

  if (!forceRefresh && cacheLooksUsable) {
    console.log(
      `[IGDB] Returning cached catalog. games=${cachedGames.length} forceRefresh=false`
    );
    return cachedGames;
  }

  if (!forceRefresh && cachedGames.length > 0 && !cacheLooksUsable) {
    console.warn(
      `[IGDB] Cache exists but looks suspiciously small. games=${cachedGames.length}. Attempting live refresh instead of trusting cache immediately.`
    );
  }

  if (forceRefresh) {
    console.log("[IGDB] IGDB_FORCE_REFRESH=true. Attempting live catalog refresh.");
  }

  try {
    const liveGames = await fetchSharedCatalogFromIGDB();

    if (liveGames.length === 0) {
      throw new Error("Live IGDB catalog returned zero games");
    }

    saveCache(liveGames);

    console.log(
      `[IGDB] Returning live catalog. games=${liveGames.length}`
    );

    return liveGames;
  } catch (error) {
    if (cachedGames.length > 0) {
      console.warn(
        `[IGDB] Live IGDB fetch failed. Falling back to cache. games=${cachedGames.length} lastUpdated=${cache.lastUpdated ?? "unknown"}`,
        error
      );
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