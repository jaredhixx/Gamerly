"use client";

import Link from "next/link";
import { buildGamePath } from "../../lib/site";
import type { GamerlyGame } from "../../lib/igdb";

type Props = {
  featured: GamerlyGame;
  upcoming: GamerlyGame;
  trending: GamerlyGame;
};

export default function FeaturedHero({
  featured,
  upcoming,
  trending
}: Props) {

  const featuredUrl = buildGamePath(featured.id, featured.slug);
  const upcomingUrl = buildGamePath(upcoming.id, upcoming.slug);
  const trendingUrl = buildGamePath(trending.id, trending.slug);

  return (
    <section className="heroGrid">

      {/* Featured Game */}

      <Link href={featuredUrl}>

        <div className="heroCard">

          {featured.coverUrl && (
            <img
              src={featured.coverUrl}
              alt={featured.name}
            />
          )}

          <div className="heroOverlay" />

          <div className="heroContent">

            <div className="heroLabel">
              Featured Game
            </div>

            <h2 className="heroTitle">
              {featured.name}
            </h2>

          </div>

        </div>

      </Link>


      {/* Right Column */}

      <div className="heroSideColumn">

        {/* Upcoming */}

        <Link href={upcomingUrl}>

          <div className="heroSideCard">

            {upcoming.coverUrl && (
              <img
                src={upcoming.coverUrl}
                alt={upcoming.name}
              />
            )}

            <div className="heroSideContent">

              <div className="heroSideLabel">
                Upcoming
              </div>

              <div className="heroSideTitle">
                {upcoming.name}
              </div>

            </div>

          </div>

        </Link>


        {/* Trending */}

        <Link href={trendingUrl}>

          <div className="heroSideCard">

            {trending.coverUrl && (
              <img
                src={trending.coverUrl}
                alt={trending.name}
              />
            )}

            <div className="heroSideContent">

              <div className="heroSideLabel">
                Trending
              </div>

              <div className="heroSideTitle">
                {trending.name}
              </div>

            </div>

          </div>

        </Link>

      </div>

    </section>
  );
}