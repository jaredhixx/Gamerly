import { unstable_cache } from "next/cache";
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

const cachedGames = unstable_cache(
  async () => {
    return getAllGames();
  },
  ["all-games"],
  {
    revalidate: 1800
  }
);

export async function fetchGames(): Promise<GamerlyGame[]> {
  return cachedGames();
}

export async function getGameById(id: number) {
  return getGameByIdFromIGDB(id);
}