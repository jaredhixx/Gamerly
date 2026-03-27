import Link from "next/link";
import PageContainer from "../layout/PageContainer";
import SectionHeading from "../ui/SectionHeading";
import GameGrid from "../game/GameGrid";
import { fetchGames } from "../../lib/igdb";
import type { PlatformSlug } from "../../lib/platforms";

type Props = {
  year: number;
  platformSlug: PlatformSlug;
  pageTitle: string;
  pageSubtitle: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  exploreHeading: string;
  topSectionHeading: string;
  topSectionIntro: string;
  fullListHeading: string;
};

export default async function BestPlatformGamesByYearPage({
  year,
  platformSlug,
  pageTitle,
  pageSubtitle,
  introParagraphOne,
  introParagraphTwo,
  exploreHeading,
  topSectionHeading,
  topSectionIntro,
  fullListHeading
}: Props) {
  const games = await fetchGames();

  const matchingGames = games.filter((game) => {
    if (!game.releaseDate) {
      return false;
    }

    const releaseDate = new Date(game.releaseDate);

    if (releaseDate > new Date()) {
      return false;
    }

    const releaseYear = releaseDate.getUTCFullYear();
    const rating = game.aggregated_rating ?? 0;
    const ratingCount = game.aggregated_rating_count ?? 0;
    const hasPlatform = game.platformSlugs?.includes(platformSlug);

    return (
      releaseYear === year &&
      hasPlatform &&
      rating >= 70 &&
      ratingCount >= 1
    );
  });

  const sortedGames = [...matchingGames].sort((a, b) => {
    const ratingA = a.aggregated_rating ?? 0;
    const ratingB = b.aggregated_rating ?? 0;
    const countA = a.aggregated_rating_count ?? 0;
    const countB = b.aggregated_rating_count ?? 0;

    const scoreA = ratingA + Math.min(countA, 20) * 0.35;
    const scoreB = ratingB + Math.min(countB, 20) * 0.35;

    const scoreDiff = scoreB - scoreA;

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const ratingDiff = ratingB - ratingA;

    if (ratingDiff !== 0) {
      return ratingDiff;
    }

    const countDiff = countB - countA;

    if (countDiff !== 0) {
      return countDiff;
    }

    return (
      new Date(b.releaseDate || "").getTime() -
      new Date(a.releaseDate || "").getTime()
    );
  });

  const topPicks = sortedGames.slice(0, 12);
  const fullList = sortedGames.slice(0, 60);

  return (
    <PageContainer>
      <SectionHeading title={pageTitle} subtitle={pageSubtitle} />

<div style={{ maxWidth: "800px", marginBottom: "40px" }}>
  <p>{introParagraphOne}</p>
  <p>{introParagraphTwo}</p>

  <p style={{ marginTop: "16px" }}>
  <strong>How these games are ranked:</strong> Rankings are based on a combination of
  critic scores, player interest, and overall release impact. Games with stronger
  review performance, higher engagement, and more lasting relevance are prioritized
  higher on the list, while lower-signal or newly released titles may appear lower
  until more data becomes available.
</p>

<p>
  This page tracks the best{" "}
  <Link href={`/best-games-${year}`} style={{ color: "#8bb9ff", fontWeight: 600 }}>
    games of {year}
  </Link>{" "}
  on{" "}
  <Link href={`/platform/${platformSlug}`} style={{ color: "#8bb9ff", fontWeight: 600 }}>
    {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug}
  </Link>{" "}
  using released titles that have already started to separate themselves through review scores, audience response, and overall visibility.
</p>

  <p>
    If you want the strongest games available on {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} in {year}, this list is built to surface the titles with the clearest quality signals while filtering out unreleased or low-signal entries.
  </p>
</div>

<section style={{ marginBottom: "40px" }}>
  <h2>{exploreHeading}</h2>

  <ul style={{ paddingLeft: "20px", margin: "16px 0 0" }}>
    <li>
      <Link href={`/platform/${platformSlug}`}>
        Browse all {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} games
      </Link>
    </li>
    <li>
      <Link href={`/best-rpg-games-${platformSlug}-${year}`}>
        Best RPG games on {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} in {year}
      </Link>
    </li>
    <li>
      <Link href={`/best-shooter-games-${platformSlug}-${year}`}>
        Best shooter games on {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} in {year}
      </Link>
    </li>
    <li>
      <Link href={`/best-adventure-games-${platformSlug}-${year}`}>
        Best adventure games on {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} in {year}
      </Link>
    </li>
    <li>
      <Link href={`/best-strategy-games-${platformSlug}-${year}`}>
        Best strategy games on {platformSlug === "pc" ? "PC" : platformSlug === "playstation" ? "PlayStation" : platformSlug === "xbox" ? "Xbox" : platformSlug === "switch" ? "Switch" : platformSlug} in {year}
      </Link>
    </li>
  </ul>
</section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{topSectionHeading}</h2>

        <p style={{ maxWidth: "800px", marginBottom: "20px" }}>
          {topSectionIntro}
        </p>

        {topPicks.length > 0 ? (
          <GameGrid
            games={topPicks}
            prioritizedPlatformSlug={platformSlug}
          />
        ) : (
          <p>No strong ranked platform games are available for this year yet.</p>
        )}
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>{fullListHeading}</h2>

        {fullList.length > 0 ? (
          <GameGrid
            games={fullList}
            prioritizedPlatformSlug={platformSlug}
          />
        ) : (
          <p>No strong ranked platform games are available for this year yet.</p>
        )}
      </section>
    </PageContainer>
  );
}