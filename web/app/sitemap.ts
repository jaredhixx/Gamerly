import { MetadataRoute } from "next";
import { fetchGames } from "../lib/igdb";
import { SITE_URL } from "../lib/site";
import { platforms } from "../lib/platforms";
import { genres } from "../lib/genres";
import { bestPagesRegistry } from "../lib/best-pages-registry";

export const revalidate = 21600;

const PAGE_SIZE = 60;
const NEW_GAMES_WINDOW_DAYS = 30;

const genreSlugs = Object.keys(genres);

const monthNames = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
];

function isFuture(date?: string | null) {
  if (!date) {
    return false;
  }

  return new Date(date) > new Date();
}

function isPast(date?: string | null) {
  if (!date) {
    return false;
  }

  return new Date(date) <= new Date();
}

function getRecentNewGamesCount(
  games: Array<{
    releaseDate?: string | null;
  }>
) {
  const now = new Date();

  return games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const release = new Date(game.releaseDate);
    const daysAgo =
      (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);

    return daysAgo >= 0 && daysAgo <= NEW_GAMES_WINDOW_DAYS;
  }).length;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let games: Awaited<ReturnType<typeof fetchGames>> = [];

  try {
    games = await fetchGames();
  } catch (error) {
    console.error("[sitemap] Failed to fetch games. Returning fallback sitemap.", error);

    const genrePages = genreSlugs.map((genre) => ({
      url: `${SITE_URL}/genre/${genre}`,
      lastModified: now
    }));

    const platformPages = Object.keys(platforms).flatMap((platform) => [
      {
        url: `${SITE_URL}/platform/${platform}`,
        lastModified: now
      },
      {
        url: `${SITE_URL}/platform/${platform}/new`,
        lastModified: now
      },
      {
        url: `${SITE_URL}/platform/${platform}/upcoming`,
        lastModified: now
      },
      {
        url: `${SITE_URL}/platform/${platform}/top-rated`,
        lastModified: now
      }
    ]);

    const discoveryPages = [
      "/new-games",
      "/upcoming-games",
      "/games-releasing-today",
      "/games-releasing-this-week",
      "/games-releasing-this-month",
      "/releases",
      "/all-games",
      "/top-rated",
      "/hype",
      "/platforms",
      "/genres",
      "/upcoming-pc-games",
      "/upcoming-xbox-games"
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now
    }));

    return [
      {
        url: SITE_URL,
        lastModified: now
      },
      ...discoveryPages,
      ...platformPages,
      ...genrePages,

      ...bestPagesRegistry
        .filter((page) => page.type === "genre")
        .map((page) => ({
          url: `${SITE_URL}${page.canonicalPath}`,
          lastModified: now
        })),

      ...bestPagesRegistry
        .filter((page) => page.type === "year")
        .map((page) => ({
          url: `${SITE_URL}${page.canonicalPath}`,
          lastModified: now
        })),

      ...bestPagesRegistry
        .filter((page) => page.type === "platform-year")
        .map((page) => ({
          url: `${SITE_URL}${page.canonicalPath}`,
          lastModified: now
        })),

      ...bestPagesRegistry
        .filter((page) => page.type === "genre-platform-year")
        .map((page) => ({
          url: `${SITE_URL}${page.canonicalPath}`,
          lastModified: now
        }))
    ];
  }

  const gameUrls = games.map((game) => ({
    url: `${SITE_URL}/game/${game.id}-${game.slug}`,
    lastModified: game.releaseDate ? new Date(game.releaseDate) : now
  }));

  const genrePages = genreSlugs.map((genre) => ({
    url: `${SITE_URL}/genre/${genre}`,
    lastModified: now
  }));

  const platformPages = Object.keys(platforms).flatMap((platform) => [
    {
      url: `${SITE_URL}/platform/${platform}`,
      lastModified: now
    },
    {
      url: `${SITE_URL}/platform/${platform}/new`,
      lastModified: now
    },
    {
      url: `${SITE_URL}/platform/${platform}/upcoming`,
      lastModified: now
    },
    {
      url: `${SITE_URL}/platform/${platform}/top-rated`,
      lastModified: now
    }
  ]);

  const discoveryPages = [
    "/new-games",
    "/upcoming-games",
    "/games-releasing-today",
    "/games-releasing-this-week",
    "/games-releasing-this-month",
    "/releases",
    "/all-games",
    "/top-rated",
    "/hype",
    "/platforms",
    "/genres",
    "/upcoming-pc-games",
    "/upcoming-xbox-games"
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now
  }));

  const releaseMonthSet = new Set<string>();

  games.forEach((game) => {
    if (!game.releaseDate) {
      return;
    }

    const date = new Date(game.releaseDate);
    const year = date.getUTCFullYear();
    const monthSlug = monthNames[date.getUTCMonth()];

    releaseMonthSet.add(`${year}-${monthSlug}`);
  });

  const releasePages = Array.from(releaseMonthSet)
    .map((key) => {
      const [year, monthSlug] = key.split("-");
      const monthIndex = monthNames.indexOf(monthSlug);

      return {
        url: `${SITE_URL}/releases/${year}/${monthSlug}`,
        lastModified: new Date(Date.UTC(Number(year), monthIndex, 1))
      };
    })
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());



  return [
    {
      url: SITE_URL,
      lastModified: now
    },
    ...discoveryPages,
    ...platformPages,
    ...genrePages,
    ...releasePages,

// BEST GENRE PAGES
...bestPagesRegistry
  .filter((page) => page.type === "genre")
  .map((page) => ({
    url: `${SITE_URL}${page.canonicalPath}`,
    lastModified: now
  })),

// BEST YEAR PAGES
...bestPagesRegistry
  .filter((page) => page.type === "year")
  .map((page) => ({
    url: `${SITE_URL}${page.canonicalPath}`,
    lastModified: now
  })),

// BEST PLATFORM YEAR PAGES
...bestPagesRegistry
  .filter((page) => page.type === "platform-year")
  .map((page) => ({
    url: `${SITE_URL}${page.canonicalPath}`,
    lastModified: now
  })),

// BEST GENRE PLATFORM YEAR PAGES
...bestPagesRegistry
  .filter((page) => page.type === "genre-platform-year")
  .map((page) => ({
    url: `${SITE_URL}${page.canonicalPath}`,
    lastModified: now
  })),

...Object.keys(platforms)
  .filter((platform) => platform !== "ios" && platform !== "android")
  .flatMap((platform) =>
    Object.keys(genres).map((genre) => ({
      url: `${SITE_URL}/platform/${platform}/${genre}`,
      lastModified: now
    }))
  ),

...gameUrls
  ];
}