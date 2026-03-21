import { NextRequest, NextResponse } from "next/server";
import { fetchGames } from "../../lib/igdb";

async function handleLegacyGameRedirect(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }

  const games = await fetchGames();

  const matchingGame = games.find((game) => {
    return game.slug?.toLowerCase() === slug;
  });

  if (!matchingGame) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  }

  const destination = new URL(
    `/game/${matchingGame.id}-${matchingGame.slug}`,
    request.url
  );

  return NextResponse.redirect(destination, 301);
}

export async function GET(request: NextRequest) {
  return handleLegacyGameRedirect(request);
}

export async function HEAD(request: NextRequest) {
  return handleLegacyGameRedirect(request);
}