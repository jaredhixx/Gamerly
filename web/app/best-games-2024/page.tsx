import { Metadata } from "next";
import { buildCanonicalUrl } from "../../lib/site";
import BestGamesByYearPage from "../../components/seo/BestGamesByYearPage";
import { bestGamesByYearContent } from "../../lib/best-games-by-year";

export const revalidate = 21600;

const content = bestGamesByYearContent[2024];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: content.pageTitle,
    description: content.description,
    alternates: {
      canonical: buildCanonicalUrl("/best-games-2024"),
    },
  };
}

export default async function BestGames2024Page() {
  return (
    <BestGamesByYearPage
      year={2024}
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