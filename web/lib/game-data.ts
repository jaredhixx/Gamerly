import { fetchGames, type GamerlyGame } from "./igdb";

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

function withinDays(date?: string | null, days = 0) {
  if (!date) {
    return false;
  }

  const now = new Date();
  const target = new Date(date);

  const diff = target.getTime() - now.getTime();
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= days;
}

function withinMonth(date?: string | null) {
  if (!date) {
    return false;
  }

  const now = new Date();
  const target = new Date(date);

  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth()
  );
}

function getTopRatedGames(games: GamerlyGame[]) {
  return [...games]
    .filter((game) => {
      if (!isPast(game.releaseDate)) {
        return false;
      }

      const rating = game.aggregated_rating ?? 0;
      const ratingCount = game.aggregated_rating_count ?? 0;

      return rating >= 70 && ratingCount >= 1;
    })
    .sort((a, b) => {
      const aRating = a.aggregated_rating ?? 0;
      const bRating = b.aggregated_rating ?? 0;

      const aCount = a.aggregated_rating_count ?? 0;
      const bCount = b.aggregated_rating_count ?? 0;

      const aWeightedScore = aRating + Math.min(aCount, 20) * 0.35;
      const bWeightedScore = bRating + Math.min(bCount, 20) * 0.35;

      const weightedDiff = bWeightedScore - aWeightedScore;

      if (weightedDiff !== 0) {
        return weightedDiff;
      }

      const ratingDiff = bRating - aRating;

      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      const countDiff = bCount - aCount;

      if (countDiff !== 0) {
        return countDiff;
      }

      return (
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
      );
    });
}

export async function getDerivedGameData(): Promise<{
  games: GamerlyGame[];
  newGames: GamerlyGame[];
  upcomingGames: GamerlyGame[];
  topRated: GamerlyGame[];
  releasingToday: GamerlyGame[];
  releasingThisWeek: GamerlyGame[];
  releasingThisMonth: GamerlyGame[];
}> {
  const games = await fetchGames();

  const sortedByNewestRelease = [...games].sort(
    (a, b) =>
      new Date(b.releaseDate || "").getTime() -
      new Date(a.releaseDate || "").getTime()
  );

  const sortedByUpcomingRelease = [...games].sort(
    (a, b) =>
      new Date(a.releaseDate || "").getTime() -
      new Date(b.releaseDate || "").getTime()
  );

  const newGames = sortedByNewestRelease.filter((game) => isPast(game.releaseDate));

  const upcomingGames = sortedByUpcomingRelease.filter((game) =>
    isFuture(game.releaseDate)
  );

  const topRated = getTopRatedGames(games);

  const releasingToday = sortedByUpcomingRelease.filter((game) =>
    withinDays(game.releaseDate, 1)
  );

  const releasingThisWeek = sortedByUpcomingRelease.filter((game) =>
    withinDays(game.releaseDate, 7)
  );

  const releasingThisMonth = sortedByUpcomingRelease.filter((game) =>
    withinMonth(game.releaseDate)
  );

  return {
    games,
    newGames,
    upcomingGames,
    topRated,
    releasingToday,
    releasingThisWeek,
    releasingThisMonth
  };
}