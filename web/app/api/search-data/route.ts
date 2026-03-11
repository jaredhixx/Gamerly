import { fetchGames } from "../../../lib/igdb";

export async function GET() {
  const games = await fetchGames();

  const simplified = games.slice(0, 300).map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug
  }));

  return Response.json(simplified);
}