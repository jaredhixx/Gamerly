"use client";

import Link from "next/link";
import Image from "next/image";
import { buildGamePath } from "../../lib/site";
import type { GamerlyGame } from "../../lib/igdb";

type Props = {
  featured: GamerlyGame;
  upcoming: GamerlyGame;
  trending: GamerlyGame;
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
  trending
}: Props) {
  if (!featured || !upcoming || !trending) {
    return null;
  }

  const featuredUrl = buildGamePath(featured.id, featured.slug);
  const upcomingUrl = buildGamePath(upcoming.id, upcoming.slug);
  const trendingUrl = buildGamePath(trending.id, trending.slug);

  const featuredPlatforms = formatPlatforms(featured.platforms);
  const upcomingPlatforms = formatPlatforms(upcoming.platforms);
  const trendingPlatforms = formatPlatforms(trending.platforms);

  const upcomingDate = formatReleaseDate(upcoming.releaseDate);

  return (
    <section className="heroGrid">

      {/* Featured Game */}

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

            <div className="heroLabel">
              Featured Game
            </div>

            <h2 className="heroTitle">
              {featured.name}
            </h2>

            {featuredPlatforms && (
              <div className="heroMeta">
                {featuredPlatforms}
              </div>
            )}

          </div>

        </div>

      </Link>


      {/* Right Column */}

      <div className="heroSideColumn">

        {/* Upcoming */}

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

              <div className="heroSideLabel">
                Upcoming
              </div>

              <div className="heroSideTitle">
                {upcoming.name}
              </div>

              {upcomingPlatforms && (
                <div className="heroSideMeta">
                  {upcomingPlatforms}
                </div>
              )}

              {upcomingDate && (
                <div className="heroSideDate">
                  Releases {upcomingDate}
                </div>
              )}

            </div>

          </div>

        </Link>


        {/* Trending */}

        <Link href={trendingUrl} className="heroLink">

          <div className="heroSideCard">

            {trending.coverUrl && (
              <img
  src={trending.coverUrl}
  alt={trending.name}
  onLoad={(e) => e.currentTarget.classList.add("loaded")}
/>
            )}

            <div className="heroOverlay" />

            <div className="heroSideContent">

              <div className="heroSideLabel">
                Trending
              </div>

              <div className="heroSideTitle">
                {trending.name}
              </div>

              {trendingPlatforms && (
                <div className="heroSideMeta">
                  {trendingPlatforms}
                </div>
              )}

            </div>

          </div>

        </Link>

      </div>

    </section>
  );
}