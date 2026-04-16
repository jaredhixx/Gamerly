import { NextResponse } from "next/server";
import { fetchSharedCatalogFromIGDB } from "@/lib/igdb-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.ADMIN_REFRESH_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("[ADMIN] Manual IGDB refresh triggered");

    const catalog = await fetchSharedCatalogFromIGDB();

    console.log(
      `[ADMIN] IGDB refresh complete. games=${catalog.length}`
    );

    return NextResponse.json({
      success: true,
      games: catalog.length
    });
  } catch (error) {
    console.error("[ADMIN] IGDB refresh failed", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}