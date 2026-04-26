import { Metadata } from "next";
import Link from "next/link";
import { getGameById, fetchGames } from "../../../lib/igdb";
import { redirect, notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import GameGrid from "../../../components/game/GameGrid";
import GameCarousel from "../../../components/game/GameCarousel";
import ScreenshotLightbox from "../../../components/game/ScreenshotLightbox";
import ExpandableSummary from "../../../components/game/ExpandableSummary";
import { getBestPageBySlug } from "../../../lib/best-pages-registry";


function formatReleaseDateForDisplay(game: {
  releaseDate: string | null;
  releaseDateDisplay?: string | null;
}) {
  if (game.releaseDateDisplay) {
    return game.releaseDateDisplay;
  }

  if (!game.releaseDate) {
    return null;
  }

  const date = new Date(game.releaseDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export const revalidate = 3600;

function isReleasedGame(game: { releaseDate?: string | null }) {
  if (!game.releaseDate) {
    return false;
  }

  const releaseDate = new Date(game.releaseDate);

  if (Number.isNaN(releaseDate.getTime())) {
    return false;
  }

  return releaseDate.getTime() <= Date.now();
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

function getReleaseYear(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getUTCFullYear();
}

function getSharedValuesCount(
  left?: string[] | null,
  right?: string[] | null
) {
  if (!left || !right || left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  let count = 0;

  for (const value of left) {
    if (rightSet.has(value)) {
      count += 1;
    }
  }

  return count;
}

function getGenreRelatedScore(
  currentGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  },
  candidateGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  }
) {
  let score = 0;

  const sharedGenres = getSharedValuesCount(
    currentGame.genres,
    candidateGame.genres
  );
  const sharedPlatforms = getSharedValuesCount(
    currentGame.platforms,
    candidateGame.platforms
  );

  score += sharedGenres * 10;
  score += sharedPlatforms * 3;

  if (
    currentGame.platforms &&
    currentGame.platforms.length > 0 &&
    candidateGame.platforms &&
    candidateGame.platforms.includes(currentGame.platforms[0])
  ) {
    score += 4;
  }

  const currentYear = getReleaseYear(currentGame.releaseDate);
  const candidateYear = getReleaseYear(candidateGame.releaseDate);

  if (currentYear !== null && candidateYear !== null) {
    const yearDifference = Math.abs(currentYear - candidateYear);

    if (yearDifference === 0) {
      score += 4;
    } else if (yearDifference === 1) {
      score += 3;
    } else if (yearDifference === 2) {
      score += 2;
    } else if (yearDifference <= 4) {
      score += 1;
    }
  }

  if (
    typeof candidateGame.aggregated_rating === "number" &&
    candidateGame.aggregated_rating >= 75
  ) {
    score += 2;
  }

  if (
    typeof candidateGame.aggregated_rating_count === "number" &&
    candidateGame.aggregated_rating_count >= 20
  ) {
    score += 1;
  }

  return score;
}

function getPlatformRelatedScore(
  currentGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  },
  candidateGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  }
) {
  let score = 0;

  const sharedPlatforms = getSharedValuesCount(
    currentGame.platforms,
    candidateGame.platforms
  );
  const sharedGenres = getSharedValuesCount(
    currentGame.genres,
    candidateGame.genres
  );

  score += sharedPlatforms * 10;
  score += sharedGenres * 4;

  if (
    currentGame.genres &&
    currentGame.genres.length > 0 &&
    candidateGame.genres &&
    candidateGame.genres.includes(currentGame.genres[0])
  ) {
    score += 4;
  }

  const currentYear = getReleaseYear(currentGame.releaseDate);
  const candidateYear = getReleaseYear(candidateGame.releaseDate);

  if (currentYear !== null && candidateYear !== null) {
    const yearDifference = Math.abs(currentYear - candidateYear);

    if (yearDifference === 0) {
      score += 4;
    } else if (yearDifference === 1) {
      score += 3;
    } else if (yearDifference === 2) {
      score += 2;
    } else if (yearDifference <= 4) {
      score += 1;
    }
  }

  if (
    typeof candidateGame.aggregated_rating === "number" &&
    candidateGame.aggregated_rating >= 75
  ) {
    score += 2;
  }

  if (
    typeof candidateGame.aggregated_rating_count === "number" &&
    candidateGame.aggregated_rating_count >= 20
  ) {
    score += 1;
  }

  return score;
}

function getMoreLikeThisScore(
  currentGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  },
  candidateGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  }
) {
  let score = 0;

  score += getGenreRelatedScore(currentGame, candidateGame);
  score += getPlatformRelatedScore(currentGame, candidateGame);

  const sharedGenres = getSharedValuesCount(
    currentGame.genres,
    candidateGame.genres
  );
  const sharedPlatforms = getSharedValuesCount(
    currentGame.platforms,
    candidateGame.platforms
  );

  if (sharedGenres > 0 && sharedPlatforms > 0) {
    score += 8;
  }

  if (
    typeof candidateGame.aggregated_rating === "number" &&
    candidateGame.aggregated_rating >= 80
  ) {
    score += 2;
  }

  if (
    typeof candidateGame.aggregated_rating_count === "number" &&
    candidateGame.aggregated_rating_count >= 50
  ) {
    score += 2;
  }

  return score;
}

function compareRelatedGames(
  currentGame: {
    genres?: string[] | null;
    platforms?: string[] | null;
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
  },
  leftGame: {
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
    name: string;
  },
  rightGame: {
    releaseDate?: string | null;
    aggregated_rating?: number | null;
    aggregated_rating_count?: number | null;
    name: string;
  },
  getScore: (
    currentGame: {
      genres?: string[] | null;
      platforms?: string[] | null;
      releaseDate?: string | null;
      aggregated_rating?: number | null;
      aggregated_rating_count?: number | null;
    },
    candidateGame: {
      genres?: string[] | null;
      platforms?: string[] | null;
      releaseDate?: string | null;
      aggregated_rating?: number | null;
      aggregated_rating_count?: number | null;
    }
  ) => number
) {
  const rightScore = getScore(currentGame, rightGame);
  const leftScore = getScore(currentGame, leftGame);

  if (rightScore !== leftScore) {
    return rightScore - leftScore;
  }

  const rightRating =
    typeof rightGame.aggregated_rating === "number"
      ? rightGame.aggregated_rating
      : -1;
  const leftRating =
    typeof leftGame.aggregated_rating === "number"
      ? leftGame.aggregated_rating
      : -1;

  if (rightRating !== leftRating) {
    return rightRating - leftRating;
  }

  const rightRelease = rightGame.releaseDate
    ? new Date(rightGame.releaseDate).getTime()
    : 0;
  const leftRelease = leftGame.releaseDate
    ? new Date(leftGame.releaseDate).getTime()
    : 0;

  if (rightRelease !== leftRelease) {
    return rightRelease - leftRelease;
  }

  return leftGame.name.localeCompare(rightGame.name);
}

function getPlatformHrefFromSlug(platformSlug?: string | null) {
  if (!platformSlug) {
    return null;
  }

  return `/platform/${platformSlug}`;
}

function getGenreHrefFromSlug(genreSlug?: string | null) {
  if (!genreSlug) {
    return null;
  }

  return `/genre/${genreSlug}`;
}

function getPlatformHref(platform: string) {
  const value = platform.toLowerCase();

  if (value.includes("pc") || value.includes("windows")) {
    return "/platform/pc";
  }

  if (value.includes("playstation")) {
    return "/platform/playstation";
  }

  if (value.includes("xbox")) {
    return "/platform/xbox";
  }

  if (value.includes("switch") || value.includes("nintendo")) {
    return "/platform/switch";
  }

  if (value.includes("ios") || value.includes("iphone") || value.includes("ipad")) {
    return "/platform/ios";
  }

  if (value.includes("android")) {
    return "/platform/android";
  }

  return null;
}

function getGenreHref(genre: string) {
  const value = genre.toLowerCase();

  if (value.includes("rpg") || value.includes("role-playing")) {
    return "/genre/rpg";
  }

  if (value.includes("shooter")) {
    return "/genre/shooter";
  }

  if (value.includes("adventure")) {
    return "/genre/adventure";
  }

  if (value.includes("strategy")) {
    return "/genre/strategy";
  }

  if (value.includes("simulation")) {
    return "/genre/simulation";
  }

  if (value.includes("puzzle")) {
    return "/genre/puzzle";
  }

  if (value.includes("indie")) {
    return "/genre/indie";
  }

  if (value.includes("fighting")) {
    return "/genre/fighting";
  }

  if (value.includes("racing")) {
    return "/genre/racing";
  }

  if (value.includes("sport")) {
    return "/genre/sport";
  }

  return null;
}

function getPrimaryPlatform(game: {
  platforms?: string[] | null;
}) {
  if (!game.platforms || game.platforms.length === 0) {
    return null;
  }

  const priorityOrder = [
    "pc",
    "playstation",
    "xbox",
    "switch",
    "ios",
    "android"
  ];

  const normalizedPlatforms = game.platforms.map((platform) =>
    platform.toLowerCase()
  );

  for (const priority of priorityOrder) {
    const matchIndex = normalizedPlatforms.findIndex((platform) => {
      if (priority === "pc") {
        return platform.includes("pc") || platform.includes("windows");
      }

      if (priority === "switch") {
        return platform.includes("switch") || platform.includes("nintendo");
      }

      return platform.includes(priority);
    });

    if (matchIndex !== -1) {
      return game.platforms[matchIndex];
    }
  }

  return game.platforms[0];
}

function getPrimaryPlatformSlug(game: {
  platforms?: string[] | null;
  platformSlugs?: string[] | null;
}) {
  if (
    !game.platforms ||
    !game.platformSlugs ||
    game.platforms.length === 0 ||
    game.platformSlugs.length === 0
  ) {
    return null;
  }

  const priorityOrder = [
    "pc",
    "playstation",
    "xbox",
    "switch",
    "ios",
    "android"
  ];

  const normalizedPlatforms = game.platforms.map((platform) =>
    platform.toLowerCase()
  );

  for (const priority of priorityOrder) {
    const matchIndex = normalizedPlatforms.findIndex((platform) => {
      if (priority === "pc") {
        return platform.includes("pc") || platform.includes("windows");
      }

      if (priority === "switch") {
        return platform.includes("switch") || platform.includes("nintendo");
      }

      return platform.includes(priority);
    });

    if (matchIndex !== -1) {
      return game.platformSlugs[matchIndex] || null;
    }
  }

  return game.platformSlugs[0] || null;
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const slugParam = params?.game;

  if (!slugParam) {
    return { title: "Game Not Found" };
  }

  const slugParts = slugParam.split("-");
  const id = Number(slugParts[0]);

  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

const correctSlug = `${game.id}-${game.slug}`;

if (slugParam !== correctSlug) {
  redirect(`/game/${correctSlug}`);
}

  if (!game) {
    return { title: "Game Not Found" };
  }

const primaryPlatform = getPrimaryPlatform(game);
const primaryGenre = game.genres?.[0];

const releaseYear = game.releaseDate
  ? new Date(game.releaseDate).getUTCFullYear()
  : null;

const seoTitle = isHighSignalGame(game)
  ? `${game.name}${releaseYear ? ` (${releaseYear})` : ""} – Is It Worth Playing? ${primaryPlatform ? `${primaryPlatform} Review & Verdict` : "Review & Verdict"}`
  : `${game.name}${releaseYear ? ` (${releaseYear})` : ""} – Release Date, Platforms, Gameplay & Details`;

const seoDescription = isHighSignalGame(game)
  ? [
      `Is ${game.name}${releaseYear ? ` (${releaseYear})` : ""} actually worth playing?`,
      typeof game.aggregated_rating === "number"
        ? `It currently has a ${Math.round(game.aggregated_rating)}/100 rating.`
        : null,
      primaryPlatform ? `See how it plays on ${primaryPlatform}.` : null,
      `Quickly decide if it fits your playstyle, or find better games instead.`
    ]
      .filter(Boolean)
      .join(" ")
  : [
      `Planning to play ${game.name}${releaseYear ? ` (${releaseYear})` : ""}?`,
      game.releaseDate
        ? `See the release date, platforms, trailer, and everything you need before launch.`
        : `See platforms, trailer, screenshots, and early details.`,
      `Find out if it is worth following before it releases.`
    ]
      .filter(Boolean)
      .join(" ");

const pageSeoTitle = isHighSignalGame(game)
  ? `${game.name}${releaseYear ? ` (${releaseYear})` : ""} - Review, Rating & Should You Play It?`
  : `${game.name}${releaseYear ? ` (${releaseYear})` : ""} - Release Date, Platforms, Trailer & Gameplay`;

const pageSeoDescription = isHighSignalGame(game)
  ? [
      `See whether ${game.name}${releaseYear ? ` (${releaseYear})` : ""} is worth playing.`,
      typeof game.aggregated_rating === "number"
        ? `Check the ${Math.round(game.aggregated_rating)}/100 rating,`
        : `Check the review picture,`,
      `release details, platforms, trailer, screenshots, and similar games to make a faster call.`
    ]
      .filter(Boolean)
      .join(" ")
  : [
      `Track ${game.name}${releaseYear ? ` (${releaseYear})` : ""} before launch.`,
      game.releaseDate
        ? `See the release date, platforms, trailer, screenshots, and early gameplay details.`
        : `See the platforms, trailer, screenshots, and early gameplay details available so far.`,
      `Find out if it deserves a spot on your radar.`
    ]
      .filter(Boolean)
      .join(" ");

return {
  title: pageSeoTitle,
  description: pageSeoDescription,
  alternates: {
    canonical: buildCanonicalUrl(`/game/${id}-${game.slug}`)
  }
};
}

export default async function GamePage(props: any) {
  const params = await props.params;

  const slugParam = params?.game;

  if (!slugParam) {
    notFound();
  }

  const slugParts = slugParam.split("-");
  const id = Number(slugParts[0]);

  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

  const allGames = await fetchGames();

  const gameWithModes = game as typeof game & {
    game_modes?: string[] | null;
    multiplayer_modes?:
      | Array<{
          onlinecoop?: boolean | null;
          onlinecoopmax?: number | null;
          offlinecoop?: boolean | null;
          offlinecoopmax?: number | null;
        }>
      | null;
  };

  const relatedCandidates = allGames.filter(
    (g) =>
      g.id !== game.id &&
      isHighSignalGame(g) &&
      (
        (g.genres &&
          game.genres &&
          g.genres.some((genre: string) => game.genres.includes(genre))) ||
        (g.platforms &&
          game.platforms &&
          g.platforms.some((platform: string) => game.platforms.includes(platform)))
      )
  );

  const moreLikeThisGames = relatedCandidates
    .sort((leftGame, rightGame) =>
      compareRelatedGames(game, leftGame, rightGame, getMoreLikeThisScore)
    )
    .slice(0, 8);

  const moreLikeThisIds = new Set(moreLikeThisGames.map((g) => g.id));

  const relatedGenreGames = relatedCandidates
    .filter(
      (g) =>
        !moreLikeThisIds.has(g.id) &&
        g.genres &&
        g.genres.some((genre: string) => game.genres?.includes(genre))
    )
    .sort((leftGame, rightGame) =>
      compareRelatedGames(game, leftGame, rightGame, getGenreRelatedScore)
    )
    .slice(0, 8);

  const relatedGenreIds = new Set(relatedGenreGames.map((g) => g.id));

  const relatedPlatformGames = relatedCandidates
    .filter(
      (g) =>
        !moreLikeThisIds.has(g.id) &&
        !relatedGenreIds.has(g.id) &&
        g.platforms &&
        game.platforms &&
        g.platforms.some((platform: string) => game.platforms.includes(platform))
    )
    .sort((leftGame, rightGame) =>
      compareRelatedGames(game, leftGame, rightGame, getPlatformRelatedScore)
    )
    .slice(0, 8);

  const heroQuickLinkYear = game.releaseDate
    ? new Date(game.releaseDate).getUTCFullYear()
    : null;

  const primaryPlatformSlug = getPrimaryPlatformSlug(game);

  const heroQuickLinkSlug =
    primaryPlatformSlug && heroQuickLinkYear
      ? `best-${primaryPlatformSlug}-games-${heroQuickLinkYear}`
      : null;

  const heroQuickLinkPage =
    heroQuickLinkSlug ? getBestPageBySlug(heroQuickLinkSlug) : null;

const yearQuickLinkSlug =
  heroQuickLinkYear ? `best-games-${heroQuickLinkYear}` : null;

const yearQuickLinkPage =
  yearQuickLinkSlug ? getBestPageBySlug(yearQuickLinkSlug) : null;

  const genrePlatformQuickLinkSlug =
    game.genreSlugs?.[0] && primaryPlatformSlug && heroQuickLinkYear
      ? `best-${game.genreSlugs[0]}-games-${primaryPlatformSlug}-${heroQuickLinkYear}`
      : null;

  const genrePlatformQuickLinkPage =
    genrePlatformQuickLinkSlug
      ? getBestPageBySlug(genrePlatformQuickLinkSlug)
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: game.name,
            url: buildCanonicalUrl(`/game/${game.id}-${game.slug}`),
            description:
              game.summary ||
              `${game.name} game details, release date, platforms, screenshots, trailer, and related games.`,
            datePublished: game.releaseDate || undefined,
            image: game.coverUrl ? [game.coverUrl] : undefined,
            genre: game.genres && game.genres.length > 0 ? game.genres : undefined,
            gamePlatform:
              game.platforms && game.platforms.length > 0 ? game.platforms : undefined,
            publisher: {
              "@type": "Organization",
              name: "Gamerly"
            },
            aggregateRating:
              typeof game.aggregated_rating === "number" &&
              typeof game.aggregated_rating_count === "number" &&
              game.aggregated_rating_count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Number(game.aggregated_rating.toFixed(1)),
                    ratingCount: game.aggregated_rating_count,
                    bestRating: 100,
                    worstRating: 0
                  }
                : undefined
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: buildCanonicalUrl("/")
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "New Games",
                item: buildCanonicalUrl("/new-games")
              },
              {
                "@type": "ListItem",
                position: 3,
                name: game.name,
                item: buildCanonicalUrl(`/game/${game.id}-${game.slug}`)
              }
            ]
          })
        }}
      />

<main className="gamePage">
<h1 className="gameTitle">
  {game.name}
  <span className="gameTitleSub">
    {" "}
    –{" "}
{isHighSignalGame(game)
  ? "Review, Rating & Should You Play It?"
  : "Release Date, Platforms, Trailer & Gameplay"}
  </span>
</h1>

<p className="gameSnippetIntro">
  {(() => {
    const releaseYear = game.releaseDate
      ? new Date(game.releaseDate).getUTCFullYear()
      : null;

    const rating =
      typeof game.aggregated_rating === "number"
        ? Math.round(game.aggregated_rating)
        : null;

    if (isReleasedGame(game)) {
return `Trying to decide whether ${game.name}${
  releaseYear ? ` (${releaseYear})` : ""
} is worth playing? ${
  rating ? `It currently has a ${rating}/100 rating. ` : ""
}See the release details, supported platforms, trailer, gameplay snapshot, and who it is best for so you can make a faster call.`;
    }

return `Following ${game.name}${
  releaseYear ? ` (${releaseYear})` : ""
}? ${
  game.releaseDate
    ? `The current release date is ${formatReleaseDateForDisplay(game)}. `
    : "A release date has not been confirmed yet. "
}Check the platforms, trailer, screenshots, and early gameplay details to see whether it deserves a spot on your radar.`;
  })()}
</p>

<div className="gameHeroShell">
  <div
    className="gameHero"
  >

    {game.coverUrl && (
<img
  src={game.coverUrl?.replace("t_cover_big", "t_cover_small")}
  alt={game.name}
  className="gameCover"
/>
    )}

<div className="gameHeroInfo">
<div className="gameMeta">
  <span className="gameMetaLabel">Release date</span>
  <span className="gameMetaValue">
    {(() => {
      const formattedReleaseDate = formatReleaseDateForDisplay(game);

      if (!formattedReleaseDate || !game.releaseDate) {
        return "Release date TBA";
      }

      const releaseTime = new Date(game.releaseDate).getTime();
      const now = Date.now();

      if (releaseTime <= now) {
        return `Released on ${formattedReleaseDate}`;
      }

      return `Releases on ${formattedReleaseDate}`;
    })()}
  </span>
</div>

  <div className="gamePills">
    {game.platforms
      ?.filter((platform: string, index: number) => {
        const platformSlug = game.platformSlugs?.[index]?.toLowerCase() || "";
        const platformName = platform.toLowerCase();

        const isSupportedPlatform =
          platformSlug === "pc" ||
          platformSlug === "playstation" ||
          platformSlug === "xbox" ||
          platformSlug === "switch" ||
          platformSlug === "ios" ||
          platformSlug === "android" ||
          platformName.includes("pc") ||
          platformName.includes("windows") ||
          platformName.includes("playstation") ||
          platformName.includes("xbox") ||
          platformName.includes("switch") ||
          platformName.includes("nintendo") ||
          platformName.includes("ios") ||
          platformName.includes("iphone") ||
          platformName.includes("ipad") ||
          platformName.includes("android");

        return isSupportedPlatform;
      })
      .slice(0, 3)
      .map((platform: string) => {
        const href = getPlatformHref(platform);

        if (!href) {
          return (
            <span key={platform} className="gamePill">
              {platform}
            </span>
          );
        }

        return (
          <Link key={platform} href={href} className="gamePill">
            {platform}
          </Link>
        );
      })}

    {game.genres?.slice(0, 2).map((genre: string, index: number) => {
      const genreSlug = game.genreSlugs?.[index];
      const href =
        getGenreHrefFromSlug(genreSlug) || getGenreHref(genre);

      if (!href) {
        return (
          <span key={genre} className="gamePill">
            {genre}
          </span>
        );
      }

      return (
        <Link key={genre} href={href} className="gamePill">
          {genre}
        </Link>
      );
    })}

    {gameWithModes.game_modes?.includes("Single player") && (
      <span className="gamePill">Single Player</span>
    )}

    {gameWithModes.game_modes?.includes("Multiplayer") && (
      <span className="gamePill">Multiplayer</span>
    )}

    {gameWithModes.game_modes?.some((mode) =>
      mode.toLowerCase().includes("coop")
    ) && (
      <span className="gamePill">Co-op</span>
    )}

    {gameWithModes.multiplayer_modes?.some(
      (mode) => mode.onlinecoop || mode.onlinecoopmax
    ) && (
      <span className="gamePill">Online Play</span>
    )}

    {gameWithModes.multiplayer_modes?.some(
      (mode) => mode.offlinecoop || mode.offlinecoopmax
    ) && (
      <span className="gamePill">Local Play</span>
    )}
  </div>

  <div className="gameHeroDecisionCard">
    <div className="gameHeroDecisionRow">
      <span className="gameHeroDecisionLabel">Status</span>
<span className="gameHeroDecisionValue">
  {(() => {
    if (!game.releaseDate) {
      return "Release date unknown";
    }

    const releaseTime = new Date(game.releaseDate).getTime();
    const now = Date.now();

    const daysDifference = Math.floor(
      (releaseTime - now) / (1000 * 60 * 60 * 24)
    );

    if (releaseTime <= now) {
      const daysSinceRelease = Math.floor(
        (now - releaseTime) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceRelease <= 30) {
        return "Released (Recent)";
      }

      return "Released";
    }

    if (daysDifference <= 30) {
      return "Releasing Soon";
    }

    return "Upcoming";
  })()}
</span>
    </div>

    <div className="gameHeroDecisionRow">
      <span className="gameHeroDecisionLabel">Best for</span>
<span className="gameHeroDecisionValue">
{game.genres?.[0] && game.platforms?.[0]
  ? (() => {
      const genre = game.genres[0];
      const platform = getPrimaryPlatform(game);

      const rating = game.aggregated_rating;
      const ratingCount = game.aggregated_rating_count;

      if (
        typeof rating === "number" &&
        typeof ratingCount === "number" &&
        rating >= 80 &&
        ratingCount >= 20
      ) {
        return `Players who want one of the stronger ${genre.toLowerCase()} options on ${platform}`;
      }

      if (
        typeof rating === "number" &&
        rating >= 70
      ) {
        return `Players interested in a promising ${genre.toLowerCase()} game on ${platform}`;
      }

      return `Players curious about ${genre.toLowerCase()} games on ${platform}`;
    })()
  : "Players looking for something new"}
</span>
    </div>

    <div className="gameHeroDecisionRow">
      <span className="gameHeroDecisionLabel">Rating</span>
<span className="gameHeroDecisionValue">
  {typeof game.aggregated_rating === "number"
    ? game.aggregated_rating >= 85
      ? `${Math.round(game.aggregated_rating)} / 100 (Excellent)`
      : game.aggregated_rating >= 75
      ? `${Math.round(game.aggregated_rating)} / 100 (Strong)`
      : game.aggregated_rating >= 65
      ? `${Math.round(game.aggregated_rating)} / 100 (Decent)`
      : `${Math.round(game.aggregated_rating)} / 100 (Mixed)`
    : "No rating yet"}
</span>
    </div>

<div className="gameHeroDecisionRow">
  <span className="gameHeroDecisionLabel">Early reception</span>
  <span
    className={`gameHeroDecisionValue ${
      typeof game.aggregated_rating === "number"
        ? game.aggregated_rating >= 80 &&
          typeof game.aggregated_rating_count === "number" &&
          game.aggregated_rating_count >= 20
          ? "signal-strong"
          : game.aggregated_rating >= 70
          ? "signal-moderate"
          : "signal-weak"
        : "signal-unknown"
    }`}
  >
{typeof game.aggregated_rating === "number"
  ? game.aggregated_rating >= 80 &&
    typeof game.aggregated_rating_count === "number" &&
    game.aggregated_rating_count >= 20
    ? "Strong early reception"
    : game.aggregated_rating >= 70 &&
      typeof game.aggregated_rating_count === "number" &&
      game.aggregated_rating_count >= 20
    ? "Solid early reception"
    : game.aggregated_rating >= 70
    ? "Promising first impression"
    : "Mixed early reception"
  : "Too early to judge"}
  </span>
</div>
  </div>
</div>
  </div>

<div
  style={{
    maxWidth: "760px",
    margin: "24px auto 32px auto",
    padding: "18px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    textAlign: "center"
  }}
>
  <h3
    style={{
      margin: 0,
      fontSize: "1.125rem",
      lineHeight: 1.35,
      fontWeight: 700,
      color: "#fff"
    }}
  >
    Not sure this is the right game?
  </h3>

  <p
    style={{
      maxWidth: "620px",
      margin: "6px auto 0 auto",
      fontSize: "0.95rem",
      lineHeight: 1.5,
      color: "rgba(255, 255, 255, 0.68)"
    }}
  >
    Compare stronger picks before you decide.
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      marginTop: "14px"
    }}
  >
    {yearQuickLinkPage && yearQuickLinkSlug && heroQuickLinkYear && (
      <Link href={`/${yearQuickLinkSlug}`} className="heroQuickLinkPill">
        Best games of {heroQuickLinkYear}
      </Link>
    )}

    {genrePlatformQuickLinkPage &&
      genrePlatformQuickLinkSlug &&
      game.genres?.[0] &&
      heroQuickLinkYear && (
        <Link
          href={`/${genrePlatformQuickLinkSlug}`}
          className="heroQuickLinkPill"
        >
          Best {game.genres[0]} games on {getPrimaryPlatform(game)} in {heroQuickLinkYear}
        </Link>
      )}

    {game.genreSlugs?.[0] && (
      <Link
        href={`/best-${game.genreSlugs[0]}-games`}
        className="heroQuickLinkPill"
      >
        Best {game.genres?.[0]} games
      </Link>
    )}
  </div>
</div>

{game.summary && (
  <section className="gameHeroSummaryBlock">
<h2 className="gameHeroSummaryHeading">
  Is {game.name} Worth Playing?
</h2>
    <ExpandableSummary summary={game.summary} />
  </section>
)}

<section className="gameSection" style={{ textAlign: "center" }}>
  <h2>About {game.name}</h2>

<p style={{ maxWidth: "700px", margin: "0 auto 16px auto" }}>
  {(() => {
    const isReleased = isReleasedGame(game);

    const releaseTime = game.releaseDate
      ? new Date(game.releaseDate).getTime()
      : null;

    const hasFutureReleaseDate =
      typeof releaseTime === "number" &&
      !Number.isNaN(releaseTime) &&
      releaseTime > Date.now();

    const rawGenre = game.genres?.[0] || "video";
    const genre = rawGenre.toLowerCase();

    const primaryPlatform = getPrimaryPlatform(game);
    const platformText =
      primaryPlatform && primaryPlatform !== "Unknown Platform"
        ? primaryPlatform
        : "supported platforms";

    const article = /^[aeiou]/i.test(genre) ? "an" : "a";

    if (isReleased) {
      return `${game.name} is ${article} ${genre} game available on ${platformText}. See its rating, gameplay details, similar games, and whether it is worth playing.`;
    }

    if (hasFutureReleaseDate) {
      return `${game.name} is an upcoming ${genre} game for ${platformText}. See its release date, platforms, gameplay details, similar games, and whether it is worth keeping on your radar.`;
    }

    return `${game.name} is ${article} ${genre} game listed for ${platformText}. See its available release details, platforms, gameplay details, similar games, and whether it is worth keeping on your radar.`;
  })()}
</p>
</section>

<section className="gameSection" style={{ textAlign: "center", marginBottom: "32px" }}>
  <h2>
    Find Better Games Than {game.name}
  </h2>

  <p style={{ maxWidth: "700px", margin: "0 auto 16px auto" }}>
    If {game.name} is not exactly what you are looking for, these pages show stronger games based on platform, genre, and overall rankings.
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      marginTop: "12px"
    }}
  >
    {yearQuickLinkPage && yearQuickLinkSlug && heroQuickLinkYear && (
      <Link href={`/${yearQuickLinkSlug}`} className="heroQuickLinkPill">
        Best games of {heroQuickLinkYear}
      </Link>
    )}

    {heroQuickLinkPage && heroQuickLinkSlug && heroQuickLinkYear && (
      <Link
        href={`/${heroQuickLinkSlug}`}
        className="heroQuickLinkPill"
      >
        Best {getPrimaryPlatform(game)} games of {heroQuickLinkYear}
      </Link>
    )}

    {genrePlatformQuickLinkPage &&
    genrePlatformQuickLinkSlug &&
    game.genres?.[0] &&
    heroQuickLinkYear ? (
      <Link
        href={`/${genrePlatformQuickLinkSlug}`}
        className="heroQuickLinkPill"
      >
        Best {game.genres[0]} games on {getPrimaryPlatform(game)} in {heroQuickLinkYear}
      </Link>
    ) : null}
  </div>
</section>

</div>

{game.trailer && (
  <section className="gameSection gameMediaSection">
    <h2>Trailer</h2>

    <div className="gameTrailer">
      <iframe
        src={game.trailer}
        title={`${game.name} trailer`}
        frameBorder="0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  </section>
)}

{game.screenshots && game.screenshots.length > 0 && (
  <section className="gameSection gameMediaSection">
    <h2>Screenshots</h2>

    <ScreenshotLightbox images={game.screenshots} />
  </section>
)}

{moreLikeThisGames.length > 0 && (
  <section className="gameSection">
    <h2>Games Like {game.name}</h2>

    <GameCarousel games={moreLikeThisGames} />
  </section>
)}

{game.genres && game.genres.length > 0 && (
  <section className="gameSection">
    <h2>Similar {game.genres[0]} Games</h2>

    <GameGrid games={relatedGenreGames} />

<div style={{ marginTop: "14px" }}>
  <Link
    href={
      game.genreSlugs?.[0]
        ? `/genre/${game.genreSlugs[0]}`
        : `/genre/${game.genres[0].toLowerCase()}`
    }
    className="browseAllLink"
  >
    Explore more {game.genres[0]} games →
  </Link>
</div>

          </section>
        )}

{game.platforms && game.platforms.length > 0 && (
  <section className="gameSection">
    <h2>
      {game.genres?.[0] && game.platforms?.[0]
                ? `More ${game.genres[0]} Games on ${getPrimaryPlatform(game)}`
        : `More Games Like ${game.name}`}
    </h2>

            <GameGrid games={relatedPlatformGames} />

<div style={{ marginTop: "14px" }}>
  <Link
    href={primaryPlatformSlug ? `/platform/${primaryPlatformSlug}` : "/platforms"}
    className="browseAllLink"
  >
    Explore more {getPrimaryPlatform(game)} games →
  </Link>
</div>

          </section>
        )}

<section className="gameSection discoverSection">
<h2>
  Better Games to Play Instead of {game.name}
  <span className="sectionSub">
    {" "}– Faster ways to find a better fit by platform, genre, or year
  </span>
</h2>
<p style={{ maxWidth: "700px", margin: "0 auto 16px auto", fontWeight: 500 }}>
  Still not convinced {game.name} is worth your time? Use these pages to quickly find stronger options based on platform, genre, and release year.
</p>

<div style={{ marginBottom: "16px", fontWeight: 500 }}>
  Start with one of these:
</div>

<ul>
  {yearQuickLinkPage && yearQuickLinkSlug && heroQuickLinkYear && (
    <li>
      <Link href={`/${yearQuickLinkSlug}`}>
        See the best games of {heroQuickLinkYear}
      </Link>
    </li>
  )}

  {heroQuickLinkPage && heroQuickLinkSlug && heroQuickLinkYear && (
    <li>
      <Link href={`/${heroQuickLinkSlug}`}>
        See the best {getPrimaryPlatform(game)} games of {heroQuickLinkYear}
      </Link>
    </li>
  )}

  {genrePlatformQuickLinkPage &&
  genrePlatformQuickLinkSlug &&
  game.genres?.[0] &&
  heroQuickLinkYear ? (
    <li>
      <Link href={`/${genrePlatformQuickLinkSlug}`}>
        Compare the best {game.genres[0]} games on {getPrimaryPlatform(game)} in {heroQuickLinkYear}
      </Link>
    </li>
  ) : null}

  <li>
    <Link href="/top-rated">
      See the highest-rated games right now
    </Link>
  </li>

  <li>
    <Link href="/new-games">
      Browse newly released games
    </Link>
  </li>

  <li>
    <Link href="/upcoming-games">
      Browse upcoming game releases
    </Link>
  </li>

  {primaryPlatformSlug && (
    <li>
      <Link href={`/platform/${primaryPlatformSlug}`}>
        Browse all {getPrimaryPlatform(game)} games
      </Link>
    </li>
  )}

  {game.genreSlugs?.[0] && (
    <li>
      <Link href={`/genre/${game.genreSlugs[0]}`}>
        Browse the best {game.genres?.[0]} games
      </Link>
    </li>
  )}
</ul>
</section>
      </main>
    </>
  );
}
