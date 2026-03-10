"use client";

import Link from "next/link";

const platforms = [
  { name: "PC Games", slug: "pc" },
  { name: "Xbox Games", slug: "xbox" },
  { name: "PlayStation Games", slug: "playstation" },
  { name: "Switch Games", slug: "switch" }
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

    </section>
  );
}