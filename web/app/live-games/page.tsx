import { fetchGames } from "../../lib/igdb";
import { fetchTwitchStreams } from "../../lib/twitch";
import GameCarousel from "../../components/game/GameCarousel";
import PageContainer from "../../components/layout/PageContainer";
import SectionHeading from "../../components/ui/SectionHeading";
import SectionBlock from "../../components/layout/SectionBlock";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Games on Twitch | Gamerly",
  description:
    "Discover video games currently trending on Twitch with the most viewers right now.",
  alternates: {
    canonical: "https://www.gamerly.net/live-games"
  }
};

export const revalidate = 300;

export default async function LiveGamesPage() {
  const games = await fetchGames();
  const streams = await fetchTwitchStreams();

const viewerMap = new Map();

for (const stream of streams) {
  const streamName = stream.game_name?.toLowerCase();

  const matchedGame = games.find(
    (g) => g.name?.toLowerCase() === streamName
  );

  if (!matchedGame) continue;

  const existing = viewerMap.get(matchedGame.id) || 0;

  viewerMap.set(
    matchedGame.id,
    existing + stream.viewer_count
  );
}

const liveGames = [];

for (const game of games) {
  const viewers = viewerMap.get(game.id);

  if (!viewers) continue;

  liveGames.push({
    ...game,
    twitchViewers: viewers
  });
}

const sortedLiveGames = liveGames
  .sort((a, b) => (b.twitchViewers ?? 0) - (a.twitchViewers ?? 0))
  .slice(0, 40);

  return (
    <main style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <PageContainer>

        <SectionBlock>
          <SectionHeading
            title="🔴 Live Games on Twitch"
            subtitle="Games currently attracting the most viewers on Twitch."
          />

          <GameCarousel games={sortedLiveGames} />

        </SectionBlock>

      </PageContainer>
    </main>
  );
}