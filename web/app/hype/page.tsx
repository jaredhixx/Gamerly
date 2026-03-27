export const revalidate = 1800;

import { Metadata } from "next";
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
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Gamerly Hype Index | Trending and Anticipated Video Games",
  description:
    "Track trending and anticipated video games with the Gamerly Hype Index, including hot recent releases and upcoming games with strong momentum signals.",
  alternates: {
    canonical: buildCanonicalUrl("/hype")
  }
};

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
        subtitle="Track trending video games, rising new releases, and the most anticipated upcoming launches based on the strongest momentum signals Gamerly currently tracks."
      />

      <SectionBlock>
        <div
          style={{
            color: "#A7B1C6",
            maxWidth: "860px",
            lineHeight: 1.7,
            marginBottom: "20px"
          }}
        >
          The Gamerly Hype Index is designed to separate short-term momentum from
          long-term anticipation. Instead of mixing every game into one list, this
          page highlights what is hot right now among recently released games and
          what players appear to be watching most closely among upcoming releases.
          Use it as a fast way to discover trending games, compare attention across
          the market, and jump into the titles generating the most current buzz.
        </div>
      </SectionBlock>

      <SectionBlock>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "18px 20px",
            maxWidth: "860px",
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#dbe9ff",
              marginBottom: "10px"
            }}
          >
            How to use the Hype Index
          </div>

          <div
            style={{
              color: "#A7B1C6",
              lineHeight: 1.7,
              fontSize: "14px",
              marginBottom: "14px"
            }}
          >
            Use <strong style={{ color: "#ffffff" }}>Hot Right Now</strong> to find
            recently released games gaining real momentum, and use{" "}
            <strong style={{ color: "#ffffff" }}>Most Anticipated</strong> to spot
            upcoming games with the strongest pre-release attention. Together, these
            two sections give you a clearer view of what players care about now and
            what they may care about next.
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#dbe9ff",
              marginBottom: "8px"
            }}
          >
            What Gamerly is looking at
          </div>

          <div
            style={{
              color: "#A7B1C6",
              lineHeight: 1.7,
              fontSize: "14px"
            }}
          >
            Hype rankings are influenced by signals such as game quality, release
            timing, platform reach, and current attention indicators. The goal is
            not to reward a single metric in isolation, but to surface games that
            appear to have the strongest overall momentum right now.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          <a
            href="/best-pc-games-2025"
            style={{
              color: "#8bb9ff",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Best PC Games of 2025 →
          </a>

          <a
            href="/upcoming-games"
            style={{
              color: "#8bb9ff",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Upcoming Games →
          </a>

          <a
            href="/platform/pc"
            style={{
              color: "#8bb9ff",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Browse PC Games →
          </a>
        </div>
      </SectionBlock>

      <SectionBlock>
        <SectionHeading
          title="Hot Right Now"
          subtitle="Recently released games showing the strongest current momentum based on Gamerly's tracked hype signals."
        />

        <GameGrid games={hotRightNowGames} />
      </SectionBlock>

      <SectionBlock>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8bb9ff",
            marginBottom: "10px"
          }}
        >
          Pre-release momentum
        </div>

        <SectionHeading
          title="Most Anticipated"
          subtitle="Upcoming games generating the strongest pre-release momentum based on Gamerly's tracked hype signals."
        />

        <GameGrid games={mostAnticipatedGames} />
      </SectionBlock>
    </PageContainer>
  );
}