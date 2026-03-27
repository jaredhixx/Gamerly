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

  return {
        title: `${game.name} Release Date & Platforms`,
    description:
      game.summary || `${game.name} game details and release info.`,
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

  const moreLikeThisGames = allGames
  .filter(
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
  )
  .sort((leftGame, rightGame) =>
    compareRelatedGames(game, leftGame, rightGame, getMoreLikeThisScore)
  )
  .slice(0, 8);

const moreLikeThisIds = new Set(moreLikeThisGames.map((g) => g.id));

const relatedGenreGames = allGames
  .filter(
    (g) =>
      g.id !== game.id &&
      !moreLikeThisIds.has(g.id) &&
      isReleasedGame(g) &&
      g.genres &&
      g.genres.some((genre: string) => game.genres?.includes(genre))
  )
  .sort((leftGame, rightGame) =>
    compareRelatedGames(game, leftGame, rightGame, getGenreRelatedScore)
  )
  .slice(0, 8);

const relatedGenreIds = new Set(relatedGenreGames.map((g) => g.id));

const relatedPlatformGames = allGames
  .filter(
    (g) =>
      g.id !== game.id &&
      !moreLikeThisIds.has(g.id) &&
      !relatedGenreIds.has(g.id) &&
      isReleasedGame(g) &&
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
            datePublished: game.releaseDate,
            image: game.coverUrl,
            gamePlatform: game.platforms,
            description: game.summary
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
          item: "https://www.gamerly.net"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Games",
          item: "https://www.gamerly.net/new-games"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: game.name,
          item: `https://www.gamerly.net/game/${game.id}-${game.slug}`
        }
      ]
    })
  }}
/>

<main className="gamePage">
<h1 className="gameTitle">
  {game.name}
</h1>

        <div
          className="gameHero"
        >

          {game.coverUrl && (
<img
  src={game.coverUrl}
  alt={game.name}
  className="gameCover"
/>
          )}

<div className="gameHeroInfo">
  <div className="gameMeta">
    Release Date: {formatReleaseDateForDisplay(game) ?? "TBA"}
  </div>

  <div className="gamePills">
    {game.platforms?.slice(0, 3).map((platform: string, index: number) => {
      const platformSlug = game.platformSlugs?.[index];
      const href =
        getPlatformHrefFromSlug(platformSlug) || getPlatformHref(platform);

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
        {game.releaseDate
          ? new Date(game.releaseDate) <= new Date()
            ? "Released"
            : "Upcoming"
          : "Release date unknown"}
      </span>
    </div>

    <div className="gameHeroDecisionRow">
      <span className="gameHeroDecisionLabel">Best for</span>
      <span className="gameHeroDecisionValue">
        {game.genres?.[0] && game.platforms?.[0]
          ? `${game.genres[0]} players on ${game.platforms[0]}`
          : "Players exploring new games"}
      </span>
    </div>


  </div>

  {game.summary && (
    <div className="gameHeroSummary">
      <ExpandableSummary summary={game.summary} />
    </div>
  )}
</div>
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
    <h2>More Like This</h2>

    <GameCarousel games={moreLikeThisGames} />
  </section>
)}

        {game.genres && game.genres.length > 0 && (
         <section className="gameSection">
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "20px"
              }}
            >
              More {game.genres[0]} Games
            </h2>

            <GameGrid games={relatedGenreGames} />

<div style={{ marginTop: "16px" }}>
<Link
  href={
    getGenreHrefFromSlug(game.genreSlugs?.[0]) ||
    getGenreHref(game.genres[0]) ||
    "/genres"
  }
  className="sectionMoreLink"
>
  Browse all {game.genres[0]} games →
</Link>
</div>

          </section>
        )}

        {game.platforms && game.platforms.length > 0 && (
         <section className="gameSection">
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "20px"
              }}
            >
              More {game.platforms[0]} Games
            </h2>

            <GameGrid games={relatedPlatformGames} />

<div style={{ marginTop: "16px" }}>
<Link
  href={
    getPlatformHrefFromSlug(game.platformSlugs?.[0]) ||
    getPlatformHref(game.platforms[0]) ||
    "/platforms"
  }
  className="sectionMoreLink"
>
  Browse all {game.platforms[0]} games →
</Link>
</div>

          </section>
        )}

        <section className="gameSection discoverSection">
          <h2>Discover More Games</h2>

<ul>
  <li><Link href="/new-games">New Games</Link></li>
  <li><Link href="/upcoming-games">Upcoming Games</Link></li>
  <li><Link href="/games-releasing-this-month">Games Releasing This Month</Link></li>
  <li><Link href="/platform/pc">PC Games</Link></li>
  <li><Link href="/platform/playstation">PlayStation Games</Link></li>
  <li><Link href="/platform/xbox">Xbox Games</Link></li>
  <li><Link href="/genre/rpg">RPG Games</Link></li>
  <li><Link href="/genre/shooter">Shooter Games</Link></li>
</ul>
        </section>
      </main>
    </>
  );
}