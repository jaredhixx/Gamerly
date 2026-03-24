import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGamesByYearPage from "../../components/seo/BestGamesByYearPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Games of 2025",
    description:
      "Discover the best games of 2025, including the top-rated releases across PC, PlayStation, Xbox, Switch, and more.",
    alternates: {
      canonical: buildCanonicalUrl("/best-games-2025"),
    },
  };
}

export default async function BestGames2025Page() {
  return (
    <BestGamesByYearPage
      year={2025}
      pageTitle="Best Games of 2025"
      pageSubtitle="Top-rated 2025 video game releases ranked by quality and popularity."
      introParagraphOne="The best games of 2025 include the standout releases across every major platform, from big-budget blockbuster launches to critically acclaimed surprise hits. This page focuses on the strongest games released during 2025 and ranks them using quality and popularity signals."
      introParagraphTwo="If you want a fast way to find the most worth-playing games released in 2025, this page is built to surface the strongest options first. As more games are released and ratings mature, this list can continue to strengthen as a long-term SEO page."
      exploreHeading="Explore More 2025 Game Pages"
      topSectionHeading="Top Games Released in 2025"
      topSectionIntro="These are the standout games released in 2025 based on a blend of review strength and player interest. If you want to find the best games that came out in 2025, start here."
      fullListHeading="Full List of Best 2025 Games"
    />
  );
}