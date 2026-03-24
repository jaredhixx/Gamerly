import { MetadataRoute } from "next";
import { fetchGames } from "../lib/igdb";
import { SITE_URL } from "../lib/site";
import { platforms } from "../lib/platforms";
import { genres } from "../lib/genres";

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
  const games = await fetchGames();

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

  const genrePaginationPages = genreSlugs.flatMap((genre) => {
    const filtered = games.filter((game: any) =>
      game.genreSlugs?.includes(genre as any)
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
      url: `${SITE_URL}/genre/${genre}/page/${index + 2}`,
      lastModified: now
    }));
  });

  const platformPaginationPages = Object.keys(platforms).flatMap((platform) => {
    const filtered = games.filter((game: any) =>
      game.platformSlugs?.includes(platform as any)
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
      url: `${SITE_URL}/platform/${platform}/page/${index + 2}`,
      lastModified: now
    }));
  });

  const allGamesTotalPages = Math.ceil(games.length / PAGE_SIZE);

  const allGamesPaginationPages = Array.from(
    { length: Math.max(allGamesTotalPages - 1, 0) },
    (_, index) => ({
      url: `${SITE_URL}/all-games/page/${index + 2}`,
      lastModified: now
    })
  );

  const newGames = games.filter((game) => isPast(game.releaseDate));
  const recentNewGamesCount = getRecentNewGamesCount(newGames);
  const newGamesTotalPages = Math.ceil(recentNewGamesCount / PAGE_SIZE);

  const newGamesPaginationPages = Array.from(
    { length: Math.max(newGamesTotalPages - 1, 0) },
    (_, index) => ({
      url: `${SITE_URL}/new-games/page/${index + 2}`,
      lastModified: now
    })
  );

  const upcomingGames = games.filter((game) => isFuture(game.releaseDate));
  const upcomingGamesTotalPages = Math.ceil(upcomingGames.length / PAGE_SIZE);

  const upcomingGamesPaginationPages = Array.from(
    { length: Math.max(upcomingGamesTotalPages - 1, 0) },
    (_, index) => ({
      url: `${SITE_URL}/upcoming-games/page/${index + 2}`,
      lastModified: now
    })
  );

  return [
    {
      url: SITE_URL,
      lastModified: now
    },
    ...discoveryPages,
    ...platformPages,
    ...genrePages,
    ...releasePages,
    ...genrePaginationPages,
    ...platformPaginationPages,
    ...allGamesPaginationPages,
    ...newGamesPaginationPages,
...upcomingGamesPaginationPages,

{
  url: `${SITE_URL}/platform/pc/rpg`,
  lastModified: now
},
{
  url: `${SITE_URL}/platform/pc/shooter`,
  lastModified: now
},
{
  url: `${SITE_URL}/platform/pc/strategy`,
  lastModified: now
},
{
  url: `${SITE_URL}/platform/pc/adventure`,
  lastModified: now
},
{
  url: `${SITE_URL}/platform/pc/indie`,
  lastModified: now
},
{
  url: `${SITE_URL}/platform/pc/simulation`,
  lastModified: now
},

...gameUrls
  ];
}