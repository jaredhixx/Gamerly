import { getCachedCatalogSnapshot } from "../../lib/igdb-data";
import { SITE_URL } from "../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;

export async function GET() {
  const { games, lastUpdated } = await getCachedCatalogSnapshot();

  const gameCount = games.filter(
    (game) =>
      typeof game?.id === "number" &&
      typeof game?.slug === "string" &&
      game.slug.length > 0
  ).length;

  const safeLastUpdated = lastUpdated ?? new Date().toISOString();

  const sitemapEntries = [
    `  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${safeLastUpdated}</lastmod>
  </sitemap>`
  ];

  const gameSitemapCount = Math.max(
    1,
    Math.ceil(gameCount / GAME_SITEMAP_PAGE_SIZE)
  );

  for (let index = 0; index < gameSitemapCount; index += 1) {
    sitemapEntries.push(`  <sitemap>
    <loc>${SITE_URL}/game-sitemap/sitemap/${index}.xml</loc>
    <lastmod>${safeLastUpdated}</lastmod>
  </sitemap>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}