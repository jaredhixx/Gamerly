import { Metadata } from "next";
import Link from "next/link";
import { getGameById, fetchGames } from "../../../lib/igdb";
import { redirect, notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import GameGrid from "../../../components/game/GameGrid";
import GameCarousel from "../../../components/game/GameCarousel";
import ScreenshotLightbox from "../../../components/game/ScreenshotLightbox";
import ExpandableSummary from "../../../components/game/ExpandableSummary";


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

const primaryPlatform = game.platforms?.[0];
const primaryGenre = game.genres?.[0];

const releaseYear = game.releaseDate
  ? new Date(game.releaseDate).getUTCFullYear()
  : null;

const seoTitle = isReleasedGame(game)
  ? `${game.name}${releaseYear ? ` (${releaseYear})` : ""} Review${primaryPlatform ? ` – ${primaryPlatform}` : ""} | Worth Playing?`
  : `${game.name}${releaseYear ? ` (${releaseYear})` : ""} Release Date, Platforms & Details${primaryPlatform ? ` – ${primaryPlatform}` : ""}`;

const seoDescription = isReleasedGame(game)
  ? [
      `Thinking about ${game.name}${releaseYear ? ` (${releaseYear})` : ""}?`,
      typeof game.aggregated_rating === "number"
        ? `It currently holds a ${Math.round(game.aggregated_rating)}/100 rating.`
        : null,
      primaryPlatform ? `Best for ${primaryPlatform} players.` : null,
      `See if it is actually worth your time before you play.`,
      `Compare gameplay, ratings, and better alternatives in seconds.`
    ]
      .filter(Boolean)
      .join(" ")
  : [
      `Thinking about ${game.name}${releaseYear ? ` (${releaseYear})` : ""} before release?`,
      game.releaseDate
        ? `See the release date, platforms, trailer, screenshots, and key details in one place.`
        : `See the available platforms, trailer, screenshots, and key details in one place.`,
      primaryGenre ? `Good fit for players interested in ${primaryGenre.toLowerCase()} games.` : null
    ]
      .filter(Boolean)
      .join(" ");

return {
  title: seoTitle,
  description: seoDescription,
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
  const allGames = await fetchGames();

  if (!game) {
    notFound();
  }

  const relatedCandidates = allGames.filter(
    (g) =>
      g.id !== game.id &&
      isReleasedGame(g) &&
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
    {isReleasedGame(game)
      ? "Review, Rating & Gameplay"
      : "Release Info, Gameplay & Details"}
  </span>
</h1>

<p className="gameSnippetIntro">
  {(() => {
    const releaseYear = game.releaseDate
      ? new Date(game.releaseDate).getUTCFullYear()
      : null;

    const platform = game.platforms?.[0];
    const genre = game.genres?.[0];

    const rating =
      typeof game.aggregated_rating === "number"
        ? Math.round(game.aggregated_rating)
        : null;

    if (isReleasedGame(game)) {
      return `${game.name}${
        releaseYear ? ` (${releaseYear})` : ""
      } is a ${genre ? genre.toLowerCase() : "game"}${
        platform ? ` available on ${platform}` : ""
      }.${
        rating ? ` It currently holds a ${rating}/100 rating.` : ""
      } Find out if it is actually worth playing, who it is best for, and whether it deserves your time.`;
    }

    return `${game.name}${
      releaseYear ? ` (${releaseYear})` : ""
    } is an upcoming ${genre ? genre.toLowerCase() : "game"}${
      platform ? ` planned for ${platform}` : ""
    }.${
      game.releaseDate
        ? ` It is expected to release on ${formatReleaseDateForDisplay(game)}.`
        : ""
    } See if it is worth keeping on your radar, what type of players it will appeal to, and what to expect at launch.`;
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
        const platform = game.platforms[0];

        const rating = game.aggregated_rating;
        const ratingCount = game.aggregated_rating_count;

        if (
          typeof rating === "number" &&
          typeof ratingCount === "number" &&
          rating >= 80 &&
          ratingCount >= 20
        ) {
          return `${genre} players looking for highly rated games on ${platform}`;
        }

        if (
          typeof rating === "number" &&
          rating >= 70
        ) {
          return `${genre} players exploring solid games on ${platform}`;
        }

        return `${genre} players exploring games on ${platform}`;
      })()
    : "Players exploring new games"}
</span>
    </div>

    <div className="gameHeroDecisionRow">
      <span className="gameHeroDecisionLabel">Rating</span>
      <span className="gameHeroDecisionValue">
        {typeof game.aggregated_rating === "number"
          ? `${Math.round(game.aggregated_rating)} / 100`
          : "No rating yet"}
      </span>
    </div>

<div className="gameHeroDecisionRow">
  <span className="gameHeroDecisionLabel">Player signal</span>
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
        ? "Strong early signal"
        : game.aggregated_rating >= 70
        ? "Promising signal"
        : "Mixed signal"
      : "Signal still forming"}
  </span>
</div>
  </div>
</div>
  </div>

{(game.platformSlugs?.[0] && game.releaseDate) || game.genreSlugs?.[0] ? (
  <div className="heroQuickLinks">
    {game.platformSlugs?.[0] && game.releaseDate && (
      <Link
        href={`/best-${game.platformSlugs[0]}-games-${new Date(game.releaseDate).getUTCFullYear()}`}
        className="heroQuickLinkPill"
      >
        Best {game.platforms?.[0]} games of {new Date(game.releaseDate).getUTCFullYear()}
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
) : null}

{game.summary && (
  <section className="gameHeroSummaryBlock">
    <h2 className="gameHeroSummaryHeading">
      Should You Play {game.name}?
    </h2>
    <ExpandableSummary summary={game.summary} />
  </section>
)}

<section className="gameSection" style={{ textAlign: "center" }}>
  <h2>About {game.name}</h2>

  <p style={{ maxWidth: "700px", margin: "0 auto 16px auto" }}>
    Trying to decide if {game.name} is worth playing?{" "}
    {game.releaseDate
      ? `It ${new Date(game.releaseDate).getTime() <= Date.now() ? "released" : "is scheduled to release"} on ${formatReleaseDateForDisplay(game)}.`
      : "It does not yet have a confirmed release date."}{" "}
    {game.platforms && game.platforms.length > 0 ? (
      <>
        You can play it on{" "}
        {game.platformSlugs?.[0] ? (
          <Link
            href={`/platform/${game.platformSlugs[0]}`}
            className="inlineTextLink"
          >
            {game.platforms[0]}
          </Link>
        ) : (
          game.platforms[0]
        )}
        {game.platforms.length > 1
          ? ` and ${game.platforms.slice(1).join(", ")}.`
          : "."}{" "}
      </>
    ) : null}
    {game.genres && game.genres.length > 0 ? (
      <>
        It is a{" "}
        {game.genreSlugs?.[0] ? (
          <Link
            href={`/genre/${game.genreSlugs[0]}`}
            className="inlineTextLink"
          >
            {game.genres[0]}
          </Link>
        ) : (
          game.genres[0]
        )}
        {game.genres.length > 1
          ? ` game with ${game.genres.slice(1).join(", ")} elements.`
          : " game."}{" "}
      </>
    ) : null}
    {typeof game.aggregated_rating === "number"
? `It holds a ${Math.round(game.aggregated_rating)}/100 rating, giving a quick sense of how strongly it is landing with players and reviewers.`
      : `Use this page to quickly judge whether it looks worth your time based on its release timing, platforms, trailer, screenshots, and similar games.`}
  </p>
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
        ? `More ${game.genres[0]} Games on ${game.platforms[0]}`
        : `More Games Like ${game.name}`}
    </h2>

            <GameGrid games={relatedPlatformGames} />

<div style={{ marginTop: "14px" }}>
  <Link
    href={
      game.platformSlugs?.[0]
        ? `/platform/${game.platformSlugs[0]}`
        : `/platform/${game.platforms[0].toLowerCase()}`
    }
    className="browseAllLink"
  >
    Explore more {game.platforms[0]} games →
  </Link>
</div>

          </section>
        )}

<section className="gameSection discoverSection">
  <h2>
    What Should You Play Next?
    <span className="sectionSub">
      {" "}– Better Games to Try After {game.name}
    </span>
  </h2>

<p style={{ maxWidth: "700px", margin: "0 auto 16px auto", fontWeight: 500 }}>
  Not sure {game.name} is worth your time? Use these pages to quickly find better games based on platform, genre, and release year.
</p>

<div style={{ marginBottom: "16px", fontWeight: 500 }}>
  Compare better options:
</div>

<ul>
  <li><Link href="/top-rated">See the highest-rated games right now</Link></li>
  <li><Link href="/new-games">Browse newly released games</Link></li>
  <li><Link href="/upcoming-games">Browse upcoming game releases</Link></li>

  {game.releaseDate && (
    <li>
      <Link href={`/best-games-${new Date(game.releaseDate).getUTCFullYear()}`}>
        See the best video games of {new Date(game.releaseDate).getUTCFullYear()}
      </Link>
    </li>
  )}

  {game.platformSlugs?.[0] && game.releaseDate && (
    <li>
      <Link
        href={`/best-${game.platformSlugs[0]}-games-${new Date(game.releaseDate).getUTCFullYear()}`}
      >
        See the best {game.platforms?.[0]} games of {new Date(game.releaseDate).getUTCFullYear()}
      </Link>
    </li>
  )}

  {game.platformSlugs?.[0] && (
    <li>
<Link
  href={`/platform/${game.platformSlugs[0]}`}
>
        Browse all {game.platforms?.[0]} games
      </Link>
    </li>
  )}

  {game.genreSlugs?.[0] && (
    <li>
<Link
  href={`/genre/${game.genreSlugs[0]}`}
>
        Browse the best {game.genres?.[0]} games
      </Link>
    </li>
  )}

  {game.genreSlugs?.[0] && game.platformSlugs?.[0] && game.releaseDate && (
    <li>
      <Link
        href={`/best-${game.genreSlugs[0]}-games-${game.platformSlugs[0]}-${new Date(game.releaseDate).getUTCFullYear()}`}
      >
        Compare the best {game.genres?.[0]} games on {game.platforms?.[0]} in {new Date(game.releaseDate).getUTCFullYear()}
      </Link>
    </li>
  )}
</ul>
</section>
      </main>
    </>
  );
}