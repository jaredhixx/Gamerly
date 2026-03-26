import { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { platforms } from "../lib/platforms";
import { genres } from "../lib/genres";
import { bestPagesRegistry } from "../lib/best-pages-registry";

export const revalidate = 21600;

const genreSlugs = Object.keys(genres);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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

  const bestGenrePages = bestPagesRegistry
    .filter((page) => page.type === "genre")
    .map((page) => ({
      url: `${SITE_URL}${page.canonicalPath}`,
      lastModified: now
    }));

  const bestYearPages = bestPagesRegistry
    .filter((page) => page.type === "year")
    .map((page) => ({
      url: `${SITE_URL}${page.canonicalPath}`,
      lastModified: now
    }));

  const bestPlatformYearPages = bestPagesRegistry
    .filter((page) => page.type === "platform-year")
    .map((page) => ({
      url: `${SITE_URL}${page.canonicalPath}`,
      lastModified: now
    }));

  const bestGenrePlatformYearPages = bestPagesRegistry
    .filter((page) => page.type === "genre-platform-year")
    .map((page) => ({
      url: `${SITE_URL}${page.canonicalPath}`,
      lastModified: now
    }));

  const platformGenrePages = Object.keys(platforms)
    .filter((platform) => platform !== "ios" && platform !== "android")
    .flatMap((platform) =>
      Object.keys(genres).map((genre) => ({
        url: `${SITE_URL}/platform/${platform}/${genre}`,
        lastModified: now
      }))
    );

  return [
    {
      url: SITE_URL,
      lastModified: now
    },
    ...discoveryPages,
    ...platformPages,
    ...genrePages,
    ...bestGenrePages,
    ...bestYearPages,
    ...bestPlatformYearPages,
    ...bestGenrePlatformYearPages,
    ...platformGenrePages
  ];
}