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

export function getIGDBCacheLastUpdated(): string | null {
  return getCacheLastUpdated();
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

export function getPlatformCatalogSlices(
  games: GamerlyGame[],
  platformSlug: PlatformSlug,
  now = Date.now()
) {
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

  return {
    filtered,
    released,
    upcoming
  };
}

export function getGenreCatalogSlices(
  games: GamerlyGame[],
  genreSlug: GenreSlug,
  now = Date.now()
) {
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

  return {
    filtered,
    released,
    upcoming
  };
}