export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY)
      return res.status(500).json({ error: "Missing RAWG_KEY" });

    // ✅ pull unified query params
    const { platform, sort, range, "date-range": dateRange } = req.query;
    const rangeKey = range || dateRange || "all";
    const today = new Date();

    // ===== Date range logic =====
    let startDate, endDate;
    switch (rangeKey) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = new Date(today);
        break;
      case "year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        endDate = new Date(today);
        break;
      case "upcoming":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 90);
        break;
      default:
        startDate = new Date("2000-01-01");
        endDate = new Date(today);
        break;
    }

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    // ===== RAWG base request =====
    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("page_size", "40");
    url.searchParams.set("ordering", sort || "-released");
    url.searchParams.set("dates", `${startStr},${endStr}`);
    url.searchParams.set("exclude_additions", "true");
    if (platform) url.searchParams.set("platforms", platform);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "GamerlyApp/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok)
      return res.status(response.status).json({ error: "RAWG API error" });

    const data = await response.json();
    let results = Array.isArray(data.results) ? data.results : [];

    // ===== Filter: released games only, safe content, valid years =====
    const now = new Date();
    results = results.filter((g) => {
      if (!g.released) return false;
      const rd = new Date(g.released);
      const validDate = rd <= now && rd.getFullYear() >= 2018;
      const safe =
        !/hentai|porn|sex|erotic|bdsm|nude/i.test(g.name || "") &&
        !/hentai|porn|sex|erotic|bdsm|nude/i.test(g.slug || "");
      return validDate && safe;
    });

    // ===== Fallback if empty =====
    if (results.length === 0) {
      const fb = new URL("https://api.rawg.io/api/games");
      fb.searchParams.set("key", RAWG_KEY);
      fb.searchParams.set("page_size", "20");
      fb.searchParams.set("ordering", "-added");
      fb.searchParams.set("dates", `2024-01-01,${endStr}`);
      const fbRes = await fetch(fb);
      const fbData = await fbRes.json();
      results = Array.isArray(fbData.results)
        ? fbData.results.filter(
            (g) => g.released && g.released >= "2024-01-01"
          )
        : [];
    }

    return res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    return res.status(500).json({ error: "Server error fetching games" });
  }
}
