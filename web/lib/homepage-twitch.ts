import { fetchGames, type GamerlyGame } from "./igdb";
import {
  calculateHypeRankingScore,
  selectHomepageFeaturedGame,
  selectHomepageHypeGames,
  selectHomepageUpcomingHero
} from "./game-ranking";

const HOMEPAGE_PREP_CACHE_TTL_MS = 5 * 60 * 1000;

let homepageCandidateGamesCache:
  | {
      value: Awaited<ReturnType<typeof fetchGames>>;
      expiresAt: number;
      sourceGamesRef: Awaited<ReturnType<typeof fetchGames>>;
    }
  | null = null;

let homepageScoredGamesCache:
  | {
      value: Array<
        GamerlyGame & {
          twitchViewers: number;
          twitchStreams: number;
          hypeScore: number;
        }
      >;
      expiresAt: number;
      sourceGamesRef: Awaited<ReturnType<typeof fetchGames>>;
      sourceTwitchMapRef: Record<string, { viewers: number; streams: number }>;
    }
  | null = null;

const homepageUpcomingWindowCache = new Map<
  string,
  {
    value: Awaited<ReturnType<typeof fetchGames>>;
    expiresAt: number;
    sourceGamesRef: Awaited<ReturnType<typeof fetchGames>>;
  }
>();

type TwitchStream = {
  game_name: string;
  viewer_count: number;
};

export function normalizeHomepageTwitchName(name?: string | null): string {
  if (!name) {
    return "";
  }

  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildHomepageRoughTwitchMap(
  streams: TwitchStream[]
): Record<string, { viewers: number; streams: number }> {
  const twitchMap: Record<string, { viewers: number; streams: number }> = {};

  for (const stream of streams) {
    const key = normalizeHomepageTwitchName(stream.game_name);

    if (!key) {
      continue;
    }

    if (!twitchMap[key]) {
      twitchMap[key] = { viewers: 0, streams: 0 };
    }

    twitchMap[key].viewers += stream.viewer_count;
    twitchMap[key].streams += 1;
  }

  return twitchMap;
}

export function buildUpcomingHomepageWindowGames(
  games: Awaited<ReturnType<typeof fetchGames>>,
  now: number,
  daysAhead: number
) {
  const dayKey = Math.floor(now / (1000 * 60 * 60 * 24));
  const cacheKey = `${dayKey}:${daysAhead}`;
  const cachedUpcomingWindow = homepageUpcomingWindowCache.get(cacheKey);

  if (
    cachedUpcomingWindow &&
    cachedUpcomingWindow.expiresAt > now &&
    cachedUpcomingWindow.sourceGamesRef === games
  ) {
    return cachedUpcomingWindow.value;
  }

  const endTime = now + 1000 * 60 * 60 * 24 * daysAhead;

  const upcomingWindowGames = [...games]
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const releaseTime = new Date(game.releaseDate).getTime();

      if (Number.isNaN(releaseTime)) {
        return false;
      }

      return releaseTime > now && releaseTime <= endTime;
    })
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    );

  homepageUpcomingWindowCache.set(cacheKey, {
    value: upcomingWindowGames,
    expiresAt: now + HOMEPAGE_PREP_CACHE_TTL_MS,
    sourceGamesRef: games
  });

  return upcomingWindowGames;
}

export function buildHomepageCandidateGames(
  games: Awaited<ReturnType<typeof fetchGames>>,
  now: number
) {
  if (
    homepageCandidateGamesCache &&
    homepageCandidateGamesCache.expiresAt > now &&
    homepageCandidateGamesCache.sourceGamesRef === games
  ) {
    return homepageCandidateGamesCache.value;
  }

  const homepageCandidateGames = games
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const diffDays =
        (new Date(game.releaseDate).getTime() - now) /
        (1000 * 60 * 60 * 24);

      return (
        (diffDays >= -180 && diffDays <= 180) ||
        (game.aggregated_rating ?? 0) >= 75 ||
        (game.aggregated_rating_count ?? 0) >= 10
      );
    })
    .sort((a, b) => {
      const aDiffDays =
        (new Date(a.releaseDate || "").getTime() - now) /
        (1000 * 60 * 60 * 24);
      const bDiffDays =
        (new Date(b.releaseDate || "").getTime() - now) /
        (1000 * 60 * 60 * 24);

      const aInWindow = aDiffDays >= -180 && aDiffDays <= 180 ? 1 : 0;
      const bInWindow = bDiffDays >= -180 && bDiffDays <= 180 ? 1 : 0;

      if (bInWindow !== aInWindow) {
        return bInWindow - aInWindow;
      }

      const aRatingCount = a.aggregated_rating_count ?? 0;
      const bRatingCount = b.aggregated_rating_count ?? 0;

      if (bRatingCount !== aRatingCount) {
        return bRatingCount - aRatingCount;
      }

      const aRating = a.aggregated_rating ?? 0;
      const bRating = b.aggregated_rating ?? 0;

      if (bRating !== aRating) {
        return bRating - aRating;
      }

      return Math.abs(aDiffDays) - Math.abs(bDiffDays);
    })
    .slice(0, 200);

  homepageCandidateGamesCache = {
    value: homepageCandidateGames,
    expiresAt: now + HOMEPAGE_PREP_CACHE_TTL_MS,
    sourceGamesRef: games
  };

  return homepageCandidateGames;
}

export function buildHomepageScoredGames(
  games: Awaited<ReturnType<typeof fetchGames>>,
  roughTwitchMap: Record<string, { viewers: number; streams: number }>
) {
  const now = Date.now();

  if (
    homepageScoredGamesCache &&
    homepageScoredGamesCache.expiresAt > now &&
    homepageScoredGamesCache.sourceGamesRef === games &&
    homepageScoredGamesCache.sourceTwitchMapRef === roughTwitchMap
  ) {
    return homepageScoredGamesCache.value;
  }

  const scoredGames = games.map((game) => {
    const twitch =
      roughTwitchMap[normalizeHomepageTwitchName(game.name)] || {
        viewers: 0,
        streams: 0
      };

    const hypeScore = calculateHypeRankingScore({
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams
    } as GamerlyGame & {
      twitchViewers: number;
      twitchStreams: number;
    });

    return {
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams,
      hypeScore
    };
  });

  homepageScoredGamesCache = {
    value: scoredGames,
    expiresAt: now + HOMEPAGE_PREP_CACHE_TTL_MS,
    sourceGamesRef: games,
    sourceTwitchMapRef: roughTwitchMap
  };

  return scoredGames;
}

export function applyExactHomepageTwitchTotals(
  games: Array<
    GamerlyGame & {
      twitchViewers: number;
      twitchStreams: number;
      hypeScore: number;
    }
  >,
  exactTwitchMap: Record<
    string,
    {
      viewers: number;
      streams: number;
      matchedCategoryName?: string;
    }
  >
) {
  return games.map((game) => {
    const exact = exactTwitchMap[game.name];

    if (!exact) {
      return game;
    }

    return {
      ...game,
      twitchViewers: exact.viewers,
      twitchStreams: exact.streams
    };
  });
}

export function buildHomepageSelections(
  games: Array<
    GamerlyGame & {
      twitchViewers: number;
      twitchStreams: number;
      hypeScore: number;
    }
  >
) {
  const finalFeaturedGame =
    selectHomepageFeaturedGame(games) || games[0];

  const finalHypeGames = selectHomepageHypeGames(games).slice(0, 24);

  const finalUpcomingHero =
    selectHomepageUpcomingHero(games) ||
    games[1] ||
    games[0];

  const featuredViewerCount = finalFeaturedGame?.twitchViewers ?? 0;

  return {
    finalFeaturedGame,
    finalHypeGames,
    finalUpcomingHero,
    featuredViewerCount
  };
}

export function buildHomepageReleaseSections(
  allGames: Awaited<ReturnType<typeof fetchGames>>,
  now: number
) {
  const upcomingWindowGames = buildUpcomingHomepageWindowGames(allGames, now, 30);
  const upcomingGames = upcomingWindowGames.slice(0, 24);

  const releasingSoonGames = upcomingWindowGames
    .filter((game) => {
      if (!game.releaseDate) {
        return false;
      }

      const releaseTime = new Date(game.releaseDate).getTime();
      const fourteenDaysAhead = now + 1000 * 60 * 60 * 24 * 14;

      if (Number.isNaN(releaseTime)) {
        return false;
      }

      return releaseTime > now && releaseTime <= fourteenDaysAhead;
    })
    .slice(0, 24);

  const hasUpcomingGames = upcomingGames.length > 0;
  const hasReleasingSoonGames = releasingSoonGames.length > 0;
  const upcomingThirtyDayCount = upcomingWindowGames.length;

  return {
    upcomingWindowGames,
    upcomingGames,
    releasingSoonGames,
    hasUpcomingGames,
    hasReleasingSoonGames,
    upcomingThirtyDayCount
  };
}

export function buildHomepageSummaryStats(
  allGames: Awaited<ReturnType<typeof fetchGames>>,
  roughTwitchMap: Record<string, { viewers: number; streams: number }>,
  finalHypeGames: Array<
    GamerlyGame & {
      twitchViewers: number;
      twitchStreams: number;
      hypeScore: number;
    }
  >
) {
  const hasHypeGames = finalHypeGames.length > 0;
  const totalGamesCount = allGames.length;
  const trackedLiveSignalCount = Object.keys(roughTwitchMap).length;

  return {
    hasHypeGames,
    totalGamesCount,
    trackedLiveSignalCount
  };
}