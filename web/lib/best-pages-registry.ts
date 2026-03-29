import { bestGamesByYearContent } from "./best-games-by-year";
import { bestPlatformGamesByYearContent } from "./best-platform-games-by-year";
import { bestGenrePlatformGamesByYearContent } from "./best-genre-platform-games-by-year";
import type { GenreSlug } from "./genres";
import type { PlatformSlug } from "./platforms";

export type BestPageRegistryEntry =
  | {
      type: "year";
      slug: string;
      canonicalPath: string;
      year: number;
      pageTitle: string;
      pageSubtitle: string;
      description: string;
      introParagraphOne: string;
      introParagraphTwo: string;
      exploreHeading: string;
      topSectionHeading: string;
      topSectionIntro: string;
      fullListHeading: string;
    }
  | {
      type: "genre";
      slug: string;
      canonicalPath: string;
      genreSlug: GenreSlug;
      pageTitle: string;
      pageSubtitle: string;
      description: string;
      introParagraphOne: string;
      introParagraphTwo: string;
      exploreHeading: string;
      topSectionHeading: string;
      topSectionIntro: string;
      fullListHeading: string;
    }
  | {
      type: "platform-year";
      slug: string;
      canonicalPath: string;
      platformSlug: PlatformSlug;
      year: number;
      pageTitle: string;
      pageSubtitle: string;
      description: string;
      introParagraphOne: string;
      introParagraphTwo: string;
      exploreHeading: string;
      topSectionHeading: string;
      topSectionIntro: string;
      fullListHeading: string;
    }
  | {
      type: "genre-platform-year";
      slug: string;
      canonicalPath: string;
      genreSlug: GenreSlug;
      platformSlug: PlatformSlug;
      year: number;
      pageTitle: string;
      pageSubtitle: string;
      description: string;
      introParagraphOne: string;
      introParagraphTwo: string;
      exploreHeading: string;
      topSectionHeading: string;
      topSectionIntro: string;
      fullListHeading: string;
    };

export const bestPagesRegistry: BestPageRegistryEntry[] = [
  {
    type: "year",
    slug: "best-games-2024",
    canonicalPath: "/best-games-2024",
    year: 2024,
    pageTitle: bestGamesByYearContent[2024].pageTitle,
    pageSubtitle: bestGamesByYearContent[2024].pageSubtitle,
    description: bestGamesByYearContent[2024].description,
    introParagraphOne: bestGamesByYearContent[2024].introParagraphOne,
    introParagraphTwo: bestGamesByYearContent[2024].introParagraphTwo,
    exploreHeading: bestGamesByYearContent[2024].exploreHeading,
    topSectionHeading: bestGamesByYearContent[2024].topSectionHeading,
    topSectionIntro: bestGamesByYearContent[2024].topSectionIntro,
    fullListHeading: bestGamesByYearContent[2024].fullListHeading
  },
  {
    type: "year",
    slug: "best-games-2025",
    canonicalPath: "/best-games-2025",
    year: 2025,
    pageTitle: bestGamesByYearContent[2025].pageTitle,
    pageSubtitle: bestGamesByYearContent[2025].pageSubtitle,
    description: bestGamesByYearContent[2025].description,
    introParagraphOne: bestGamesByYearContent[2025].introParagraphOne,
    introParagraphTwo: bestGamesByYearContent[2025].introParagraphTwo,
    exploreHeading: bestGamesByYearContent[2025].exploreHeading,
    topSectionHeading: bestGamesByYearContent[2025].topSectionHeading,
    topSectionIntro: bestGamesByYearContent[2025].topSectionIntro,
    fullListHeading: bestGamesByYearContent[2025].fullListHeading
  },
  {
    type: "year",
    slug: "best-games-2026",
    canonicalPath: "/best-games-2026",
    year: 2026,
    pageTitle: bestGamesByYearContent[2026].pageTitle,
    pageSubtitle: bestGamesByYearContent[2026].pageSubtitle,
    description: bestGamesByYearContent[2026].description,
    introParagraphOne: bestGamesByYearContent[2026].introParagraphOne,
    introParagraphTwo: bestGamesByYearContent[2026].introParagraphTwo,
    exploreHeading: bestGamesByYearContent[2026].exploreHeading,
    topSectionHeading: bestGamesByYearContent[2026].topSectionHeading,
    topSectionIntro: bestGamesByYearContent[2026].topSectionIntro,
    fullListHeading: bestGamesByYearContent[2026].fullListHeading
  },
  {
    type: "genre",
    slug: "best-rpg-games",
    canonicalPath: "/best-rpg-games",
    genreSlug: "rpg",
    pageTitle: "Best RPG Games",
    pageSubtitle:
      "Top-rated role-playing games across all platforms, ranked by quality and popularity.",
    description:
      "Discover the best RPG games to play right now, including top-rated role-playing games across all platforms.",
    introParagraphOne:
      "RPG games (role-playing games) are some of the most immersive experiences in gaming, offering deep progression systems, expansive worlds, and meaningful player choices. Whether you prefer story-driven adventures, open-world exploration, or tactical combat, the best RPG games deliver hundreds of hours of engaging gameplay.",
    introParagraphTwo:
      "This list ranks the best RPG games available right now based on a combination of critic ratings, player popularity, and overall impact. From modern releases to all-time classics, these are the RPGs worth playing across all platforms.",
    exploreHeading: "Explore More RPG Pages",
    topSectionHeading: "Top RPG Games Right Now",
    topSectionIntro:
      "These are the standout RPG games available right now, selected based on a combination of critical reception, player engagement, and overall impact. If you are looking for the best RPGs to play today, this is where to start.",
    fullListHeading: "Full List of Best RPG Games"
  },
  {
    type: "genre",
    slug: "best-shooter-games",
    canonicalPath: "/best-shooter-games",
    genreSlug: "shooter",
    pageTitle: "Best Shooter Games",
    pageSubtitle:
      "Top-rated shooter games across all platforms, ranked by quality and popularity.",
    description:
      "Discover the best shooter games to play right now, including top-rated FPS and third-person shooter games across all platforms.",
    introParagraphOne:
      "Shooter games remain one of the most popular genres in gaming, spanning everything from fast competitive multiplayer releases to cinematic single-player campaigns. The best shooter games combine strong gunplay, polished combat design, and lasting replay value.",
    introParagraphTwo:
      "This page highlights the shooter games worth playing right now by ranking them using review quality, popularity, and overall impact across the gaming landscape.",
    exploreHeading: "Explore More Shooter Pages",
    topSectionHeading: "Top Shooter Games Right Now",
    topSectionIntro:
      "These are the standout shooter games available right now, selected based on a combination of critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Shooter Games"
  },
  {
    type: "genre",
    slug: "best-adventure-games",
    canonicalPath: "/best-adventure-games",
    genreSlug: "adventure",
    pageTitle: "Best Adventure Games",
    pageSubtitle:
      "Top-rated adventure games across all platforms, ranked by quality and popularity.",
    description:
      "Discover the best adventure games to play right now, including top-rated story-driven and action adventure games across all platforms.",
    introParagraphOne:
      "Adventure games cover some of the most memorable experiences in gaming, from story-rich journeys to exploration-heavy worlds filled with secrets, puzzles, and character-driven moments. The best adventure games balance discovery, momentum, and atmosphere.",
    introParagraphTwo:
      "This page ranks the strongest adventure games to play right now using a mix of critical reception, popularity, and lasting overall impact.",
    exploreHeading: "Explore More Adventure Pages",
    topSectionHeading: "Top Adventure Games Right Now",
    topSectionIntro:
      "These are the standout adventure games available right now, selected based on a combination of critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Adventure Games"
  },
  {
    type: "genre",
    slug: "best-strategy-games",
    canonicalPath: "/best-strategy-games",
    genreSlug: "strategy",
    pageTitle: "Best Strategy Games",
    pageSubtitle:
      "Top-rated strategy games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top strategy games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Strategy games reward planning, efficiency, and smart decision-making, whether you prefer turn-based tactics, real-time control, or large-scale empire building. The best strategy games create satisfying depth without sacrificing momentum.",
    introParagraphTwo:
      "This page ranks the top strategy games to play right now using a blend of quality signals, player interest, and overall reputation.",
    exploreHeading: "Explore More Strategy Pages",
    topSectionHeading: "Top Strategy Games Right Now",
    topSectionIntro:
      "These are the standout strategy games available right now, selected based on critical reception, player engagement, and long-term impact.",
    fullListHeading: "Full List of Best Strategy Games"
  },
  {
    type: "genre",
    slug: "best-simulation-games",
    canonicalPath: "/best-simulation-games",
    genreSlug: "simulation",
    pageTitle: "Best Simulation Games",
    pageSubtitle:
      "Top-rated simulation games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top simulation games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Simulation games let players build, manage, operate, and experiment in systems that can range from realistic to highly creative. The best simulation games offer depth, freedom, and strong long-term replay value.",
    introParagraphTwo:
      "This page ranks the strongest simulation games to play right now using review strength, popularity, and overall player interest.",
    exploreHeading: "Explore More Simulation Pages",
    topSectionHeading: "Top Simulation Games Right Now",
    topSectionIntro:
      "These are the standout simulation games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Simulation Games"
  },
  {
    type: "genre",
    slug: "best-puzzle-games",
    canonicalPath: "/best-puzzle-games",
    genreSlug: "puzzle",
    pageTitle: "Best Puzzle Games",
    pageSubtitle:
      "Top-rated puzzle games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top puzzle games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Puzzle games are at their best when they deliver satisfying problem-solving, strong design clarity, and a steady sense of progression. The best puzzle games can be relaxing, demanding, or deeply inventive.",
    introParagraphTwo:
      "This page ranks the best puzzle games to play right now using a blend of review quality, player interest, and overall staying power.",
    exploreHeading: "Explore More Puzzle Pages",
    topSectionHeading: "Top Puzzle Games Right Now",
    topSectionIntro:
      "These are the standout puzzle games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Puzzle Games"
  },
  {
    type: "genre",
    slug: "best-indie-games",
    canonicalPath: "/best-indie-games",
    genreSlug: "indie",
    pageTitle: "Best Indie Games",
    pageSubtitle:
      "Top-rated indie games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top indie games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Indie games often deliver the most creative ideas in gaming, from genre reinventions to breakout original concepts built by smaller teams. The best indie games stand out through strong design, distinct identity, and memorable execution.",
    introParagraphTwo:
      "This page ranks the indie games most worth playing right now using review strength, popularity, and overall impact across the market.",
    exploreHeading: "Explore More Indie Pages",
    topSectionHeading: "Top Indie Games Right Now",
    topSectionIntro:
      "These are the standout indie games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Indie Games"
  },
  {
    type: "genre",
    slug: "best-fighting-games",
    canonicalPath: "/best-fighting-games",
    genreSlug: "fighting",
    pageTitle: "Best Fighting Games",
    pageSubtitle:
      "Top-rated fighting games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top fighting games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Fighting games combine mechanical skill, matchup knowledge, and strong character design into one of the most competitive genres in gaming. The best fighting games remain rewarding whether you play casually or competitively.",
    introParagraphTwo:
      "This page ranks the best fighting games to play right now using review quality, player interest, and overall relevance.",
    exploreHeading: "Explore More Fighting Pages",
    topSectionHeading: "Top Fighting Games Right Now",
    topSectionIntro:
      "These are the standout fighting games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Fighting Games"
  },
  {
    type: "genre",
    slug: "best-racing-games",
    canonicalPath: "/best-racing-games",
    genreSlug: "racing",
    pageTitle: "Best Racing Games",
    pageSubtitle:
      "Top-rated racing games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top racing games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Racing games can deliver speed, precision, and competition in ways few genres can match, whether you prefer realistic simulators, arcade racers, or open-world driving experiences. The best racing games pair great handling with lasting replay value.",
    introParagraphTwo:
      "This page ranks the top racing games to play right now using critical reception, player interest, and overall impact.",
    exploreHeading: "Explore More Racing Pages",
    topSectionHeading: "Top Racing Games Right Now",
    topSectionIntro:
      "These are the standout racing games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Racing Games"
  },
  {
    type: "genre",
    slug: "best-sports-games",
    canonicalPath: "/best-sports-games",
    genreSlug: "sport",
    pageTitle: "Best Sports Games",
    pageSubtitle:
      "Top-rated sports games across all platforms, ranked by quality and popularity.",
    description:
      "Discover top sports games across PC, PlayStation, Xbox, and Switch.",
    introParagraphOne:
      "Sports games cover everything from realistic league simulations to arcade-style competition, giving players ways to jump into football, basketball, soccer, racing, and more. The best sports games balance authenticity, polish, and replayability.",
    introParagraphTwo:
      "This page ranks the strongest sports games to play right now using review quality, popularity, and overall impact.",
    exploreHeading: "Explore More Sports Pages",
    topSectionHeading: "Top Sports Games Right Now",
    topSectionIntro:
      "These are the standout sports games available right now, selected based on critical reception, player engagement, and overall impact.",
    fullListHeading: "Full List of Best Sports Games"
  },
  {
    type: "platform-year",
    slug: "best-pc-games-2025",
    canonicalPath: "/best-pc-games-2025",
    platformSlug: "pc",
    year: 2025,
    pageTitle: bestPlatformGamesByYearContent.pc[2025].pageTitle,
    pageSubtitle: bestPlatformGamesByYearContent.pc[2025].pageSubtitle,
    description: bestPlatformGamesByYearContent.pc[2025].description,
    introParagraphOne: bestPlatformGamesByYearContent.pc[2025].introParagraphOne,
    introParagraphTwo: bestPlatformGamesByYearContent.pc[2025].introParagraphTwo,
    exploreHeading: bestPlatformGamesByYearContent.pc[2025].exploreHeading,
    topSectionHeading: bestPlatformGamesByYearContent.pc[2025].topSectionHeading,
    topSectionIntro: bestPlatformGamesByYearContent.pc[2025].topSectionIntro,
    fullListHeading: bestPlatformGamesByYearContent.pc[2025].fullListHeading
  },
    {
    type: "platform-year",
    slug: "best-pc-games-2026",
    canonicalPath: "/best-pc-games-2026",
    platformSlug: "pc",
    year: 2026,
    pageTitle: bestPlatformGamesByYearContent.pc[2026].pageTitle,
    pageSubtitle: bestPlatformGamesByYearContent.pc[2026].pageSubtitle,
    description: bestPlatformGamesByYearContent.pc[2026].description,
    introParagraphOne: bestPlatformGamesByYearContent.pc[2026].introParagraphOne,
    introParagraphTwo: bestPlatformGamesByYearContent.pc[2026].introParagraphTwo,
    exploreHeading: bestPlatformGamesByYearContent.pc[2026].exploreHeading,
    topSectionHeading: bestPlatformGamesByYearContent.pc[2026].topSectionHeading,
    topSectionIntro: bestPlatformGamesByYearContent.pc[2026].topSectionIntro,
    fullListHeading: bestPlatformGamesByYearContent.pc[2026].fullListHeading
  },
{
  type: "platform-year",
  slug: "best-playstation-games-2025",
  canonicalPath: "/best-playstation-games-2025",
  platformSlug: "playstation",
  year: 2025,
  pageTitle: bestPlatformGamesByYearContent.playstation[2025].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.playstation[2025].pageSubtitle,
  description: bestPlatformGamesByYearContent.playstation[2025].description,
  introParagraphOne: bestPlatformGamesByYearContent.playstation[2025].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.playstation[2025].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.playstation[2025].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.playstation[2025].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.playstation[2025].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.playstation[2025].fullListHeading
},
{
  type: "platform-year",
  slug: "best-playstation-games-2026",
  canonicalPath: "/best-playstation-games-2026",
  platformSlug: "playstation",
  year: 2026,
  pageTitle: bestPlatformGamesByYearContent.playstation[2026].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.playstation[2026].pageSubtitle,
  description: bestPlatformGamesByYearContent.playstation[2026].description,
  introParagraphOne: bestPlatformGamesByYearContent.playstation[2026].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.playstation[2026].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.playstation[2026].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.playstation[2026].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.playstation[2026].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.playstation[2026].fullListHeading
},
{
  type: "platform-year",
  slug: "best-xbox-games-2025",
  canonicalPath: "/best-xbox-games-2025",
  platformSlug: "xbox",
  year: 2025,
  pageTitle: bestPlatformGamesByYearContent.xbox[2025].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.xbox[2025].pageSubtitle,
  description: bestPlatformGamesByYearContent.xbox[2025].description,
  introParagraphOne: bestPlatformGamesByYearContent.xbox[2025].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.xbox[2025].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.xbox[2025].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.xbox[2025].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.xbox[2025].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.xbox[2025].fullListHeading
},
{
  type: "platform-year",
  slug: "best-xbox-games-2026",
  canonicalPath: "/best-xbox-games-2026",
  platformSlug: "xbox",
  year: 2026,
  pageTitle: bestPlatformGamesByYearContent.xbox[2026].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.xbox[2026].pageSubtitle,
  description: bestPlatformGamesByYearContent.xbox[2026].description,
  introParagraphOne: bestPlatformGamesByYearContent.xbox[2026].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.xbox[2026].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.xbox[2026].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.xbox[2026].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.xbox[2026].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.xbox[2026].fullListHeading
},
{
  type: "platform-year",
  slug: "best-switch-games-2025",
  canonicalPath: "/best-switch-games-2025",
  platformSlug: "switch",
  year: 2025,
  pageTitle: bestPlatformGamesByYearContent.switch[2025].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.switch[2025].pageSubtitle,
  description: bestPlatformGamesByYearContent.switch[2025].description,
  introParagraphOne: bestPlatformGamesByYearContent.switch[2025].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.switch[2025].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.switch[2025].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.switch[2025].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.switch[2025].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.switch[2025].fullListHeading
},
{
  type: "platform-year",
  slug: "best-switch-games-2026",
  canonicalPath: "/best-switch-games-2026",
  platformSlug: "switch",
  year: 2026,
  pageTitle: bestPlatformGamesByYearContent.switch[2026].pageTitle,
  pageSubtitle: bestPlatformGamesByYearContent.switch[2026].pageSubtitle,
  description: bestPlatformGamesByYearContent.switch[2026].description,
  introParagraphOne: bestPlatformGamesByYearContent.switch[2026].introParagraphOne,
  introParagraphTwo: bestPlatformGamesByYearContent.switch[2026].introParagraphTwo,
  exploreHeading: bestPlatformGamesByYearContent.switch[2026].exploreHeading,
  topSectionHeading: bestPlatformGamesByYearContent.switch[2026].topSectionHeading,
  topSectionIntro: bestPlatformGamesByYearContent.switch[2026].topSectionIntro,
  fullListHeading: bestPlatformGamesByYearContent.switch[2026].fullListHeading
},
  {
    type: "genre-platform-year",
    slug: "best-shooter-games-pc-2025",
    canonicalPath: "/best-shooter-games-pc-2025",
    genreSlug: "shooter",
    platformSlug: "pc",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.pc.shooter[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-strategy-games-pc-2025",
    canonicalPath: "/best-strategy-games-pc-2025",
    genreSlug: "strategy",
    platformSlug: "pc",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.pc.strategy[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-adventure-games-pc-2025",
    canonicalPath: "/best-adventure-games-pc-2025",
    genreSlug: "adventure",
    platformSlug: "pc",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.pc.adventure[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-simulation-games-pc-2025",
    canonicalPath: "/best-simulation-games-pc-2025",
    genreSlug: "simulation",
    platformSlug: "pc",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.pc.simulation[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-indie-games-pc-2025",
    canonicalPath: "/best-indie-games-pc-2025",
    genreSlug: "indie",
    platformSlug: "pc",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.pc.indie[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-shooter-games-playstation-2025",
    canonicalPath: "/best-shooter-games-playstation-2025",
    genreSlug: "shooter",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.shooter[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-strategy-games-playstation-2025",
    canonicalPath: "/best-strategy-games-playstation-2025",
    genreSlug: "strategy",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.strategy[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-adventure-games-playstation-2025",
    canonicalPath: "/best-adventure-games-playstation-2025",
    genreSlug: "adventure",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.adventure[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-simulation-games-playstation-2025",
    canonicalPath: "/best-simulation-games-playstation-2025",
    genreSlug: "simulation",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.simulation[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-indie-games-playstation-2025",
    canonicalPath: "/best-indie-games-playstation-2025",
    genreSlug: "indie",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.indie[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-shooter-games-xbox-2025",
    canonicalPath: "/best-shooter-games-xbox-2025",
    genreSlug: "shooter",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.shooter[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-strategy-games-xbox-2025",
    canonicalPath: "/best-strategy-games-xbox-2025",
    genreSlug: "strategy",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.strategy[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-adventure-games-xbox-2025",
    canonicalPath: "/best-adventure-games-xbox-2025",
    genreSlug: "adventure",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.adventure[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-simulation-games-xbox-2025",
    canonicalPath: "/best-simulation-games-xbox-2025",
    genreSlug: "simulation",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.simulation[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-indie-games-xbox-2025",
    canonicalPath: "/best-indie-games-xbox-2025",
    genreSlug: "indie",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.indie[2025].fullListHeading
  },
  {
  type: "genre-platform-year",
  slug: "best-rpg-games-pc-2025",
  canonicalPath: "/best-rpg-games-pc-2025",
  genreSlug: "rpg",
  platformSlug: "pc",
  year: 2025,
  pageTitle:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].pageTitle,
  pageSubtitle:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].pageSubtitle,
  description:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].description,
  introParagraphOne:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].introParagraphOne,
  introParagraphTwo:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].introParagraphTwo,
  exploreHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].exploreHeading,
  topSectionHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].topSectionHeading,
  topSectionIntro:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].topSectionIntro,
  fullListHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2025].fullListHeading
 },
 {
  type: "genre-platform-year",
  slug: "best-rpg-games-pc-2026",
  canonicalPath: "/best-rpg-games-pc-2026",
  genreSlug: "rpg",
  platformSlug: "pc",
  year: 2026,
  pageTitle:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].pageTitle,
  pageSubtitle:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].pageSubtitle,
  description:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].description,
  introParagraphOne:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].introParagraphOne,
  introParagraphTwo:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].introParagraphTwo,
  exploreHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].exploreHeading,
  topSectionHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].topSectionHeading,
  topSectionIntro:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].topSectionIntro,
  fullListHeading:
    bestGenrePlatformGamesByYearContent.pc.rpg[2026].fullListHeading
},
  {
    type: "genre-platform-year",
    slug: "best-rpg-games-playstation-2025",
    canonicalPath: "/best-rpg-games-playstation-2025",
    genreSlug: "rpg",
    platformSlug: "playstation",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.playstation.rpg[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-rpg-games-xbox-2025",
    canonicalPath: "/best-rpg-games-xbox-2025",
    genreSlug: "rpg",
    platformSlug: "xbox",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.xbox.rpg[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-rpg-games-switch-2025",
    canonicalPath: "/best-rpg-games-switch-2025",
    genreSlug: "rpg",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.rpg[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-shooter-games-switch-2025",
    canonicalPath: "/best-shooter-games-switch-2025",
    genreSlug: "shooter",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.shooter[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-strategy-games-switch-2025",
    canonicalPath: "/best-strategy-games-switch-2025",
    genreSlug: "strategy",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.strategy[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-adventure-games-switch-2025",
    canonicalPath: "/best-adventure-games-switch-2025",
    genreSlug: "adventure",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.adventure[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-simulation-games-switch-2025",
    canonicalPath: "/best-simulation-games-switch-2025",
    genreSlug: "simulation",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.simulation[2025].fullListHeading
  },
  {
    type: "genre-platform-year",
    slug: "best-indie-games-switch-2025",
    canonicalPath: "/best-indie-games-switch-2025",
    genreSlug: "indie",
    platformSlug: "switch",
    year: 2025,
    pageTitle:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].pageTitle,
    pageSubtitle:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].pageSubtitle,
    description:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].description,
    introParagraphOne:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].introParagraphOne,
    introParagraphTwo:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].introParagraphTwo,
    exploreHeading:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].exploreHeading,
    topSectionHeading:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].topSectionHeading,
    topSectionIntro:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].topSectionIntro,
    fullListHeading:
      bestGenrePlatformGamesByYearContent.switch.indie[2025].fullListHeading
  }
];

export function getBestPageBySlug(slug: string) {
  return bestPagesRegistry.find((entry) => entry.slug === slug);
}