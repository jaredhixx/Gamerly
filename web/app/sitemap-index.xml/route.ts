import { fetchGames } from "../../lib/igdb";
import { SITE_URL } from "../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;

export async function GET() {
  const now = new Date().toISOString();

  const sitemapEntries = [
    `  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  ];

  try {
    const games = await fetchGames();
    const gameSitemapCount = Math.max(
      1,
      Math.ceil(games.length / GAME_SITEMAP_PAGE_SIZE)
    );

    for (let index = 0; index < gameSitemapCount; index += 1) {
      sitemapEntries.push(`  <sitemap>
    <loc>${SITE_URL}/game-sitemap/sitemap/${index}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
    }
  } catch (error) {
    console.error(
      "[sitemap-index] Failed to prepare game sitemap entries.",
      error
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}