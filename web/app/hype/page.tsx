export const revalidate = 1800;

import { fetchGames } from "../../lib/igdb";
import { fetchTwitchStreams } from "../../lib/twitch";
import {
  calculateHypeRankingScore,
  selectHypeReleasedGames,
  selectHypeUpcomingGames
} from "../../lib/game-ranking";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import SectionBlock from "../../components/layout/SectionBlock";
import GameGrid from "../../components/game/GameGrid";

export default async function HypePage() {
  const games = await fetchGames();
  const streams = await fetchTwitchStreams();

  const twitchMap: Record<string, { viewers: number; streams: number }> = {};

  for (const stream of streams) {
    const name = stream.game_name?.trim().toLowerCase();

    if (!name) {
      continue;
    }

    if (!twitchMap[name]) {
      twitchMap[name] = { viewers: 0, streams: 0 };
    }

    twitchMap[name].viewers += stream.viewer_count;
    twitchMap[name].streams += 1;
  }

  const enrichedGames = games.map((game) => {
    const twitch = twitchMap[game.name?.trim().toLowerCase()] || {
      viewers: 0,
      streams: 0
    };

    const hypeScore = calculateHypeRankingScore({
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams
    });

    return {
      ...game,
      twitchViewers: twitch.viewers,
      twitchStreams: twitch.streams,
      hypeScore
    };
  });

  const hotRightNowGames = selectHypeReleasedGames(enrichedGames).slice(0, 36);
  const mostAnticipatedGames = selectHypeUpcomingGames(enrichedGames).slice(0, 24);

  return (
    <PageContainer>
      <SectionHeading
        title="Gamerly Hype Index"
        subtitle="A cleaner hype page split into what is hot right now and what players are most likely anticipating next."
      />

      <SectionBlock>
        <SectionHeading
          title="Hot Right Now"
          subtitle="Recently released games with the strongest real signals Gamerly currently tracks."
        />

        <GameGrid games={hotRightNowGames} />
      </SectionBlock>

      <SectionBlock>
        <SectionHeading
          title="Most Anticipated"
          subtitle="Upcoming games with the strongest pre-release signals Gamerly currently tracks."
        />

        <GameGrid games={mostAnticipatedGames} />
      </SectionBlock>
    </PageContainer>
  );
}