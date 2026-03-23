import type { ReleaseDatePrecision } from "./release-date";

export type RankedGame = {
  id?: number;
  name?: string;
  aggregated_rating?: number | null;
  aggregated_rating_count?: number | null;
  releaseDate?: string | null;
  releaseDatePrecision?: ReleaseDatePrecision | null;
  coverUrl?: string | null;
  platforms?: string[] | null;
  platformSlugs?: string[] | null;
  twitchViewers?: number | null;
  twitchStreams?: number | null;
  hypeScore?: number | null;
};

function getDaysFromNow(date?: string | null): number | null {
  if (!date) {
    return null;
  }

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const now = new Date().getTime();
  const diffMs = timestamp - now;

  return diffMs / (1000 * 60 * 60 * 24);
}

function hasExactOrMonthlyDate(game: RankedGame): boolean {
  return (
    game.releaseDatePrecision === "day" ||
    game.releaseDatePrecision === "year-month"
  );
}

function hasCover(game: RankedGame): boolean {
  return Boolean(game.coverUrl);
}

function hasStrongRatingSignal(game: RankedGame): boolean {
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;

  return rating >= 75 && ratingCount >= 1;
}

function hasLiveSignal(game: RankedGame): boolean {
  const twitchViewers = game.twitchViewers ?? 0;
  const twitchStreams = game.twitchStreams ?? 0;

  return twitchViewers >= 100 || twitchStreams >= 3;
}

function hasHomepageConfidence(game: RankedGame): boolean {
  if (!hasCover(game)) {
    return false;
  }

  return (
    hasStrongRatingSignal(game) ||
    hasLiveSignal(game) ||
    hasExactOrMonthlyDate(game)
  );
}

function isPastRelease(game: RankedGame): boolean {
  const diffDays = getDaysFromNow(game.releaseDate);

  if (diffDays === null) {
    return false;
  }

  return diffDays <= 0;
}

function isUpcomingRelease(game: RankedGame): boolean {
  const diffDays = getDaysFromNow(game.releaseDate);

  if (diffDays === null) {
    return false;
  }

  return diffDays > 0;
}

function hasReleasedHypeSignal(game: RankedGame): boolean {
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const twitchViewers = game.twitchViewers ?? 0;

  return ratingCount >= 5 || rating >= 70 || twitchViewers >= 100;
}

function hasUpcomingAnticipationSignal(game: RankedGame): boolean {
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const twitchViewers = game.twitchViewers ?? 0;
  const platformCount = game.platforms?.length ?? 0;

  return (
    twitchViewers >= 250 ||
    ratingCount >= 20 ||
    rating >= 75 ||
    (platformCount >= 2 && hasExactOrMonthlyDate(game))
  );
}

function excludeGamesById<T extends RankedGame>(
  games: T[],
  excludedGames: RankedGame[]
): T[] {
  const excludedIds = new Set(
    excludedGames
      .map((game) => game.id)
      .filter((id): id is number => typeof id === "number")
  );

  return games.filter((game) => {
    if (typeof game.id !== "number") {
      return true;
    }

    return !excludedIds.has(game.id);
  });
}

export function calculateMomentumScore(game: RankedGame): number {
  let score = 0;

  const twitchViewers = game.twitchViewers ?? 0;
  const twitchStreams = game.twitchStreams ?? 0;
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const platformCount = game.platforms?.length ?? 0;
  const diffDays = getDaysFromNow(game.releaseDate);

  if (twitchViewers > 0) {
    score += Math.log10(twitchViewers + 1) * 30;
  }

  if (twitchStreams > 0) {
    score += Math.log10(twitchStreams + 1) * 14;
  }

  if (diffDays !== null) {
    if (diffDays <= 0 && diffDays >= -7) {
      score += 35;
    } else if (diffDays < -7 && diffDays >= -30) {
      score += 18;
    } else if (diffDays > 0 && diffDays <= 14) {
      score += 16;
    } else if (diffDays > 14 && diffDays <= 45) {
      score += 8;
    }
  }

  if (ratingCount > 0) {
    score += Math.log10(ratingCount + 1) * 8;
  }

  if (rating > 0) {
    score += rating * 0.12;
  }

  score += Math.min(platformCount, 4) * 2;

  if (twitchViewers === 0 && twitchStreams === 0 && ratingCount < 5) {
    score -= 20;
  }

  if (twitchViewers < 50 && twitchStreams < 2 && ratingCount < 10) {
    score -= 10;
  }

  return Math.round(score);
}

export function calculateHypeRankingScore(game: RankedGame): number {
  let score = 0;

  const twitchViewers = game.twitchViewers ?? 0;
  const twitchStreams = game.twitchStreams ?? 0;
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const platformCount = game.platforms?.length ?? 0;
  const diffDays = getDaysFromNow(game.releaseDate);

  if (diffDays !== null) {
    if (diffDays <= 0 && diffDays >= -7) {
      score += 40;
    } else if (diffDays < -7 && diffDays >= -30) {
      score += 28;
    } else if (diffDays < -30 && diffDays >= -60) {
      score += 12;
    }
  }

  if (rating > 0) {
    score += rating * 0.6;
  }

  if (ratingCount > 0) {
    score += Math.log10(ratingCount + 1) * 18;
  }

  if (ratingCount >= 50) {
    score += 6;
  }

  if (ratingCount >= 200) {
    score += 10;
  }

  if (ratingCount >= 1000) {
    score += 16;
  }

  if (twitchViewers > 0) {
    score += Math.log10(twitchViewers + 1) * 8;
  }

  if (twitchStreams > 0) {
    score += Math.log10(twitchStreams + 1) * 4;
  }

  score += Math.min(platformCount, 4) * 3;

  if (ratingCount < 5 && rating < 70) {
    score -= 25;
  }

  if (ratingCount < 10 && twitchViewers < 50) {
    score -= 15;
  }

  if (ratingCount === 0 && twitchViewers === 0) {
    score -= 40;
  }

  return Math.round(score);
}

export function calculateUpcomingAnticipationScore(game: RankedGame): number {
  let score = 0;

  const twitchViewers = game.twitchViewers ?? 0;
  const twitchStreams = game.twitchStreams ?? 0;
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const platformCount = game.platforms?.length ?? 0;
  const diffDays = getDaysFromNow(game.releaseDate);

  if (diffDays === null || diffDays <= 0) {
    return -9999;
  }

  if (diffDays <= 14) {
    score += 40;
  } else if (diffDays <= 45) {
    score += 28;
  } else if (diffDays <= 90) {
    score += 16;
  } else if (diffDays <= 180) {
    score += 8;
  }

  if (hasExactOrMonthlyDate(game)) {
    score += 10;
  }

  if (rating > 0) {
    score += rating * 0.18;
  }

  if (ratingCount > 0) {
    score += Math.log10(ratingCount + 1) * 8;
  }

  if (twitchViewers > 0) {
    score += Math.log10(twitchViewers + 1) * 10;
  }

  if (twitchStreams > 0) {
    score += Math.log10(twitchStreams + 1) * 4;
  }

  score += Math.min(platformCount, 4) * 4;

  if (!hasExactOrMonthlyDate(game) && twitchViewers < 250 && ratingCount < 20) {
    score -= 20;
  }

  return Math.round(score);
}

export function sortGamesByMomentum<T extends RankedGame>(games: T[]): T[] {
  return [...games].sort((a, b) => {
    const scoreA = calculateMomentumScore(a);
    const scoreB = calculateMomentumScore(b);

    return scoreB - scoreA;
  });
}

export function sortGamesByHype<T extends RankedGame>(games: T[]): T[] {
  return [...games].sort((a, b) => {
    const scoreA = calculateHypeRankingScore(a);
    const scoreB = calculateHypeRankingScore(b);

    return scoreB - scoreA;
  });
}

export function selectHomepageHypeGames<T extends RankedGame>(games: T[]): T[] {
  return sortGamesByHype(
    games.filter((game) => {
      const diffDays = getDaysFromNow(game.releaseDate);

      if (diffDays === null) {
        return false;
      }

      if (diffDays > 0) {
        return false;
      }

      if (diffDays < -60) {
        return false;
      }

      if (!hasCover(game)) {
        return false;
      }

      const hasSignal =
        (game.aggregated_rating_count ?? 0) >= 5 ||
        (game.aggregated_rating ?? 0) >= 70;

      if (!hasSignal) {
        return false;
      }

      return true;
    })
  ).slice(0, 20);
}

export function selectHypeReleasedGames<T extends RankedGame>(games: T[]): T[] {
  return [...games]
    .filter((game) => {
      const diffDays = getDaysFromNow(game.releaseDate);

      if (diffDays === null) {
        return false;
      }

      if (diffDays > 0 || diffDays < -120) {
        return false;
      }

      if (!hasCover(game)) {
        return false;
      }

      return hasReleasedHypeSignal(game);
    })
    .sort((a, b) => {
      const scoreA = calculateHypeRankingScore(a);
      const scoreB = calculateHypeRankingScore(b);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const aCount = a.aggregated_rating_count ?? 0;
      const bCount = b.aggregated_rating_count ?? 0;

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      const aRating = a.aggregated_rating ?? 0;
      const bRating = b.aggregated_rating ?? 0;

      if (bRating !== aRating) {
        return bRating - aRating;
      }

      return (
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
      );
    });
}

export function selectHypeUpcomingGames<T extends RankedGame>(games: T[]): T[] {
  return [...games]
    .filter((game) => {
      const diffDays = getDaysFromNow(game.releaseDate);

      if (diffDays === null) {
        return false;
      }

      if (diffDays <= 0 || diffDays > 180) {
        return false;
      }

      if (!hasCover(game)) {
        return false;
      }

      return hasUpcomingAnticipationSignal(game);
    })
    .sort((a, b) => {
      const scoreA = calculateUpcomingAnticipationScore(a);
      const scoreB = calculateUpcomingAnticipationScore(b);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const aViewers = a.twitchViewers ?? 0;
      const bViewers = b.twitchViewers ?? 0;

      if (bViewers !== aViewers) {
        return bViewers - aViewers;
      }

      return (
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
      );
    });
}

export function selectHomepageTrendingGames<T extends RankedGame>(
  games: T[]
): T[] {
  return [...games]
    .filter((game) => {
      const diffDays = getDaysFromNow(game.releaseDate);
      const ratingCount = game.aggregated_rating_count ?? 0;
      const twitchViewers = game.twitchViewers ?? 0;
      const twitchStreams = game.twitchStreams ?? 0;

      if (diffDays === null) {
        return false;
      }

      if (!isPastRelease(game)) {
        return false;
      }

      if (diffDays < -45) {
        return false;
      }

      if (!hasCover(game)) {
        return false;
      }

      return (
        ratingCount >= 3 ||
        twitchViewers >= 100 ||
        twitchStreams >= 3
      );
    })
    .sort((a, b) => {
      const scoreA =
        Math.log10((a.aggregated_rating_count ?? 0) + 1) * 16 +
        Math.log10((a.twitchViewers ?? 0) + 1) * 16 +
        Math.log10((a.twitchStreams ?? 0) + 1) * 8 +
        ((a.aggregated_rating ?? 0) * 0.08 +
          (hasExactOrMonthlyDate(a) ? 3 : 0));

      const scoreB =
        Math.log10((b.aggregated_rating_count ?? 0) + 1) * 16 +
        Math.log10((b.twitchViewers ?? 0) + 1) * 16 +
        Math.log10((b.twitchStreams ?? 0) + 1) * 8 +
        ((b.aggregated_rating ?? 0) * 0.08 +
          (hasExactOrMonthlyDate(b) ? 3 : 0));

      return scoreB - scoreA;
    })
    .slice(0, 24);
}

export function selectHomepageTopRatedGames<T extends RankedGame>(
  games: T[]
): T[] {
  return [...games]
    .filter((game) => {
      return (
        isPastRelease(game) &&
        hasCover(game) &&
        (game.aggregated_rating ?? 0) >= 80 &&
        (game.aggregated_rating_count ?? 0) >= 3
      );
    })
    .sort((a, b) => {
      const aRating = a.aggregated_rating ?? 0;
      const bRating = b.aggregated_rating ?? 0;
      const aCount = a.aggregated_rating_count ?? 0;
      const bCount = b.aggregated_rating_count ?? 0;

      const aWeightedScore = aRating + Math.min(aCount, 20) * 0.35;
      const bWeightedScore = bRating + Math.min(bCount, 20) * 0.35;

      if (bWeightedScore !== aWeightedScore) {
        return bWeightedScore - aWeightedScore;
      }

      if (bRating !== aRating) {
        return bRating - aRating;
      }

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      return (
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
      );
    })
    .slice(0, 20);
}

export function selectHomepagePcGames<T extends RankedGame>(games: T[]): T[] {
  return sortGamesByMomentum(
    games.filter((game) => {
      const isPcGame = game.platformSlugs?.includes("pc");
      const diffDays = getDaysFromNow(game.releaseDate);

      if (!isPcGame) {
        return false;
      }

      if (diffDays === null) {
        return false;
      }

      if (
        diffDays > 180 &&
        !hasStrongRatingSignal(game) &&
        !hasLiveSignal(game)
      ) {
        return false;
      }

      return hasHomepageConfidence(game);
    })
  ).slice(0, 8);
}

export function selectHomepageTrendingGamesWithoutHype<T extends RankedGame>(
  games: T[]
): T[] {
  const hypeGames = selectHomepageHypeGames(games);
  const remainingGames = excludeGamesById(games, hypeGames);

  return selectHomepageTrendingGames(remainingGames);
}

export function selectHomepageTopRatedGamesWithoutUsed<T extends RankedGame>(
  games: T[]
): T[] {
  const hypeGames = selectHomepageHypeGames(games);
  const trendingGames = selectHomepageTrendingGamesWithoutHype(games);
  const usedGames = [...hypeGames, ...trendingGames];
  const remainingGames = excludeGamesById(games, usedGames);

  return selectHomepageTopRatedGames(remainingGames);
}

export function selectHomepageFeaturedGame<T extends RankedGame>(
  games: T[]
): T | undefined {
  return selectHomepageHypeGames(games)[0] ?? games[0];
}

export function selectHomepageUpcomingHero<T extends RankedGame>(
  games: T[]
): T | undefined {
  return [...games]
    .filter((game) => isUpcomingRelease(game) && hasHomepageConfidence(game))
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    )[0];
}

export function selectHomepageTrendingHero<T extends RankedGame>(
  games: T[]
): T | undefined {
  return selectHomepageTrendingGames(games)[0] ?? games[0];
}