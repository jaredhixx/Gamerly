import { GamerlyGame } from "./igdb";

/*
Hype score system

Signals used:
- Rating
- Rating count
- Release proximity
- Platform count
- Twitch viewers
*/

export function calculateHypeScore(
  game: GamerlyGame,
  twitchViewers: number = 0,
  twitchStreams: number = 0
) {

  let score = 0;

  /* -------------------------
     Rating score
  --------------------------*/

  if (game.aggregated_rating) {
    score += game.aggregated_rating * 0.35;
  }

  /* -------------------------
     Popularity boost
  --------------------------*/

  if (game.aggregated_rating_count) {
    score += Math.log10(game.aggregated_rating_count + 1) * 12;
  }

  /* -------------------------
     Release proximity boost
  --------------------------*/

if (game.releaseDate) {

  const now = new Date().getTime();
  const release = new Date(game.releaseDate).getTime();

  const diffDays = (release - now) / (1000 * 60 * 60 * 24);

  /* Upcoming games */

  if (diffDays > 0 && diffDays < 60) {
    score += 40;
  }

  if (diffDays >= 60 && diffDays < 120) {
    score += 20;
  }

  /* Newly released games */

  if (diffDays <= 0 && diffDays > -30) {
    score += 30;
  }

}

  /* -------------------------
     Platform boost
  --------------------------*/

  if (game.platforms) {
    score += game.platforms.length * 3;
  }

  /* -------------------------
     Twitch activity
  --------------------------*/

  if (twitchViewers || twitchStreams) {
    score += Math.log(twitchViewers + twitchStreams * 50 + 1) * 6;
  }

  return Math.round(score);

}