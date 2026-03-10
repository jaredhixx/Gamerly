import GameCard from "./GameCard";
import type { GamerlyGame } from "../../lib/igdb";

export default function GameGrid({ games }: { games: GamerlyGame[] }) {
return (
  <div className="gameGrid">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}