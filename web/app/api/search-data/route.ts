import { fetchGames } from "../../../lib/igdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 3) {
    return Response.json([]);
  }

  const games = await fetchGames();

  const exactMatches: typeof games = [];
  const startsWithMatches: typeof games = [];
  const containsMatches: typeof games = [];

  for (const game of games) {
    if (!game.name) {
      continue;
    }

    const gameName = game.name.toLowerCase();

    if (gameName === query) {
      exactMatches.push(game);
    } else if (gameName.startsWith(query)) {
      startsWithMatches.push(game);
    } else if (gameName.includes(query)) {
      containsMatches.push(game);
    }

    if (
      exactMatches.length + startsWithMatches.length + containsMatches.length >= 24
    ) {
      break;
    }
  }

  const filtered = [...exactMatches, ...startsWithMatches, ...containsMatches]
    .slice(0, 6)
    .map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover: game.coverUrl
    }));

  return Response.json(filtered);
}