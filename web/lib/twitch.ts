type TwitchStream = {
  id: string;
  user_id: string;
  user_name: string;
  game_id: string;
  game_name: string;
  viewer_count: number;
  title: string;
};

type TwitchStreamsResponse = {
  data?: TwitchStream[];
  pagination?: {
    cursor?: string;
  };
};

type TwitchCategory = {
  id: string;
  name: string;
};

type TwitchCategoriesResponse = {
  data?: TwitchCategory[];
};

type ExactTwitchTotals = {
  viewers: number;
  streams: number;
  matchedCategoryName?: string;
};

function normalizeTwitchName(name?: string | null): string {
  if (!name) {
    return "";
  }

  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildCategorySearchQueries(name: string): string[] {
  const queries = new Set<string>();

  const trimmed = name.trim();

  if (!trimmed) {
    return [];
  }

  queries.add(trimmed);

  const beforeColon = trimmed.split(":")[0]?.trim();
  if (beforeColon) {
    queries.add(beforeColon);
  }

  return [...queries];
}

export async function getTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable."
    );
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST",
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.status}`);
  }

  const data = await response.json();

  if (!data?.access_token) {
    throw new Error("Twitch access token response did not include access_token.");
  }

  return data.access_token;
}

async function fetchTwitchStreamsPage(
  token: string,
  clientId: string,
  after?: string
): Promise<TwitchStreamsResponse> {
  const url = new URL("https://api.twitch.tv/helix/streams");
  url.searchParams.set("first", "100");

  if (after) {
    url.searchParams.set("after", after);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`
    },
    next: {
      revalidate: 300
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Twitch streams: ${response.status}`);
  }

  return response.json();
}

async function searchTwitchCategory(
  token: string,
  clientId: string,
  gameName: string
): Promise<TwitchCategory | undefined> {
  const queries = buildCategorySearchQueries(gameName);
  const normalizedTarget = normalizeTwitchName(gameName);

  for (const query of queries) {
    const url = new URL("https://api.twitch.tv/helix/search/categories");
    url.searchParams.set("query", query);
    url.searchParams.set("first", "10");

    const response = await fetch(url.toString(), {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`
      },
      next: {
        revalidate: 300
      }
    });

    if (!response.ok) {
      continue;
    }

    const data: TwitchCategoriesResponse = await response.json();
    const categories = data.data ?? [];

    const exactMatch = categories.find((category) => {
      return normalizeTwitchName(category.name) === normalizedTarget;
    });

    if (exactMatch) {
      return exactMatch;
    }

    const startsWithMatch = categories.find((category) => {
      return normalizeTwitchName(category.name).startsWith(normalizedTarget);
    });

    if (startsWithMatch) {
      return startsWithMatch;
    }

    if (categories.length === 1) {
      return categories[0];
    }
  }

  return undefined;
}

async function fetchStreamsForGameId(
  token: string,
  clientId: string,
  gameId: string
): Promise<TwitchStream[]> {
  const allStreams: TwitchStream[] = [];
  const seenStreamIds = new Set<string>();

  let cursor: string | undefined = undefined;
  const maxPages = 15;

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL("https://api.twitch.tv/helix/streams");
    url.searchParams.set("first", "100");
    url.searchParams.set("game_id", gameId);

    if (cursor) {
      url.searchParams.set("after", cursor);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`
      },
      next: {
        revalidate: 300
      }
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Twitch streams for game_id ${gameId}: ${response.status}`
      );
    }

    const data: TwitchStreamsResponse = await response.json();
    const streams = data.data ?? [];

    for (const stream of streams) {
      if (!stream?.id) {
        continue;
      }

      if (seenStreamIds.has(stream.id)) {
        continue;
      }

      seenStreamIds.add(stream.id);
      allStreams.push(stream);
    }

    const nextCursor = data.pagination?.cursor;

    if (!nextCursor) {
      break;
    }

    cursor = nextCursor;
  }

  return allStreams;
}

export async function fetchTwitchStreams(): Promise<TwitchStream[]> {
  const token = await getTwitchAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing TWITCH_CLIENT_ID environment variable.");
  }

  const allStreams: TwitchStream[] = [];
  const seenStreamIds = new Set<string>();

  let cursor: string | undefined = undefined;
  const maxPages = 5;

  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchTwitchStreamsPage(token, clientId, cursor);
    const streams = result.data ?? [];

    for (const stream of streams) {
      if (!stream?.id) {
        continue;
      }

      if (seenStreamIds.has(stream.id)) {
        continue;
      }

      seenStreamIds.add(stream.id);
      allStreams.push(stream);
    }

    const nextCursor = result.pagination?.cursor;

    if (!nextCursor) {
      break;
    }

    cursor = nextCursor;
  }

  return allStreams;
}

export async function fetchExactTwitchTotalsForGameNames(
  gameNames: string[]
): Promise<Record<string, ExactTwitchTotals>> {
  const token = await getTwitchAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing TWITCH_CLIENT_ID environment variable.");
  }

  const uniqueGameNames = [...new Set(gameNames.map((name) => name.trim()))]
    .filter(Boolean)
    .slice(0, 12);

  const totalsByGameName: Record<string, ExactTwitchTotals> = {};

  for (const gameName of uniqueGameNames) {
    const category = await searchTwitchCategory(token, clientId, gameName);

    if (!category?.id) {
      totalsByGameName[gameName] = {
        viewers: 0,
        streams: 0
      };
      continue;
    }

    const streams = await fetchStreamsForGameId(token, clientId, category.id);

    const viewers = streams.reduce((sum, stream) => {
      return sum + (stream.viewer_count ?? 0);
    }, 0);

    totalsByGameName[gameName] = {
      viewers,
      streams: streams.length,
      matchedCategoryName: category.name
    };
  }

  return totalsByGameName;
}