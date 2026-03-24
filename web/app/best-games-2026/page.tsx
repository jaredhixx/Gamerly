import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGamesByYearPage from "../../components/seo/BestGamesByYearPage";

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Best Games of 2026",
    description:
      "Discover the best games of 2026, including the top-rated releases across PC, PlayStation, Xbox, Switch, and more.",
    alternates: {
      canonical: buildCanonicalUrl("/best-games-2026"),
    },
  };
}

export default async function BestGames2026Page() {
  return (
    <BestGamesByYearPage
      year={2026}
      pageTitle="Best Games of 2026"
      pageSubtitle="Top-rated 2026 video game releases ranked by quality and popularity."
      introParagraphOne="The best games of 2026 will include the standout releases across every major platform, from major AAA launches to breakout games that earn strong review and player momentum. This page focuses on the strongest games released during 2026 and ranks them using quality and popularity signals."
      introParagraphTwo="If you want a fast way to find the most worth-playing games released in 2026, this page is built to surface the strongest options first. As the year develops and more games are released, this page can strengthen into a high-value long-term SEO asset."
      exploreHeading="Explore More 2026 Game Pages"
      topSectionHeading="Top Games Released in 2026"
      topSectionIntro="These are the standout games released in 2026 based on a blend of review strength and player interest. If you want to find the best games that came out in 2026, start here."
      fullListHeading="Full List of Best 2026 Games"
    />
  );
}