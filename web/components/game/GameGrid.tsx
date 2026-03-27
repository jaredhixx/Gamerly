import GameCard from "./GameCard";
import type { GamerlyGame } from "../../lib/igdb";

type Props = {
  games: GamerlyGame[];
  prioritizedPlatformSlug?: string;
};

export default function GameGrid({
  games,
  prioritizedPlatformSlug
}: Props) {
  return (
    <div className="gameGrid">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          prioritizedPlatformSlug={prioritizedPlatformSlug}
        />
      ))}
    </div>
  );
}