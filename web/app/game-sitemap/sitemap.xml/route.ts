import fs from "fs";
import path from "path";
import { SITE_URL } from "../../../lib/site";

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
    console.error("[game-sitemap-index] Failed to read igdb-cache.json", error);

    return {
      games: [],
      lastUpdated: nowIso
    };
  }
}

export async function GET() {
  const { games, lastUpdated } = readGameCache();
  const sitemapCount = Math.max(
    1,
    Math.ceil(games.length / GAME_SITEMAP_PAGE_SIZE)
  );

  const entries = Array.from({ length: sitemapCount }, (_, index) => {
    return `  <sitemap>
    <loc>${SITE_URL}/game-sitemap/sitemap/${index}.xml</loc>
    <lastmod>${lastUpdated}</lastmod>
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