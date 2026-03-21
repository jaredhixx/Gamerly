import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Gamerly, a video game discovery platform for new, upcoming, trending, and live games across all major platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/about"),
  },
};

export default function AboutPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          About Gamerly
        </h1>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Gamerly is a video game discovery platform built to help players find
          new, upcoming, trending, top rated, and live games across PC,
          PlayStation, Xbox, Nintendo Switch, and mobile platforms.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          The goal of Gamerly is simple: make it easier to discover games worth
          paying attention to without digging through multiple stores, launchers,
          and news sources.
        </p>

        <p style={{ lineHeight: 1.7 }}>
          Gamerly focuses on structured, searchable, indexable pages so users can
          browse games by release timing, platform, genre, and popularity.
        </p>
      </main>
    </PageContainer>
  );
}