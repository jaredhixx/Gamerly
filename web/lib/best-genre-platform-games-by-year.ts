type BestGenrePlatformYearContentEntry = {
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

type SupportedPlatform = "pc" | "playstation" | "xbox" | "switch";
type SupportedGenre =
  | "rpg"
  | "shooter"
  | "strategy"
  | "adventure"
  | "simulation"
  | "indie"
  | "sport"
  | "puzzle"
  | "racing"
  | "fighting";

const platformLabels: Record<
  SupportedPlatform,
  {
    pageLabel: string;
    releaseLabel: string;
    exploreLabel: string;
    broadPageLabel: string;
  }
> = {
  pc: {
    pageLabel: "PC",
    releaseLabel: "PC",
    exploreLabel: "PC",
    broadPageLabel: "PC"
  },
  playstation: {
    pageLabel: "PlayStation",
    releaseLabel: "PlayStation",
    exploreLabel: "PlayStation",
    broadPageLabel: "PlayStation"
  },
  xbox: {
    pageLabel: "Xbox",
    releaseLabel: "Xbox",
    exploreLabel: "Xbox",
    broadPageLabel: "Xbox"
  },
  switch: {
    pageLabel: "Switch",
    releaseLabel: "Nintendo Switch",
    exploreLabel: "Switch",
    broadPageLabel: "Switch"
  }
};

function createRpgEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best RPG Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top RPG games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best RPG games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best RPG games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best RPG games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player reception, and lasting relevance within the RPG genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform. If you are also interested in fast-paced action, check out the best shooter games on ${labels.pageLabel} in ${year} to discover top FPS and shooter experiences this year.`,
    exploreHeading: `Explore More ${labels.exploreLabel} RPG Pages`,
    topSectionHeading: `Top RPG Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best RPG games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} RPG releases of the year and is designed to quickly surface the top role-playing games worth playing.`,
    fullListHeading: `Full List of Best RPG Games on ${labels.pageLabel} in ${year}`
  };
}

function createShooterEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Shooter Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top shooter games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best shooter games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best shooter games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best shooter games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the shooter genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform. If you prefer slower, more tactical decision-making, check out the best strategy games on ${labels.pageLabel} in ${year} to discover the top strategy releases this year.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Shooter Pages`,
    topSectionHeading: `Top Shooter Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best shooter games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} shooter releases of the year and is designed to quickly surface the top shooter games worth playing.`,
    fullListHeading: `Full List of Best Shooter Games on ${labels.pageLabel} in ${year}`
  };
}

function createStrategyEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Strategy Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top strategy games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best strategy games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best strategy games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best strategy games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the strategy genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform. If you want more character progression, world-building, and role-playing depth, explore the best RPG games on ${labels.pageLabel} in ${year} to discover the top ${labels.exploreLabel} RPG releases this year.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Strategy Pages`,
    topSectionHeading: `Top Strategy Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best strategy games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} strategy releases of the year and is designed to quickly surface the top strategy games worth playing.`,
    fullListHeading: `Full List of Best Strategy Games on ${labels.pageLabel} in ${year}`
  };
}

function createAdventureEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Adventure Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top adventure games on ${labels.releaseLabel} in ${year} for fast comparison of the strongest picks.`,
    description: `Compare the best adventure games on ${labels.pageLabel} in ${year} fast, including top-rated releases, new standouts, and the strongest picks without the filler.`,
    introParagraphOne: `Looking for the best adventure games on ${labels.pageLabel} in ${year}? This page helps you compare the strongest releases fast, from top-rated hits to newer standouts.`,
    introParagraphTwo: `Use this page to skip weaker releases and focus on the adventure games on ${labels.pageLabel} that are separating themselves through review scores, player interest, and overall impact. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year}.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Adventure Pages`,
    topSectionHeading: `Top Adventure Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the adventure games on ${labels.releaseLabel} in ${year} that stand out most on review strength, player interest, and overall impact.`,
    fullListHeading: `Full List of Best Adventure Games on ${labels.pageLabel} in ${year}`
  };
}

function createSimulationEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Simulation Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top simulation games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best simulation games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best simulation games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you want to find the most worth-playing simulation games on ${labels.pageLabel} released in ${year}, this page highlights the top options based on review scores and player interest. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Simulation Pages`,
    topSectionHeading: `Top Simulation Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the standout simulation games released on ${labels.releaseLabel} in ${year} based on quality and popularity signals.`,
    fullListHeading: `Full List of Best Simulation Games on ${labels.pageLabel} in ${year}`
  };
}

function createIndieEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Indie Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top indie games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best indie games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best indie games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you want to find the most worth-playing indie games on ${labels.pageLabel} released in ${year}, this page highlights the top options based on review scores and player interest. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Indie Pages`,
    topSectionHeading: `Top Indie Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the standout indie games released on ${labels.releaseLabel} in ${year} based on quality and popularity signals.`,
    fullListHeading: `Full List of Best Indie Games on ${labels.pageLabel} in ${year}`
  };
}

function createSportsEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Sports Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top sports games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best sports games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best sports games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best sports games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the sports genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Sports Pages`,
    topSectionHeading: `Top Sports Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best sports games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} sports releases of the year and is designed to quickly surface the top sports games worth playing.`,
    fullListHeading: `Full List of Best Sports Games on ${labels.pageLabel} in ${year}`
  };
}

function createPuzzleEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Puzzle Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top puzzle games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best puzzle games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best puzzle games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best puzzle games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the puzzle genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Puzzle Pages`,
    topSectionHeading: `Top Puzzle Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best puzzle games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} puzzle releases of the year and is designed to quickly surface the top puzzle games worth playing.`,
    fullListHeading: `Full List of Best Puzzle Games on ${labels.pageLabel} in ${year}`
  };
}

function createRacingEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Racing Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top racing games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best racing games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best racing games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best racing games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the racing genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Racing Pages`,
    topSectionHeading: `Top Racing Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best racing games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} racing releases of the year and is designed to quickly surface the top racing games worth playing.`,
    fullListHeading: `Full List of Best Racing Games on ${labels.pageLabel} in ${year}`
  };
}

function createFightingEntry(
  platform: SupportedPlatform,
  year: 2025 | 2026
): BestGenrePlatformYearContentEntry {
  const labels = platformLabels[platform];

  return {
    pageTitle: `Best Fighting Games on ${labels.pageLabel} in ${year}`,
    pageSubtitle: `Top fighting games on ${labels.releaseLabel} released in ${year}, ranked by reviews, momentum, and real player interest.`,
    description: `Compare the best fighting games on ${labels.pageLabel} released in ${year}, ranked by reviews, momentum, and player interest so you can quickly find what is actually worth playing.`,
    introParagraphOne: `Looking for the best fighting games on ${labels.pageLabel} released in ${year}? This list highlights the top titles right now, so you can quickly decide what to play first without digging through everything.`,
    introParagraphTwo: `If you are searching for the best fighting games on ${labels.pageLabel} in ${year} to play right now, this page is designed to surface the strongest options first. Rankings prioritize games with high review scores, strong player engagement, and lasting relevance within the fighting genre. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Fighting Pages`,
    topSectionHeading: `Top Fighting Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the best fighting games released on ${labels.releaseLabel} in ${year}, ranked based on critic scores, player interest, and overall release impact. This section highlights the strongest ${labels.exploreLabel} fighting releases of the year and is designed to quickly surface the top fighting games worth playing.`,
    fullListHeading: `Full List of Best Fighting Games on ${labels.pageLabel} in ${year}`
  };
}

function createPlatformGenreYearSet(platform: SupportedPlatform) {
  return {
    rpg: {
      2025: createRpgEntry(platform, 2025),
      2026: createRpgEntry(platform, 2026)
    },
    shooter: {
      2025: createShooterEntry(platform, 2025),
      2026: createShooterEntry(platform, 2026)
    },
    strategy: {
      2025: createStrategyEntry(platform, 2025),
      2026: createStrategyEntry(platform, 2026)
    },
    adventure: {
      2025: createAdventureEntry(platform, 2025),
      2026: createAdventureEntry(platform, 2026)
    },
    simulation: {
      2025: createSimulationEntry(platform, 2025),
      2026: createSimulationEntry(platform, 2026)
    },
    indie: {
      2025: createIndieEntry(platform, 2025),
      2026: createIndieEntry(platform, 2026)
    },
    sport: {
      2025: createSportsEntry(platform, 2025),
      2026: createSportsEntry(platform, 2026)
    },
    puzzle: {
      2025: createPuzzleEntry(platform, 2025),
      2026: createPuzzleEntry(platform, 2026)
    },
    racing: {
      2025: createRacingEntry(platform, 2025),
      2026: createRacingEntry(platform, 2026)
    },
    fighting: {
      2025: createFightingEntry(platform, 2025),
      2026: createFightingEntry(platform, 2026)
    }
  };
}

export const bestGenrePlatformGamesByYearContent = {
  pc: createPlatformGenreYearSet("pc"),
  playstation: createPlatformGenreYearSet("playstation"),
  xbox: createPlatformGenreYearSet("xbox"),
  switch: createPlatformGenreYearSet("switch")
} as const;
