import { NextResponse } from "next/server";
import { getAllGames } from "../../../lib/igdb-data";

export async function GET() {
  try {
    const games = await getAllGames();

    return NextResponse.json({
      ok: true,
      games,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}