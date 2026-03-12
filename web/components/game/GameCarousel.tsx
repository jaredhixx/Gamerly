"use client";

import { useRef } from "react";
import GameGrid from "./GameGrid";
import type { GamerlyGame } from "../../lib/igdb";

type Props = {
  games: GamerlyGame[];
  cardWidth?: number;
};

export default function GameCarousel({
  games,
  cardWidth = 240
}: Props) {

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
scrollRef.current.scrollBy({
  left: -(cardWidth * 2),
  behavior: "smooth"
});
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
scrollRef.current.scrollBy({
  left: cardWidth * 2,
  behavior: "smooth"
});
  };

  return (
    <div className="carouselWrapper">

      <button
        className="carouselArrow left"
        onClick={scrollLeft}
      >
        ‹
      </button>

      <div
        className="carousel"
        ref={scrollRef}
      >
        <GameGrid games={games} />
      </div>

      <button
        className="carouselArrow right"
        onClick={scrollRight}
      >
        ›
      </button>

    </div>
  );

}