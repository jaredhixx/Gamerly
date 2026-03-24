import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGamesByYearPage from "../../components/seo/BestGamesByYearPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Games of 2024",
    description:
      "Discover the best games of 2024, including the top-rated releases across PC, PlayStation, Xbox, Switch, and more.",
    alternates: {
      canonical: buildCanonicalUrl("/best-games-2024"),
    },
  };
}

export default async function BestGames2024Page() {
  return (
    <BestGamesByYearPage
      year={2024}
      pageTitle="Best Games of 2024"
      pageSubtitle="Top-rated 2024 video game releases ranked by quality and popularity."
      introParagraphOne="The best games of 2024 include standout releases across every major platform, from blockbuster launches to critically praised hits that built momentum throughout the year. This page focuses on the strongest games released during 2024 and ranks them using quality and popularity signals."
      introParagraphTwo="If you want a fast way to find the most worth-playing games released in 2024, this page is built to surface the strongest options first. It is designed to become a durable SEO page that can continue attracting search traffic over time."
      exploreHeading="Explore More 2024 Game Pages"
      topSectionHeading="Top Games Released in 2024"
      topSectionIntro="These are the standout games released in 2024 based on a blend of review strength and player interest. If you want to find the best games that came out in 2024, start here."
      fullListHeading="Full List of Best 2024 Games"
    />
  );
}