import { NextResponse } from "next/server";
import {
  getCatalogRefreshSlices,
  refreshCatalogSliceFromIGDB
} from "@/lib/igdb-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const indexParam = searchParams.get("index");

  if (key !== process.env.ADMIN_REFRESH_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!indexParam) {
    return NextResponse.json(
      { success: false, error: "Missing index parameter" },
      { status: 400 }
    );
  }

  const index = Number(indexParam);

  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json(
      { success: false, error: "Invalid index parameter" },
      { status: 400 }
    );
  }

  const slices = getCatalogRefreshSlices();
  const slice = slices[index];

  if (!slice) {
    return NextResponse.json(
      {
        success: false,
        error: "Slice index out of range",
        totalSlices: slices.length
      },
      { status: 400 }
    );
  }

  try {
    console.log(
      `[ADMIN] Indexed IGDB slice refresh triggered. index=${index} window=${slice.windowLabel} dateField=${slice.dateField}`
    );

    const result = await refreshCatalogSliceFromIGDB(
      slice.windowLabel,
      slice.dateField
    );

    console.log(
      `[ADMIN] Indexed IGDB slice refresh complete. index=${index} window=${result.windowLabel} dateField=${result.dateField} games=${result.games.length}`
    );

    return NextResponse.json({
      success: true,
      index,
      totalSlices: slices.length,
      windowLabel: result.windowLabel,
      dateField: result.dateField,
      games: result.games.length,
      nextIndex: index + 1 < slices.length ? index + 1 : null
    });
  } catch (error) {
    console.error("[ADMIN] Indexed IGDB slice refresh failed", error);

    return NextResponse.json(
      {
        success: false,
        index,
        error: String(error)
      },
      { status: 500 }
    );
  }
}