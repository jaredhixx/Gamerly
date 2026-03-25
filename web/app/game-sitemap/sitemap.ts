import { MetadataRoute } from "next";
import { fetchGames } from "../../lib/igdb";
import { SITE_URL } from "../../lib/site";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  try {
    const games = await fetchGames();

    return games.map((game) => ({
      url: `${SITE_URL}/game/${game.id}-${game.slug}`,
      lastModified: game.releaseDate ? new Date(game.releaseDate) : now
    }));
  } catch (error) {
    console.error("[game-sitemap] Failed to fetch games. Returning empty sitemap.", error);
    return [];
  }
}