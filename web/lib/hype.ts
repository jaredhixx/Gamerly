import { GamerlyGame } from "./igdb";

/*
Hype score system

Goals:
- Prioritize legitimately notable games
- Reward strong rating quality and rating volume
- Reward near-future releases
- Reward very recent releases
- Reward multi-platform launches
- Reward real Twitch activity
- Avoid weak games floating to the top just because they exist soon
*/

export function calculateHypeScore(
  game: GamerlyGame,
  twitchViewers: number = 0,
  twitchStreams: number = 0
) {
  let score = 0;

  const rating = game.aggregated_rating ?? 0;
  const ratingCount = game.aggregated_rating_count ?? 0;
  const platformCount = game.platforms?.length ?? 0;

  /* -------------------------
     Rating quality
  --------------------------*/

  if (rating > 0) {
    score += rating * 0.6;
  }

  /* -------------------------
     Rating confidence
  --------------------------*/

  if (ratingCount > 0) {
    score += Math.log10(ratingCount + 1) * 10;
  }

  if (ratingCount >= 100) {
    score += 8;
  }

  if (ratingCount >= 500) {
    score += 12;
  }

  if (ratingCount >= 2000) {
    score += 18;
  }

  /* -------------------------
     Release timing
  --------------------------*/

  if (game.releaseDate) {
    const now = new Date().getTime();
    const release = new Date(game.releaseDate).getTime();
    const diffDays = (release - now) / (1000 * 60 * 60 * 24);

    /* Upcoming games */

    if (diffDays > 0 && diffDays <= 30) {
      score += 35;
    } else if (diffDays > 30 && diffDays <= 90) {
      score += 22;
    } else if (diffDays > 90 && diffDays <= 180) {
      score += 10;
    }

    /* Newly released games */

    if (diffDays <= 0 && diffDays >= -14) {
      score += 24;
    } else if (diffDays < -14 && diffDays >= -45) {
      score += 10;
    }
  }

  /* -------------------------
     Platform breadth
  --------------------------*/

  score += Math.min(platformCount, 4) * 4;

  /* -------------------------
     Twitch activity
  --------------------------*/

  if (twitchViewers > 0 || twitchStreams > 0) {
    score += Math.log10(twitchViewers + 1) * 12;
    score += Math.log10(twitchStreams + 1) * 6;
  }

  /* -------------------------
     Low-confidence penalty
  --------------------------*/

  if (ratingCount < 10 && twitchViewers < 100 && twitchStreams < 3) {
    score -= 20;
  }

  if (ratingCount < 5 && rating < 70 && twitchViewers === 0) {
    score -= 20;
  }

  return Math.round(score);
}