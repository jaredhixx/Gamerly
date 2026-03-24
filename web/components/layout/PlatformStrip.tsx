"use client";

import Link from "next/link";

const platforms = [
  { name: "PC Games", slug: "pc" },
  { name: "Xbox Games", slug: "xbox" },
  { name: "PlayStation Games", slug: "playstation" },
  { name: "Switch Games", slug: "switch" }
];

const featuredPlatformLinks = [
  { label: "Upcoming PC Games", href: "/platform/pc/upcoming" },
  { label: "New PC Games", href: "/platform/pc/new" },
  { label: "Top Rated PC Games", href: "/platform/pc/top-rated" }
];

export default function PlatformStrip() {
  return (
    <section className="platformStrip">
      <div className="platformStripTitle">
        Browse by Platform
      </div>

      <div className="platformStripDivider" />

      <div className="platformGrid">
        {platforms.map((platform) => (
          <Link
            key={platform.slug}
            href={`/platform/${platform.slug}`}
            className="platformCard"
          >
            {platform.name}
          </Link>
        ))}
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        {featuredPlatformLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: "#8bb9ff",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}