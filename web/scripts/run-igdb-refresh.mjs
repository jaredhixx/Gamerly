const BASE_URL = process.env.IGDB_REFRESH_BASE_URL || "https://www.gamerly.net";
const ADMIN_KEY = process.env.ADMIN_REFRESH_KEY;
const START_INDEX = Number(process.env.IGDB_REFRESH_START_INDEX || "0");
const TOTAL_SLICES = Number(process.env.IGDB_REFRESH_TOTAL_SLICES || "50");
const DELAY_MS = Number(process.env.IGDB_REFRESH_DELAY_MS || "1500");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (!ADMIN_KEY) {
    throw new Error(
      "Missing ADMIN_REFRESH_KEY. Set it in your environment before running this script."
    );
  }

  if (!Number.isInteger(START_INDEX) || START_INDEX < 0) {
    throw new Error("IGDB_REFRESH_START_INDEX must be a non-negative integer.");
  }

  if (!Number.isInteger(TOTAL_SLICES) || TOTAL_SLICES <= 0) {
    throw new Error("IGDB_REFRESH_TOTAL_SLICES must be a positive integer.");
  }

  console.log(`[IGDB REFRESH] Base URL: ${BASE_URL}`);
  console.log(`[IGDB REFRESH] Start index: ${START_INDEX}`);
  console.log(`[IGDB REFRESH] Total slices: ${TOTAL_SLICES}`);

  for (let index = START_INDEX; index < TOTAL_SLICES; index += 1) {
    const url = new URL("/api/admin/refresh-igdb", BASE_URL);
    url.searchParams.set("key", ADMIN_KEY);
    url.searchParams.set("index", String(index));

    console.log(`\n[IGDB REFRESH] Running slice index=${index}`);
    console.log(`[IGDB REFRESH] URL: ${url.toString().replace(ADMIN_KEY, "[REDACTED]")}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(
        `Slice ${index} returned non-JSON response. Status=${response.status}. Body=${text}`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        `Slice ${index} failed. Status=${response.status}. Response=${JSON.stringify(data)}`
      );
    }

    console.log(
      `[IGDB REFRESH] Completed index=${data.index} window=${data.windowLabel} dateField=${data.dateField} games=${data.games} nextIndex=${data.nextIndex}`
    );

    if (index < TOTAL_SLICES - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log("\n[IGDB REFRESH] All slices completed successfully.");
}

run().catch((error) => {
  console.error("[IGDB REFRESH] Script failed.");
  console.error(error);
  process.exit(1);
});