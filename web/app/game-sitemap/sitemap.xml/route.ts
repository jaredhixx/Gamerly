import { getCachedCatalogSnapshot } from "../../../lib/igdb-data";
import { SITE_URL } from "../../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;

export async function GET() {
  const { games, lastUpdated } = await getCachedCatalogSnapshot();

  const safeLastUpdated = lastUpdated ?? new Date().toISOString();
  const sitemapCount = Math.max(
    1,
    Math.ceil(games.length / GAME_SITEMAP_PAGE_SIZE)
  );

  const entries = Array.from({ length: sitemapCount }, (_, index) => {
    return `  <sitemap>
    <loc>${SITE_URL}/game-sitemap/sitemap/${index}.xml</loc>
    <lastmod>${safeLastUpdated}</lastmod>
  </sitemap>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}