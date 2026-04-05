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
  | "indie";

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
    pageSubtitle: `Top-rated RPG games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best RPG games on ${labels.pageLabel} in ${year}, including the top-rated role-playing games released on ${labels.releaseLabel} this year.`,
    introParagraphOne: `The best RPG games on ${labels.pageLabel} in ${year} are ranked here based on critic scores, player interest, and overall release impact. This page focuses specifically on role-playing games released in ${year} that are playable on ${labels.releaseLabel}, highlighting the titles that stand out the most across a wide range of RPG styles.`,
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
    pageSubtitle: `Top-rated shooter games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best shooter games on ${labels.pageLabel} in ${year}, including the top-rated FPS and third-person shooters released this year.`,
    introParagraphOne: `The best shooter games on ${labels.pageLabel} in ${year} are ranked here based on critic scores, player interest, and overall release impact. This page focuses specifically on shooter games released in ${year} that are playable on ${labels.releaseLabel}, highlighting the titles that stand out the most across both competitive and single-player experiences.`,
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
    pageSubtitle: `Top-rated strategy games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best strategy games on ${labels.pageLabel} in ${year}, including the top RTS and turn-based strategy games released this year.`,
    introParagraphOne: `The best strategy games on ${labels.pageLabel} in ${year} are ranked here based on critic scores, player interest, and overall release impact. This page focuses specifically on strategy games released in ${year} that are playable on ${labels.releaseLabel}, highlighting the titles that stand out across both real-time and turn-based strategy experiences.`,
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
    pageSubtitle: `Top-rated adventure games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best adventure games on ${labels.pageLabel} in ${year}, including the top story-driven and exploration-focused titles released this year.`,
    introParagraphOne: `The best adventure games on ${labels.pageLabel} in ${year} include the strongest narrative-driven and exploration-focused releases available this year, from cinematic experiences to open-ended journeys.`,
    introParagraphTwo: `If you want to find the most worth-playing adventure games on ${labels.pageLabel} released in ${year}, this page highlights the top options based on review scores and player interest. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Adventure Pages`,
    topSectionHeading: `Top Adventure Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the standout adventure games released on ${labels.releaseLabel} in ${year} based on quality and popularity signals.`,
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
    pageSubtitle: `Top-rated simulation games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best simulation games on ${labels.pageLabel} in ${year}, including the top simulation experiences released this year.`,
    introParagraphOne: `The best simulation games on ${labels.pageLabel} in ${year} include the strongest simulation releases available this year, from life sims to highly detailed system-driven experiences.`,
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
    pageSubtitle: `Top-rated indie games released in ${year} on ${labels.releaseLabel}, ranked by quality and popularity.`,
    description: `Discover the best indie games on ${labels.pageLabel} in ${year}, including the top independent titles released this year.`,
    introParagraphOne: `The best indie games on ${labels.pageLabel} in ${year} include the strongest independently developed releases available this year, from innovative mechanics to critically acclaimed smaller projects.`,
    introParagraphTwo: `If you want to find the most worth-playing indie games on ${labels.pageLabel} released in ${year}, this page highlights the top options based on review scores and player interest. For a broader view across all genres, explore the best ${labels.broadPageLabel} games of ${year} to see the top releases across the entire platform.`,
    exploreHeading: `Explore More ${labels.exploreLabel} Indie Pages`,
    topSectionHeading: `Top Indie Games Released on ${labels.releaseLabel} in ${year}`,
    topSectionIntro: `These are the standout indie games released on ${labels.releaseLabel} in ${year} based on quality and popularity signals.`,
    fullListHeading: `Full List of Best Indie Games on ${labels.pageLabel} in ${year}`
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
    }
  };
}

export const bestGenrePlatformGamesByYearContent = {
  pc: createPlatformGenreYearSet("pc"),
  playstation: createPlatformGenreYearSet("playstation"),
  xbox: createPlatformGenreYearSet("xbox"),
  switch: createPlatformGenreYearSet("switch")
} as const;