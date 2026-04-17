"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageContainer from "./PageContainer";

const primaryLinks = [
  { href: "/new-games", label: "New" },
  { href: "/upcoming-games", label: "Upcoming" },
  { href: "/new-games-this-month", label: "This Month" },
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
  { name: "Indie", slug: "indie" },
  { name: "Sports", slug: "sport" },
  { name: "Racing", slug: "racing" },
  { name: "Fighting", slug: "fighting" }
];

export default function SiteHeader() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
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
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <header className="siteHeader">
      <PageContainer>
        <div className="siteHeaderInner">
          <div className="siteHeaderLeft">
            <Link
              href="/"
              className="siteLogo"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gamerly
              <span className="logoPulse"></span>
            </Link>
          </div>

          <div className="siteHeaderCenter">
            <div className="siteSearch">
              <div className="siteSearchShell">
                <input
                  type="text"
                  placeholder="Search games..."
                  className="siteSearchInput"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim().length > 1) {
                      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                    }
                  }}
                />

                <button
                  type="button"
                  className="siteSearchButton"
                  onClick={() => {
                    if (query.trim().length > 1) {
                      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                    }
                  }}
                  aria-label="Search games"
                >
                  Search
                </button>
              </div>

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
                        setMobileMenuOpen(false);
                      }}
                    >
                      {game.cover && (
                        <img
                          src={game.cover}
                          alt={game.name}
                          className="searchResultImage"
                        />
                      )}

                      <span className="searchResultTitle">{game.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`siteNav ${mobileMenuOpen ? "siteNavOpen" : ""}`}>
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="siteNavLink"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="dropdown">
              <Link
                href="/platforms"
                className="dropdownLabel"
                onClick={() => setMobileMenuOpen(false)}
              >
                Platforms <span className="navCaret">▾</span>
              </Link>

              <div className="dropdownMenu">
                {platforms.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/platform/${p.slug}`}
                    className="dropdownItem"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="dropdown">
              <Link
                href="/genres"
                className="dropdownLabel"
                onClick={() => setMobileMenuOpen(false)}
              >
                Genres <span className="navCaret">▾</span>
              </Link>

              <div className="dropdownMenu">
                {genres.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    className="dropdownItem"
                    onClick={() => setMobileMenuOpen(false)}
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