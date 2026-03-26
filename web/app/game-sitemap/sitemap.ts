import { MetadataRoute } from "next";
import { fetchGames } from "../../lib/igdb";
import { SITE_URL } from "../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;

export async function generateSitemaps() {
  try {
    const games = await fetchGames();
    const sitemapCount = Math.max(
      1,
      Math.ceil(games.length / GAME_SITEMAP_PAGE_SIZE)
    );

    return Array.from({ length: sitemapCount }, (_, index) => ({
      id: index
    }));
  } catch (error) {
    console.error(
      "[game-sitemap] Failed to prepare sitemap pages. Returning one empty sitemap.",
      error
    );

    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  try {
    const games = await fetchGames();
    const startIndex = id * GAME_SITEMAP_PAGE_SIZE;
    const endIndex = startIndex + GAME_SITEMAP_PAGE_SIZE;
    const gamesForThisSitemap = games.slice(startIndex, endIndex);

    return gamesForThisSitemap.map((game) => ({
      url: `${SITE_URL}/game/${game.id}-${game.slug}`,
      lastModified: game.releaseDate ? new Date(game.releaseDate) : now
    }));
  } catch (error) {
    console.error(
      "[game-sitemap] Failed to fetch games for sitemap page. Returning empty sitemap.",
      error
    );

    return [];
  }
}