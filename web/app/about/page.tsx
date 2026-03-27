import type { Metadata } from "next";
import PageContainer from "../../components/layout/PageContainer";
import { buildCanonicalUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "About Gamerly",
  description:
    "Learn what Gamerly is, how it helps players discover games, and how the platform organizes new, upcoming, trending, top-rated, and live games across major platforms.",
  alternates: {
    canonical: buildCanonicalUrl("/about"),
  },
};

const sectionStyle = {
  marginBottom: "32px",
};

const headingStyle = {
  fontSize: "22px",
  fontWeight: 800,
  marginBottom: "12px",
};

const paragraphStyle = {
  lineHeight: 1.7,
  marginBottom: "16px",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <main style={{ padding: "40px 0", maxWidth: "840px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          About Gamerly
        </h1>

        <p style={paragraphStyle}>
          Gamerly is a video game discovery platform built to help players find
          games worth paying attention to across PC, PlayStation, Xbox, Nintendo
          Switch, and mobile platforms.
        </p>

        <p style={paragraphStyle}>
          Instead of forcing players to jump between storefronts, launchers,
          release calendars, and social feeds, Gamerly brings the most useful
          discovery paths into one place. The site is designed to make it easier
          to find new releases, upcoming games, live games, trending titles, and
          top-rated games through structured, searchable pages.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>What Gamerly helps you do</h2>

          <p style={paragraphStyle}>
            Gamerly helps players browse games by platform, genre, release timing,
            popularity, and overall quality signals. Whether you want to see what
            is releasing soon, what people are playing right now, or which games
            are standing out in a specific category, the goal is to make that
            process faster and clearer.
          </p>

          <p style={paragraphStyle}>
            The site is built around browseable pages that are easy to scan and
            easy to compare, so users can move from broad discovery to specific
            game pages without unnecessary friction.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>How Gamerly organizes games</h2>

          <p style={paragraphStyle}>
            Gamerly organizes games using structured pages for platforms, genres,
            release windows, and curated discovery views such as top-rated,
            trending, live, and best-of-year pages. This helps users explore the
            catalog in a way that feels practical instead of overwhelming.
          </p>

          <p style={paragraphStyle}>
            Rankings and page ordering are based on a mix of available game data,
            quality signals, popularity signals, release context, and page type.
            Different pages serve different discovery intent, so the ordering and
            presentation may vary depending on whether the goal is helping users
            find the biggest upcoming releases, high-quality recent games, or
            games currently drawing live attention.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Who Gamerly is for</h2>

          <p style={paragraphStyle}>
            Gamerly is for players who want a faster way to discover games without
            wasting time digging through scattered sources. It is especially useful
            for people who want to keep up with major releases, find new games in
            their favorite genres, or get a quick read on what is worth checking
            out next.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={headingStyle}>The goal of the platform</h2>

          <p style={paragraphStyle}>
            The goal of Gamerly is to become a reliable game discovery layer that
            helps users find relevant, high-interest games quickly and confidently.
            The focus is on clear organization, useful discovery paths, and pages
            that are easy to browse across a large and growing game catalog.
          </p>
        </section>
      </main>
    </PageContainer>
  );
}