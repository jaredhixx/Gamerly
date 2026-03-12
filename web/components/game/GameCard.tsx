"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

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
{game.platforms?.slice(0, 2).map((platform) => {

  const label = normalizePlatform(platform);

  const platformSlug =
    label === "PC" ? "pc" :
    label === "Xbox" ? "xbox" :
    label === "PS" ? "playstation" :
    label === "Switch" ? "switch" :
    label === "Android" ? "android" :
    label === "iOS" ? "ios" :
    null;

  return (
    <button
      key={platform}
      className="gameCardPill gameCardPlatform"
      data-platform={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (platformSlug) {
          router.push(`/platform/${platformSlug}`);
        }
      }}
      style={{
        cursor: "pointer",
        border: "none",
        background: "none",
        padding: 0
      }}
    >
      {label}
    </button>
  );

})}
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

  {game.hypeScore && (
<div className="gameCardHype">
  <span className="hypeIcon"></span>
  <span className="hypeLabel">HYPE</span>
<span className="hypeScore">{game.hypeScore}</span>
</div>
  )}

</div>

      </article>
    </Link>
  );
}