import { getCachedCatalogSnapshot } from "../../../../lib/igdb-data";
import { SITE_URL } from "../../../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;

function isReleasedGame(game: { releaseDate?: string | null }) {
  if (!game.releaseDate) {
    return false;
  }

  const releaseTime = new Date(game.releaseDate).getTime();

  if (Number.isNaN(releaseTime)) {
    return false;
  }

  return releaseTime <= Date.now();
}

function isHighSignalGame(game: {
  aggregated_rating?: number | null;
  aggregated_rating_count?: number | null;
  releaseDate?: string | null;
}) {
  if (!isReleasedGame(game)) {
    return false;
  }

  const hasRating = typeof game.aggregated_rating === "number";

  const hasAtLeastOneRating =
    typeof game.aggregated_rating_count === "number" &&
    game.aggregated_rating_count >= 1;

  return hasRating && hasAtLeastOneRating;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(
  _request: Request,
  context: { params: { slug: string[] } }
) {
  const slugParts = context.params.slug;

  if (!Array.isArray(slugParts) || slugParts.length !== 1) {
    return new Response("Invalid sitemap path", { status: 404 });
  }

  const rawSegment = slugParts[0];

  if (!rawSegment.endsWith(".xml")) {
    return new Response("Invalid sitemap path", { status: 404 });
  }

  const rawId = rawSegment.slice(0, -4);
  const sitemapId = Number(rawId);

  if (!Number.isInteger(sitemapId) || sitemapId < 0) {
    return new Response("Invalid sitemap id", { status: 404 });
  }

  const { games, lastUpdated } = await getCachedCatalogSnapshot();
  const safeLastUpdated = lastUpdated ?? new Date().toISOString();
  const sitemapEligibleGames = games.filter(isHighSignalGame);
  const startIndex = sitemapId * GAME_SITEMAP_PAGE_SIZE;
  const endIndex = startIndex + GAME_SITEMAP_PAGE_SIZE;
  const gamesForThisSitemap = sitemapEligibleGames.slice(startIndex, endIndex);

  if (gamesForThisSitemap.length === 0 && sitemapId !== 0) {
    return new Response("Sitemap not found", { status: 404 });
  }

  const entries = gamesForThisSitemap.map((game) => {
    const url = `${SITE_URL}/game/${game.id}-${game.slug}`;
    const lastModified = game.releaseDate || safeLastUpdated;

    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${escapeXml(lastModified)}</lastmod>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}