import { Metadata } from "next";
import Link from "next/link";
import { getGameById, fetchGames } from "../../../lib/igdb";
import { redirect, notFound } from "next/navigation";
import { buildCanonicalUrl } from "../../../lib/site";
import GameGrid from "../../../components/game/GameGrid";
import ScreenshotLightbox from "../../../components/game/ScreenshotLightbox";
import ExpandableSummary from "../../../components/game/ExpandableSummary";

export const revalidate = 3600;

function getPlatformHref(platform: string) {
  const value = platform.toLowerCase();

  if (value.includes("pc") || value.includes("windows")) {
    return "/platform/pc";
  }

  if (value.includes("playstation")) {
    return "/platform/playstation";
  }

  if (value.includes("xbox")) {
    return "/platform/xbox";
  }

  if (value.includes("switch") || value.includes("nintendo")) {
    return "/platform/switch";
  }

  if (value.includes("ios") || value.includes("iphone") || value.includes("ipad")) {
    return "/platform/ios";
  }

  if (value.includes("android")) {
    return "/platform/android";
  }

  return null;
}

function getGenreHref(genre: string) {
  const value = genre.toLowerCase();

  if (value.includes("rpg") || value.includes("role-playing")) {
    return "/genre/rpg";
  }

  if (value.includes("shooter")) {
    return "/genre/shooter";
  }

  if (value.includes("adventure")) {
    return "/genre/adventure";
  }

  if (value.includes("strategy")) {
    return "/genre/strategy";
  }

  if (value.includes("simulation")) {
    return "/genre/simulation";
  }

  if (value.includes("puzzle")) {
    return "/genre/puzzle";
  }

  if (value.includes("indie")) {
    return "/genre/indie";
  }

  if (value.includes("fighting")) {
    return "/genre/fighting";
  }

  if (value.includes("racing")) {
    return "/genre/racing";
  }

  if (value.includes("sport")) {
    return "/genre/sport";
  }

  return null;
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;

  const slugParam = params?.game;

  if (!slugParam) {
    return { title: "Game Not Found | Gamerly" };
  }

  const slugParts = slugParam.split("-");
  const id = Number(slugParts[0]);

  const game = await getGameById(id);

  if (!game) {
  notFound();
}

const correctSlug = `${game.id}-${game.slug}`;

if (slugParam !== correctSlug) {
  redirect(`/game/${correctSlug}`);
}

  if (!game) {
    return { title: "Game Not Found | Gamerly" };
  }

  return {
    title: `${game.name} Release Date & Platforms | Gamerly`,
    description:
      game.summary || `${game.name} game details and release info.`,
    alternates: {
      canonical: buildCanonicalUrl(`/game/${id}-${game.slug}`)
    }
  };
}

export default async function GamePage(props: any) {
  const params = await props.params;

  const slugParam = params?.game;

  if (!slugParam) {
    notFound();
  }

  const slugParts = slugParam.split("-");
  const id = Number(slugParts[0]);

  const game = await getGameById(id);
  const allGames = (await fetchGames()).slice(0, 120);

  if (!game) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: game.name,
            datePublished: game.releaseDate,
            image: game.coverUrl,
            gamePlatform: game.platforms,
            description: game.summary
          })
        }}
      />

      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.gamerly.net"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Games",
          item: "https://www.gamerly.net/new-games"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: game.name,
          item: `https://www.gamerly.net/game/${game.id}-${game.slug}`
        }
      ]
    })
  }}
/>

<main className="gamePage">
<h1 className="gameTitle">
  {game.name}
</h1>

        <div
          className="gameHero"
        >

          {game.coverUrl && (
<img
  src={game.coverUrl}
  alt={game.name}
  className="gameCover"
/>
          )}

          <div>
            <div style={{ marginBottom: "14px", fontSize: "15px", color: "#9aa3b2" }}>
              Release Date:{" "}
              {game.releaseDate
                ? new Date(
                    typeof game.releaseDate === "number"
                      ? game.releaseDate * 1000
                      : game.releaseDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })
                : "TBA"}
            </div>

<div className="gamePills">

  {game.platforms?.slice(0,3).map((platform: string) => {
    const href = getPlatformHref(platform);

    if (!href) {
      return (
        <span key={platform} className="gamePill">
          {platform}
        </span>
      );
    }

    return (
      <Link key={platform} href={href} className="gamePill">
        {platform}
      </Link>
    );
  })}

  {game.genres?.slice(0,2).map((genre: string) => {
    const href = getGenreHref(genre);

    if (!href) {
      return (
        <span key={genre} className="gamePill">
          {genre}
        </span>
      );
    }

    return (
      <Link key={genre} href={href} className="gamePill">
        {genre}
      </Link>
    );
  })}

</div>

{game.summary && (
  <ExpandableSummary summary={game.summary} />
)}
          </div>
        </div>

        {game.trailer && (
  <section className="gameSection">
    <h2>Trailer</h2>

    <div className="gameTrailer">
      <iframe
        src={game.trailer}
        title={`${game.name} trailer`}
        frameBorder="0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  </section>
)}

        {game.screenshots && game.screenshots.length > 0 && (
          <section style={{ marginTop: "48px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "18px"
              }}
            >
              Screenshots
            </h2>

<ScreenshotLightbox images={game.screenshots} />
          </section>
        )}

        {game.genres && game.genres.length > 0 && (
         <section className="gameSection">
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "20px"
              }}
            >
              More {game.genres[0]} Games
            </h2>

            <GameGrid
              games={allGames
                .filter(
                  (g) =>
                    g.id !== game.id &&
                    g.genres &&
                    g.genres.some((genre: string) => game.genres.includes(genre))
                )
                .slice(0, 8)}
            />
          </section>
        )}

        {game.platforms && game.platforms.length > 0 && (
         <section className="gameSection">
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "20px"
              }}
            >
              More {game.platforms[0]} Games
            </h2>

            <GameGrid
              games={allGames
                .filter(
                  (g) =>
                    g.id !== game.id &&
                    g.platforms &&
                    g.platforms.includes(game.platforms[0])
                )
                .slice(0, 8)}
            />
          </section>
        )}

        <section className="discoverList">
          <h2>Discover More Games</h2>

<ul>
  <li><Link href="/new-games">New Games</Link></li>
  <li><Link href="/upcoming-games">Upcoming Games</Link></li>
  <li><Link href="/games-releasing-this-month">Games Releasing This Month</Link></li>
  <li><Link href="/platform/pc">PC Games</Link></li>
  <li><Link href="/platform/playstation">PlayStation Games</Link></li>
  <li><Link href="/platform/xbox">Xbox Games</Link></li>
  <li><Link href="/genre/rpg">RPG Games</Link></li>
  <li><Link href="/genre/shooter">Shooter Games</Link></li>
</ul>
        </section>
      </main>
    </>
  );
}