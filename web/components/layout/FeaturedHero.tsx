"use client";

import Link from "next/link";
import { buildGamePath } from "../../lib/site";
import type { GamerlyGame } from "../../lib/igdb";

type Props = {
  featured: GamerlyGame;
  upcoming: GamerlyGame;
  viewerCount?: number;
};

function formatPlatforms(platforms?: string[]) {
  if (!platforms || platforms.length === 0) return null;
  return platforms.slice(0, 3).join(" • ");
}

function formatReleaseDate(date?: string | null) {
  if (!date) return null;

  const d = new Date(date);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function FeaturedHero({
  featured,
  upcoming,
  viewerCount
}: Props) {
  if (!featured || !upcoming) {
    return null;
  }

  const featuredUrl = buildGamePath(featured.id, featured.slug);
  const upcomingUrl = buildGamePath(upcoming.id, upcoming.slug);

  const featuredPlatforms = formatPlatforms(featured.platforms);
  const upcomingPlatforms = formatPlatforms(upcoming.platforms);

  const upcomingDate = formatReleaseDate(upcoming.releaseDate);

  const featuredLabel =
    viewerCount && viewerCount > 0
      ? "#1 Hype Game Right Now"
      : "Featured Pick";

  return (
    <section className="heroGrid">
      <Link href={featuredUrl} className="heroLink">
        <div className="heroCard">
          {featured.coverUrl && (
            <img
              src={featured.coverUrl}
              alt={featured.name}
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
              ref={(img) => {
                if (img && img.complete) {
                  img.classList.add("loaded");
                }
              }}
            />
          )}

          <div className="heroContent">
            <div
              className="heroLabel"
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(6px)",
                fontWeight: 600
              }}
            >
              {featuredLabel}
            </div>

            {viewerCount && viewerCount > 0 && (
              <div className="heroLiveBadge">
                🔴 Live on Twitch • {viewerCount.toLocaleString()} viewers
              </div>
            )}

            <h2 className="heroTitle">{featured.name}</h2>

            {featuredPlatforms && (
              <div className="heroMeta">{featuredPlatforms}</div>
            )}
          </div>
        </div>
      </Link>

      <div className="heroSideColumn">
        <Link href={upcomingUrl} className="heroLink">
          <div className="heroSideCard">
            {upcoming.coverUrl && (
              <img
                src={upcoming.coverUrl}
                alt={upcoming.name}
                onLoad={(e) => e.currentTarget.classList.add("loaded")}
              />
            )}

            <div className="heroSideContent">
              <div className="heroSideLabel">Upcoming Pick</div>

              <div className="heroSideTitle">{upcoming.name}</div>

              {upcomingPlatforms && (
                <div className="heroSideMeta">{upcomingPlatforms}</div>
              )}

              {upcomingDate && (
                <div className="heroSideDate">Releases {upcomingDate}</div>
              )}
            </div>
          </div>
        </Link>

        <Link
          href="/upcoming-games"
          className="heroLink"
          style={{ textDecoration: "none" }}
        >
          <div
            className="heroSideCard"
            style={{
              minHeight: "unset",
              padding: "20px",
              display: "grid",
              gap: "10px",
              alignContent: "center"
            }}
          >
            <div
              className="heroSideLabel"
              style={{ marginBottom: 0 }}
            >
              What to do next
            </div>

            <div
              className="heroSideTitle"
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.35
              }}
            >
              See everything releasing soon
            </div>

            <div
              className="heroSideMeta"
              style={{
                lineHeight: 1.6
              }}
            >
              Jump into the full upcoming releases page when you want more than
              one featured pick.
            </div>

            <div
              style={{
                color: "#8bb9ff",
                fontWeight: 800
              }}
            >
              Browse upcoming games →
            </div>
          </div>
        </Link>
      </div>

    </section>
  );
}