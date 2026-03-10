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
    score += game.aggregated_rating * 0.5;
  }

  /* -------------------------
     Popularity boost
  --------------------------*/

  if (game.aggregated_rating_count) {
    score += Math.log(game.aggregated_rating_count) * 10;
  }

  /* -------------------------
     Release proximity boost
  --------------------------*/

  if (game.releaseDate) {

    const now = new Date().getTime();
    const release = new Date(game.releaseDate).getTime();

    const diffDays = (release - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 30 && diffDays > 0) {
      score += 30;
    }

    if (diffDays < 90 && diffDays > 30) {
      score += 15;
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