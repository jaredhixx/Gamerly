import { MetadataRoute } from "next";
import { fetchGames } from "../lib/igdb";
import { SITE_URL } from "../lib/site";
import { platforms } from "../lib/platforms";
import { genres } from "../lib/genres";

export const revalidate = 21600;

const PAGE_SIZE = 60;

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

  const platformPages = Object.keys(platforms).map((platform) => ({
    url: `${SITE_URL}/platform/${platform}`,
    lastModified: now
  }));

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
    if (!game.releaseDate) return;

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
    const filtered = games.filter((g: any) =>
      g.genreSlugs?.includes(genre as any)
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => ({
      url: `${SITE_URL}/genre/${genre}/page/${i + 2}`,
      lastModified: now
    }));
  });

  const platformPaginationPages = Object.keys(platforms).flatMap((platform) => {
    const filtered = games.filter((g: any) =>
      g.platformSlugs?.includes(platform as any)
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => ({
      url: `${SITE_URL}/platform/${platform}/page/${i + 2}`,
      lastModified: now
    }));
  });

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
    ...gameUrls
  ];
}