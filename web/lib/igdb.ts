import { getAllGames, getGameByIdFromIGDB } from "./igdb-data";

export type GamerlyGame = {
  id: number;
  name: string;
  slug: string;
  releaseDate?: string | null;
  aggregated_rating?: number | null;
  aggregated_rating_count?: number | null;
  coverUrl?: string | null;
  platforms?: string[];
  genres?: string[];
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