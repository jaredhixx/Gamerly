import { Metadata } from "next";
import { notFound } from "next/navigation";
import BestGamesByYearPage from "../../components/seo/BestGamesByYearPage";
import BestGenreGamesPage from "../../components/seo/BestGenreGamesPage";
import BestPlatformGamesByYearPage from "../../components/seo/BestPlatformGamesByYearPage";
import BestGenrePlatformGamesByYearPage from "../../components/seo/BestGenrePlatformGamesByYearPage";
import {
  bestPagesRegistry,
  getBestPageBySlug,
} from "../../lib/best-pages-registry";
import { buildCanonicalUrl } from "../../lib/site";

export const revalidate = 21600;

export async function generateStaticParams() {
  return bestPagesRegistry.map((page) => ({
    bestPageSlug: page.slug,
  }));
}

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const bestPageSlug = params?.bestPageSlug;
  const page = getBestPageBySlug(bestPageSlug);

  if (!page) {
    return {
      title: "Best Games",
    };
  }

  return {
    title: page.pageTitle,
    description: page.description,
    alternates: {
      canonical: buildCanonicalUrl(page.canonicalPath),
    },
  };
}

export default async function BestPageSlugRoute(props: any) {
  const params = await props.params;
  const bestPageSlug = params?.bestPageSlug;
  const page = getBestPageBySlug(bestPageSlug);

  if (!page) {
    notFound();
  }

  if (page.type === "year") {
    return (
      <BestGamesByYearPage
        year={page.year}
        pageTitle={page.pageTitle}
        pageSubtitle={page.pageSubtitle}
        introParagraphOne={page.introParagraphOne}
        introParagraphTwo={page.introParagraphTwo}
        exploreHeading={page.exploreHeading}
        topSectionHeading={page.topSectionHeading}
        topSectionIntro={page.topSectionIntro}
        fullListHeading={page.fullListHeading}
      />
    );
  }

  if (page.type === "genre") {
    return (
      <BestGenreGamesPage
        genreSlug={page.genreSlug}
        pageTitle={page.pageTitle}
        pageSubtitle={page.pageSubtitle}
        introParagraphOne={page.introParagraphOne}
        introParagraphTwo={page.introParagraphTwo}
        exploreHeading={page.exploreHeading}
        topSectionHeading={page.topSectionHeading}
        topSectionIntro={page.topSectionIntro}
        fullListHeading={page.fullListHeading}
      />
    );
  }

  if (page.type === "platform-year") {
    return (
      <BestPlatformGamesByYearPage
        year={page.year}
        platformSlug={page.platformSlug}
        pageTitle={page.pageTitle}
        pageSubtitle={page.pageSubtitle}
        introParagraphOne={page.introParagraphOne}
        introParagraphTwo={page.introParagraphTwo}
        exploreHeading={page.exploreHeading}
        topSectionHeading={page.topSectionHeading}
        topSectionIntro={page.topSectionIntro}
        fullListHeading={page.fullListHeading}
      />
    );
  }

  if (page.type === "genre-platform-year") {
    return (
      <BestGenrePlatformGamesByYearPage
        year={page.year}
        genreSlug={page.genreSlug}
        platformSlug={page.platformSlug}
        pageTitle={page.pageTitle}
        pageSubtitle={page.pageSubtitle}
        introParagraphOne={page.introParagraphOne}
        introParagraphTwo={page.introParagraphTwo}
        exploreHeading={page.exploreHeading}
        topSectionHeading={page.topSectionHeading}
        topSectionIntro={page.topSectionIntro}
        fullListHeading={page.fullListHeading}
      />
    );
  }

  notFound();
}