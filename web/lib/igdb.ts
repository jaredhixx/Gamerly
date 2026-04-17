import {
  getAllGames,
  getCacheLastUpdated,
  getGameByIdFromIGDB
} from "./igdb-data";
import type { PlatformSlug } from "./platforms";
import type { GenreSlug } from "./genres";
import type { ReleaseDatePrecision } from "./release-date";

export type GamerlyGame = {
  id: number;
  name: string;
  slug: string;
  releaseDate?: string | null;
  releaseDatePrecision?: ReleaseDatePrecision | null;
  releaseDisplayDate?: string | null;
  aggregated_rating?: number | null;
  aggregated_rating_count?: number | null;
  coverUrl?: string | null;
  platforms?: string[];
  platformSlugs?: PlatformSlug[];
  genres?: string[];
  genreSlugs?: GenreSlug[];
  summary?: string | null;
  screenshots?: string[];
  trailer?: string | null;
  hypeScore?: number;
};

export async function fetchGames(): Promise<GamerlyGame[]> {
  return getAllGames();
}

export async function getIGDBCacheLastUpdated(): Promise<string | null> {
  return await getCacheLastUpdated();
}

export async function getGameById(id: number) {
  return getGameByIdFromIGDB(id);
}

function getReleaseTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  if (Number.isNaN(time)) {
    return null;
  }

  return time;
}

type CatalogSlices = {
  filtered: GamerlyGame[];
  released: GamerlyGame[];
  upcoming: GamerlyGame[];
};

let platformSliceCacheGamesRef: GamerlyGame[] | null = null;
const platformSliceCache = new Map<PlatformSlug, CatalogSlices>();

let genreSliceCacheGamesRef: GamerlyGame[] | null = null;
const genreSliceCache = new Map<GenreSlug, CatalogSlices>();

export function getPlatformCatalogSlices(
  games: GamerlyGame[],
  platformSlug: PlatformSlug,
  now = Date.now()
) {
  if (platformSliceCacheGamesRef !== games) {
    platformSliceCacheGamesRef = games;
    platformSliceCache.clear();
  }

  const cachedSlices = platformSliceCache.get(platformSlug);

  if (cachedSlices) {
    return cachedSlices;
  }

  const filtered: GamerlyGame[] = [];
  const released: GamerlyGame[] = [];
  const upcoming: GamerlyGame[] = [];

  for (const game of games) {
    if (!game.platformSlugs?.includes(platformSlug)) {
      continue;
    }

    filtered.push(game);

    const releaseTime = getReleaseTime(game.releaseDate);

    if (releaseTime === null) {
      continue;
    }

    if (releaseTime > now) {
      upcoming.push(game);
    } else {
      released.push(game);
    }
  }

  const slices = {
    filtered,
    released,
    upcoming
  };

  platformSliceCache.set(platformSlug, slices);

  return slices;
}

export function getGenreCatalogSlices(
  games: GamerlyGame[],
  genreSlug: GenreSlug,
  now = Date.now()
) {
  if (genreSliceCacheGamesRef !== games) {
    genreSliceCacheGamesRef = games;
    genreSliceCache.clear();
  }

  const cachedSlices = genreSliceCache.get(genreSlug);

  if (cachedSlices) {
    return cachedSlices;
  }

  const filtered: GamerlyGame[] = [];
  const released: GamerlyGame[] = [];
  const upcoming: GamerlyGame[] = [];

  for (const game of games) {
    if (!game.genreSlugs?.includes(genreSlug)) {
      continue;
    }

    filtered.push(game);

    const releaseTime = getReleaseTime(game.releaseDate);

    if (releaseTime === null) {
      continue;
    }

    if (releaseTime > now) {
      upcoming.push(game);
    } else {
      released.push(game);
    }
  }

  const slices = {
    filtered,
    released,
    upcoming
  };

  genreSliceCache.set(genreSlug, slices);

  return slices;
}