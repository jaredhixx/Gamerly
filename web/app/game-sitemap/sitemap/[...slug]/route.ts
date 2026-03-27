import fs from "fs";
import path from "path";
import { SITE_URL } from "../../../../lib/site";

export const revalidate = 21600;

const GAME_SITEMAP_PAGE_SIZE = 5000;
const CACHE_FILE = path.join(process.cwd(), "igdb-cache.json");

type CachedGame = {
  id: number;
  slug: string;
  releaseDate?: string | null;
};

type CachePayload =
  | {
      lastUpdated?: string;
      games?: CachedGame[];
    }
  | CachedGame[];

function readGameCache(): {
  games: CachedGame[];
  lastUpdated: string;
} {
  const nowIso = new Date().toISOString();

  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CachePayload;

    const rawGames = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.games)
      ? parsed.games
      : [];

    const games = rawGames.filter(
      (game): game is CachedGame =>
        typeof game?.id === "number" &&
        typeof game?.slug === "string" &&
        game.slug.length > 0
    );

    const lastUpdated =
      Array.isArray(parsed)
        ? nowIso
        : typeof parsed.lastUpdated === "string"
        ? parsed.lastUpdated
        : nowIso;

    return {
      games,
      lastUpdated
    };
  } catch (error) {
    console.error("[game-sitemap-child] Failed to read igdb-cache.json", error);

    return {
      games: [],
      lastUpdated: nowIso
    };
  }
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

  const { games, lastUpdated } = readGameCache();
  const startIndex = sitemapId * GAME_SITEMAP_PAGE_SIZE;
  const endIndex = startIndex + GAME_SITEMAP_PAGE_SIZE;
  const gamesForThisSitemap = games.slice(startIndex, endIndex);

  if (gamesForThisSitemap.length === 0 && sitemapId !== 0) {
    return new Response("Sitemap not found", { status: 404 });
  }

  const entries = gamesForThisSitemap.map((game) => {
    const url = `${SITE_URL}/game/${game.id}-${game.slug}`;
    const lastModified = game.releaseDate || lastUpdated;

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