"use client";

import Link from "next/link";
import Image from "next/image";
import { buildGamePath } from "../../lib/site";
import type { GamerlyGame } from "../../lib/igdb";

function normalizePlatform(platform: string) {

  if (platform.includes("Xbox")) return "Xbox";

  if (platform.includes("PlayStation")) return "PS";

  if (platform.includes("Switch")) return "Switch";

  if (platform.includes("PC")) return "PC";

  if (platform.includes("Android")) return "Android";

  if (platform.includes("iOS")) return "iOS";

  return "Other";
}

function normalizeGenre(genre: string) {

  const map: Record<string, string> = {
    "Role-playing (RPG)": "RPG",
    "Real Time Strategy (RTS)": "RTS",
    "Turn-based strategy (TBS)": "Strategy",
    "Hack and slash/Beat 'em up": "Action"
  };

  return map[genre] ?? genre;
}

export default function GameCard({ game }: { game: GamerlyGame }) {

  const gameUrl = buildGamePath(game.id, game.slug);

  return (
    <Link href={gameUrl} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="gameCard">

        <div className="gameCardImageWrap">

          {game.coverUrl && (
  <Image
    src={game.coverUrl}
    alt={game.name}
    width={600}
    height={800}
    className="gameCardImage"
    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
    priority={false}
  />
)}

          <div className="gameCardOverlay" />

          {/* Pills */}
<div className="gameCardPills">

  <div className="gameCardPillStack">

    <div className="gameCardPillGroup">
      {game.platforms?.slice(0, 2).map((platform) => (
        <span
          key={platform}
          className="gameCardPill gameCardPlatform"
          data-platform={normalizePlatform(platform)}
        >
          {normalizePlatform(platform)}
        </span>
      ))}
    </div>

    {game.genres?.[0] && (
      <div className="gameCardGenreRow">
        <span className="gameCardPill gameCardGenre">
          {normalizeGenre(game.genres[0])}
        </span>
      </div>
    )}

  </div>

{game.aggregated_rating && (() => {

  const score = Math.round(game.aggregated_rating);

  let ratingClass = "ratingMid";

  if (score >= 90) ratingClass = "ratingHigh";
  else if (score >= 75) ratingClass = "ratingGood";
  else if (score < 60) ratingClass = "ratingLow";

  return (
    <div className={`gameCardRating ${ratingClass}`}>
      ★ {score}
    </div>
  );

})()}

</div>

        </div>

        <div className="gameCardBody">

          {game.hypeScore && (
  <div className="gameCardHype">
    🔥 Hype {game.hypeScore}
  </div>
)}

          <h3 className="gameCardTitle">
            {game.name}
          </h3>

          {game.releaseDate && (
            <span className="gameCardDate">
              {new Date(
                typeof game.releaseDate === "number"
                  ? game.releaseDate * 1000
                  : game.releaseDate
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </span>
          )}

        </div>

      </article>
    </Link>
  );
}