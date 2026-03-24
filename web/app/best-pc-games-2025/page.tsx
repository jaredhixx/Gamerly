import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestPlatformGamesByYearPage from "../../components/seo/BestPlatformGamesByYearPage";
import { bestPlatformGamesByYearContent } from "../../lib/best-platform-games-by-year";

export const revalidate = 21600;

const content = bestPlatformGamesByYearContent.pc[2025];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: content.pageTitle,
    description: content.description,
    alternates: {
      canonical: buildCanonicalUrl("/best-pc-games-2025"),
    },
  };
}

export default async function BestPcGames2025Page() {
  return (
    <BestPlatformGamesByYearPage
      year={2025}
      platformSlug="pc"
      pageTitle={content.pageTitle}
      pageSubtitle={content.pageSubtitle}
      introParagraphOne={content.introParagraphOne}
      introParagraphTwo={content.introParagraphTwo}
      exploreHeading={content.exploreHeading}
      topSectionHeading={content.topSectionHeading}
      topSectionIntro={content.topSectionIntro}
      fullListHeading={content.fullListHeading}
    />
  );
}