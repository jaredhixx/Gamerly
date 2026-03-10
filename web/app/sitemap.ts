import { MetadataRoute } from "next";
import { fetchGames } from "../lib/igdb";
import { SITE_URL } from "../lib/site";
import { platforms } from "../lib/platforms";

const PAGE_SIZE = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const now = new Date();

  const games = await fetchGames();

const gameUrls = games.map((game) => ({
  url: `${SITE_URL}/game/${game.id}-${game.slug}`,
  lastModified: game.releaseDate ? new Date(game.releaseDate) : new Date()
}));

  const genreSlugs = [
    "rpg",
    "shooter",
    "adventure",
    "strategy",
    "simulation",
    "puzzle",
    "indie",
    "fighting",
    "racing",
    "sport"
  ];

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
  "/upcoming-pc-games",
  "/upcoming-xbox-games"
].map((path) => ({
  url: `${SITE_URL}${path}`,
  lastModified: now
}));

  const releasePages = [
    { year: "2025", month: "december" },
    { year: "2026", month: "january" },
    { year: "2026", month: "february" },
    { year: "2026", month: "march" },
    { year: "2026", month: "april" },
    { year: "2026", month: "may" },
    { year: "2026", month: "june" },
    { year: "2026", month: "july" },
    { year: "2026", month: "august" },
    { year: "2026", month: "september" },
    { year: "2026", month: "october" },
    { year: "2026", month: "november" },
    { year: "2026", month: "december" }
  ].map((p) => ({
    url: `${SITE_URL}/releases/${p.year}/${p.month}`,
    lastModified: now
  }));

  // Generate genre pagination pages

  const genrePaginationPages = genreSlugs.flatMap((genre) => {

    const filtered = games.filter((g: any) =>
      g.genres?.some((gen: string) =>
        gen.toLowerCase().includes(genre)
      )
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: totalPages - 1 }, (_, i) => ({
  url: `${SITE_URL}/genre/${genre}/page/${i + 2}`,
  lastModified: now
}));
  });

  // Generate platform pagination pages

  const platformPaginationPages = Object.keys(platforms).flatMap((platform) => {

    const filtered = games.filter((g: any) =>
      g.platforms?.some((p: string) =>
        p.toLowerCase().includes(platform)
      )
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return Array.from({ length: totalPages - 1 }, (_, i) => ({
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