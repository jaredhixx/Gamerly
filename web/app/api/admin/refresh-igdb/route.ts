import { NextResponse } from "next/server";
import {
  refreshCatalogSliceFromIGDB,
  type CatalogDateField
} from "@/lib/igdb-data";

const ALLOWED_DATE_FIELDS: CatalogDateField[] = [
  "first_release_date",
  "release_dates.date"
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const windowLabel = searchParams.get("window");
  const dateField = searchParams.get("dateField");

  if (key !== process.env.ADMIN_REFRESH_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!windowLabel) {
    return NextResponse.json(
      { success: false, error: "Missing window parameter" },
      { status: 400 }
    );
  }

  if (!dateField || !ALLOWED_DATE_FIELDS.includes(dateField as CatalogDateField)) {
    return NextResponse.json(
      { success: false, error: "Invalid dateField parameter" },
      { status: 400 }
    );
  }

  try {
    console.log(
      `[ADMIN] Manual IGDB slice refresh triggered. window=${windowLabel} dateField=${dateField}`
    );

    const result = await refreshCatalogSliceFromIGDB(
      windowLabel,
      dateField as CatalogDateField
    );

    console.log(
      `[ADMIN] Manual IGDB slice refresh complete. window=${result.windowLabel} dateField=${result.dateField} games=${result.games.length}`
    );

    return NextResponse.json({
      success: true,
      windowLabel: result.windowLabel,
      dateField: result.dateField,
      games: result.games.length
    });
  } catch (error) {
    console.error("[ADMIN] IGDB slice refresh failed", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}