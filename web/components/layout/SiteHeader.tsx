"use client";

import Link from "next/link";
import PageContainer from "./PageContainer";

const primaryLinks = [
  { href: "/new-games", label: "New" },
  { href: "/upcoming-games", label: "Upcoming" },
  { href: "/games-releasing-this-month", label: "This Month" },
  { href: "/top-rated", label: "Top Rated" },
  { href: "/hype", label: "🔥 Hype" }
];

const platforms = [
  { name: "PC", slug: "pc" },
  { name: "PlayStation", slug: "playstation" },
  { name: "Xbox", slug: "xbox" },
  { name: "Switch", slug: "switch" }
];

const genres = [
  { name: "RPG", slug: "rpg" },
  { name: "Shooter", slug: "shooter" },
  { name: "Strategy", slug: "strategy" },
  { name: "Adventure", slug: "adventure" },
  { name: "Simulation", slug: "simulation" },
  { name: "Puzzle", slug: "puzzle" },
  { name: "Indie", slug: "indie" }
];

export default function SiteHeader() {
  return (
<header className="siteHeader">
      <PageContainer>
<div className="siteHeaderInner">

<Link href="/" className="siteLogo">
  Gamerly
</Link>

<div className="siteSearch">
  <input
    type="text"
    placeholder="Search games..."
    className="siteSearchInput"
  />
</div>

<nav className="siteNav">
  {primaryLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="siteNavLink"
    >
      {link.label}
    </Link>
  ))}

<div className="dropdown">
  <Link href="/platforms" className="dropdownLabel">
    Platforms <span className="navCaret">▾</span>
  </Link>

              <div className="dropdownMenu">
                {platforms.map((p) => (
                  <Link
  key={p.slug}
  href={`/platform/${p.slug}`}
  className="dropdownItem"
>
  {p.name}
</Link>
                ))}
              </div>
            </div>

<div className="dropdown">
  <Link href="/genres" className="dropdownLabel">
    Genres <span className="navCaret">▾</span>
  </Link>

              <div className="dropdownMenu">
                {genres.map((g) => (
                  <Link
  key={g.slug}
  href={`/genre/${g.slug}`}
  className="dropdownItem"
>
  {g.name}
</Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}