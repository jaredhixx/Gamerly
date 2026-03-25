import { Metadata } from "next";
import Link from "next/link";
import { getDerivedGameData } from "../../lib/game-data";
import GameGrid from "../../components/game/GameGrid";

export const metadata: Metadata = {
  title: "Video Game Platforms",
  description:
    "Discover video games by platform including PC, PlayStation, Xbox, Nintendo Switch, iOS, and Android."
};

const platforms = [
  { name: "PC Games", slug: "pc" },
  { name: "PlayStation Games", slug: "playstation" },
  { name: "Xbox Games", slug: "xbox" },
  { name: "Nintendo Switch Games", slug: "switch" },
  { name: "iOS Games", slug: "ios" },
  { name: "Android Games", slug: "android" }
];

const bestPlatformLinks = {
  pc: [
    { href: "/best-pc-games-2025", label: "Best PC Games of 2025" },
    { href: "/best-rpg-games-pc-2025", label: "Best PC RPG Games of 2025" },
    { href: "/best-shooter-games-pc-2025", label: "Best PC Shooter Games of 2025" }
  ],
  playstation: [
    { href: "/best-rpg-games-playstation-2025", label: "Best PlayStation RPG Games of 2025" },
    { href: "/best-shooter-games-playstation-2025", label: "Best PlayStation Shooter Games of 2025" },
    { href: "/best-adventure-games-playstation-2025", label: "Best PlayStation Adventure Games of 2025" }
  ],
  xbox: [
    { href: "/best-rpg-games-xbox-2025", label: "Best Xbox RPG Games of 2025" },
    { href: "/best-shooter-games-xbox-2025", label: "Best Xbox Shooter Games of 2025" },
    { href: "/best-adventure-games-xbox-2025", label: "Best Xbox Adventure Games of 2025" }
  ],
  switch: [
    { href: "/best-rpg-games-switch-2025", label: "Best Switch RPG Games of 2025" },
    { href: "/best-shooter-games-switch-2025", label: "Best Switch Shooter Games of 2025" },
    { href: "/best-adventure-games-switch-2025", label: "Best Switch Adventure Games of 2025" }
  ]
} as const;

export default async function PlatformsPage() {
  const { games } = await getDerivedGameData();

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "30px" }}>
        Browse Video Games by Platform
      </h1>

      {platforms.map((platform) => {
        const platformGames = games
          .filter((g) => g.platformSlugs?.includes(platform.slug as any))
          .slice(0, 8);

        if (platformGames.length === 0) return null;

        return (
          <section key={platform.slug} style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
              {platform.name}
            </h2>

            <GameGrid games={platformGames} />

<div style={{ marginTop: "16px" }}>
  <Link
    href={`/platform/${platform.slug}`}
    style={{
      color: "#6aa6ff",
      textDecoration: "none",
      fontWeight: 600
    }}
  >
    Browse all {platform.name} →
  </Link>
</div>

{platform.slug in bestPlatformLinks && (
  <div style={{ marginTop: "14px" }}>
    <div
      style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#dbe9ff",
        marginBottom: "8px"
      }}
    >
      Best of 2025
    </div>

    <div
      style={{
        display: "grid",
        gap: "8px"
      }}
    >
      {bestPlatformLinks[platform.slug as keyof typeof bestPlatformLinks].map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            color: "#8bb9ff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: 1.5
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
)}
          </section>
        );
      })}
    </main>
  );
}