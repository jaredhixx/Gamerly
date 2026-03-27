export const dynamic = "force-dynamic";

import { fetchGames } from "../../../lib/igdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return Response.json([]);
  }

  const games = await fetchGames();

  const filtered = games
    .filter((game) => game.name && game.name.toLowerCase().includes(query))
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aExact = aName === query;
      const bExact = bName === query;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return aName.localeCompare(bName);
    })
    .slice(0, 6)
    .map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover: game.coverUrl
    }));

  return Response.json(filtered);
}