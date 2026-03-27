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

function getPlatformSlugFromLabel(label: string) {
  if (label === "PC") return "pc";
  if (label === "Xbox") return "xbox";
  if (label === "PS") return "playstation";
  if (label === "Switch") return "switch";
  if (label === "Android") return "android";
  if (label === "iOS") return "ios";

  return null;
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

export default function GameCard({
  game,
  prioritizedPlatformSlug
}: {
  game: GameWithLive;
  prioritizedPlatformSlug?: string;
}) {
  const router = useRouter();
  const gameUrl = buildGamePath(game.id, game.slug);

  const hasLiveViewers =
    typeof game.twitchViewers === "number" && game.twitchViewers > 0;

  const orderedPlatforms = prioritizedPlatformSlug
    ? [
        ...(game.platforms ?? []).filter((platform) => {
          const label = normalizePlatform(platform);
          return getPlatformSlugFromLabel(label) === prioritizedPlatformSlug;
        }),
        ...(game.platforms ?? []).filter((platform) => {
          const label = normalizePlatform(platform);
          return getPlatformSlugFromLabel(label) !== prioritizedPlatformSlug;
        })
      ]
    : game.platforms ?? [];

  const uniqueOrderedPlatforms = orderedPlatforms.filter((platform, index, array) => {
    const label = normalizePlatform(platform);

    return (
      array.findIndex((candidate) => normalizePlatform(candidate) === label) === index
    );
  });

  return (
    <Link href={gameUrl} style={{ textDecoration: "none", color: "inherit" }}>
<article
  className="gameCard"
  style={{
    opacity:
      typeof game.aggregated_rating === "number" &&
      game.aggregated_rating < 60
        ? 0.65
        : 1,
    border:
      typeof game.aggregated_rating === "number" &&
      game.aggregated_rating >= 85
        ? "1px solid rgba(110,168,255,0.28)"
        : undefined,
    boxShadow:
      typeof game.aggregated_rating === "number" &&
      game.aggregated_rating >= 85
        ? "0 10px 30px rgba(110,168,255,0.10)"
        : undefined
  }}
>
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
                {uniqueOrderedPlatforms.slice(0, 2).map((platform) => {
                  const label = normalizePlatform(platform);

                  const platformSlug = getPlatformSlugFromLabel(label);

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
                        cursor: "pointer"
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

<div
  className="gameCardBody"
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  }}
>
          <h3
  className="gameCardTitle"
  style={{
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 800,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
    color: "#f5f7fb"
  }}
>
  {game.name}
</h3>

{formatReleaseDateForDisplay(game) && (
  <span
    className="gameCardDate"
    style={{
      display: "inline-block",
      marginTop: "6px",
      color: "#9aa3b2",
      fontSize: "0.84rem",
      fontWeight: 600,
      lineHeight: 1.4
    }}
  >
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
        marginTop: "8px",
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        padding: "6px 10px",
        borderRadius: "999px",
        border: "1px solid rgba(139,185,255,0.22)",
        background: "rgba(110,168,255,0.08)",
        fontSize: "0.8rem",
        fontWeight: 800,
        color: "#8bb9ff",
        lineHeight: 1.2
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
      display: "inline-flex",
      alignItems: "center",
      width: "fit-content",
      maxWidth: "100%",
      marginTop: "2px",
      padding: "5px 9px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: "0.8rem",
      fontWeight: 800,
      color: "#f5f7fb",
      lineHeight: 1.2
    }}
  >
    🔴 Live now · {formatViewerCount(game.twitchViewers!)} watching
  </div>
)}
        </div>
      </article>
    </Link>
  );
}