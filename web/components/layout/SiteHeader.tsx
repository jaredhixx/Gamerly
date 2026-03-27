"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageContainer from "./PageContainer";

const primaryLinks = [
  { href: "/new-games", label: "New" },
  { href: "/upcoming-games", label: "Upcoming" },
  { href: "/games-releasing-this-month", label: "This Month" },
  { href: "/top-rated", label: "Top Rated" },
  { href: "/hype", label: "Hype" }
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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search-data?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Search request failed");
        }

        const data = await res.json();
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search data failed to load", err);
          setResults([]);
        }
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);


  return (
<header className="siteHeader">
      <PageContainer>
<div className="siteHeaderInner">

<Link href="/" className="siteLogo">
  Gamerly
  <span className="logoPulse"></span>
</Link>

<div className="siteSearch">
<input
  type="text"
  placeholder="Search games..."
  className="siteSearchInput"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && query.trim().length > 1) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }}
/>

{results.length > 0 && (
  <div className="searchDropdown">
{results.map((game) => (
  <Link
    key={game.id}
    href={`/game/${game.id}-${game.slug}`}
    className="searchResult"
    onClick={() => {
      setQuery("");
      setResults([]);
    }}
  >

    {game.cover && (
      <img
        src={game.cover}
        alt={game.name}
        className="searchResultImage"
      />
    )}

    <span className="searchResultTitle">
      {game.name}
    </span>

  </Link>
))}
  </div>
)}
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