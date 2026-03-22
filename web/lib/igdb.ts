import { getAllGames, getGameByIdFromIGDB } from "./igdb-data";
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

export async function getGameById(id: number) {
  return getGameByIdFromIGDB(id);
}