export const dynamic = "force-dynamic";

import { fetchGames } from "../../lib/igdb";
import { fetchTwitchStreams } from "../../lib/twitch";
import { calculateHypeScore } from "../../lib/hype";
import GameGrid from "../../components/game/GameGrid";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export default async function HypePage() {

  const games = await fetchGames();
  const streams = await fetchTwitchStreams();

  const twitchMap: Record<string, { viewers: number; streams: number }> = {};

  for (const stream of streams) {

    const name = stream.game_name;

    if (!twitchMap[name]) {
      twitchMap[name] = { viewers: 0, streams: 0 };
    }

    twitchMap[name].viewers += stream.viewer_count;
    twitchMap[name].streams += 1;

  }

  const scoredGames = games.map((game) => {

    const twitch = twitchMap[game.name] || { viewers: 0, streams: 0 };

    const hypeScore = calculateHypeScore(
      game,
      twitch.viewers,
      twitch.streams
    );

    return {
      ...game,
      hypeScore
    };

  });

  const sortedGames = scoredGames.sort(
    (a, b) => b.hypeScore - a.hypeScore
  );

  return (
    <PageContainer>

      <SectionHeading
        title="🔥 Gamerly Hype Index"
        subtitle="Trending games ranked using ratings, popularity, upcoming release momentum, and live Twitch activity."
      />

      <GameGrid games={sortedGames.slice(0, 60)} />

    </PageContainer>
  );

}