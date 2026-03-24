"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buildGamePath } from "../../lib/site";
import type { GamerlyGame } from "../../lib/igdb";

type GameWithLive = GamerlyGame & {
  twitchViewers?: number;
};

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

function formatReleaseDateForDisplay(game: {
  releaseDate?: string | null;
  releaseDateDisplay?: string | null;
}) {
  if (game.releaseDateDisplay) {
    return game.releaseDateDisplay;
  }

  if (!game.releaseDate) {
    return null;
  }

  const date = new Date(game.releaseDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatViewerCount(viewers: number) {
  if (viewers >= 1000000) {
    return (viewers / 1000000).toFixed(1) + "M";
  }

  if (viewers >= 1000) {
    return (viewers / 1000).toFixed(1) + "K";
  }

  return String(viewers);
}

function getDaysUntilRelease(date?: string | null): number | null {
  if (!date) return null;

  const now = new Date().getTime();
  const release = new Date(date).getTime();

  if (Number.isNaN(release)) return null;

  const diff = release - now;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getHypeLabel(score?: number | null): string | null {
  if (!score) return null;

if (score >= 85) return "Highly Anticipated";
if (score >= 70) return "Trending";
if (score >= 50) return "Worth Watching";

  return null;
}

export default function GameCard({ game }: { game: GameWithLive }) {
  const router = useRouter();
  const gameUrl = buildGamePath(game.id, game.slug);

  const hasLiveViewers =
    typeof game.twitchViewers === "number" && game.twitchViewers > 0;

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

          <div className="gameCardPills">
            <div className="gameCardPillStack">
              <div className="gameCardPillGroup">
                {game.platforms?.slice(0, 2).map((platform) => {
                  const label = normalizePlatform(platform);

                  const platformSlug =
                    label === "PC"
                      ? "pc"
                      : label === "Xbox"
                      ? "xbox"
                      : label === "PS"
                      ? "playstation"
                      : label === "Switch"
                      ? "switch"
                      : label === "Android"
                      ? "android"
                      : label === "iOS"
                      ? "ios"
                      : null;

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
          <h3 className="gameCardTitle">{game.name}</h3>

          {formatReleaseDateForDisplay(game) && (
            <span className="gameCardDate">
              {formatReleaseDateForDisplay(game)}
            </span>
          )}

{(() => {
  const days = getDaysUntilRelease(game.releaseDate);
  const label = getHypeLabel(game.hypeScore);

  if (!days && !label) return null;

  let text = "";

  if (label && days !== null && days > 0 && days <= 30) {
    text = `${label} • ${days === 0 ? "Releases today" : `Releases in ${days} day${days === 1 ? "" : "s"}`}`;
  } else if (label) {
    text = label;
  } else if (days !== null) {
    if (days === 0) text = "Releases today";
    else if (days > 0 && days <= 30) {
      text = `Releases in ${days} day${days === 1 ? "" : "s"}`;
    }
  }

  if (!text) return null;

  return (
    <div
      style={{
        marginTop: "6px",
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#8bb9ff"
      }}
    >
      {text}
    </div>
  );
})()}

          {hasLiveViewers && (
<div
  className="gameCardLive"
  style={{
    marginTop: "6px",
    fontWeight: 700,
    color: "#f5f7fb"
  }}
>
  🔴 {formatViewerCount(game.twitchViewers!)} watching
</div>
)}
        </div>
      </article>
    </Link>
  );
}