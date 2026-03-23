export type SortableGame = {
  aggregated_rating?: number | null;
  aggregated_rating_count?: number | null;
  hypeScore?: number | null;
  releaseDate?: string | null;
};

function getYearFromDate(date?: string | null): number {
  if (!date) return 0;

  const year = parseInt(date.substring(0, 4));
  if (isNaN(year)) return 0;

  return year;
}

export function calculateQualityScore(game: SortableGame): number {
  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const hype = game.hypeScore ?? 0;

  // Prevent tiny vote counts from dominating
  const ratingWeight = rating * Math.log10(ratingCount + 1);

  // Mild hype influence
  const hypeWeight = hype * 0.3;

  // Slight boost for newer games (last ~2 years)
  const currentYear = new Date().getFullYear();
  const releaseYear = getYearFromDate(game.releaseDate);
  const recencyBoost =
    releaseYear >= currentYear - 2 ? 5 : 0;

  return ratingWeight + hypeWeight + recencyBoost;
}

export function sortGamesByQuality<T extends SortableGame>(games: T[]): T[] {
  return [...games].sort((a, b) => {
    const scoreA = calculateQualityScore(a);
    const scoreB = calculateQualityScore(b);

    return scoreB - scoreA;
  });
}