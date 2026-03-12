import { fetchGames } from "./igdb";
import type { GamerlyGame } from "./igdb";

function isFuture(date?: string | null) {
  if (!date) return false;
  return new Date(date) > new Date();
}

function isPast(date?: string | null) {
  if (!date) return false;
  return new Date(date) <= new Date();
}

function withinDays(date?: string | null, days = 0) {
  if (!date) return false;

  const now = new Date();
  const target = new Date(date);

  const diff = target.getTime() - now.getTime();
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= days;
}

function withinMonth(date?: string | null) {
  if (!date) return false;

  const now = new Date();
  const target = new Date(date);

  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth()
  );
}

export async function getDerivedGameData() {
  const games = await fetchGames();

  const newGames = games
    .filter((g) => isPast(g.releaseDate))
    .sort(
      (a, b) =>
        new Date(b.releaseDate || "").getTime() -
        new Date(a.releaseDate || "").getTime()
    );

  const upcomingGames = games
    .filter((g) => isFuture(g.releaseDate))
    .sort(
      (a, b) =>
        new Date(a.releaseDate || "").getTime() -
        new Date(b.releaseDate || "").getTime()
    );

  const topRated = games
    .filter((g) => (g.aggregated_rating ?? 0) > 0)
    .sort((a, b) => (b.aggregated_rating ?? 0) - (a.aggregated_rating ?? 0));

  const releasingToday = games.filter((g) => withinDays(g.releaseDate, 1));

  const releasingThisWeek = games.filter((g) => withinDays(g.releaseDate, 7));

  const releasingThisMonth = games.filter((g) =>
    withinMonth(g.releaseDate)
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