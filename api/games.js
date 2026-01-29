export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

    const { platform, ordering, dates, range, sort } = req.query;
    const today = new Date();

    // 🗓️ Date logic
    let startStr, endStr;
    if (dates) {
      const parts = dates.split(",");
      startStr = parts[0];
      endStr = parts[1] || new Date().toISOString().slice(0, 10);
    } else {
      const startDate = new Date(today);
      const endDate = new Date(today);
      switch (range) {
        case "today":
          startDate.setDate(today.getDate() - 1);
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          startDate.setFullYear(today.getFullYear() - 3);
      }
      startStr = startDate.toISOString().slice(0, 10);
      endStr = endDate.toISOString().slice(0, 10);
    }

    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("page_size", "40");
    url.searchParams.set("exclude_additions", "true");
    url.searchParams.set("ordering", ordering || sort || "-released");
    url.searchParams.set("dates", `${startStr},${endStr}`);
    if (platform) url.searchParams.set("platforms", platform);

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });

    const data = await resp.json();
    let results = Array.isArray(data.results) ? data.results : [];

    // 🚫 Filter unreleased / adult content
    const now = new Date();
    results = results.filter((g) => {
      if (!g.released) return false;
      const d = new Date(g.released);
      const safe =
        !/sex|hentai|porn|erotic|nsfw|nude|bdsm|lewd/i.test(g.name || "") &&
        !/sex|hentai|porn|erotic|nsfw|nude|bdsm|lewd/i.test(g.slug || "");
      return d <= now && d.getFullYear() >= 2015 && safe;
    });

    // 🧩 fallback to last 6 months if empty
    if (results.length === 0) {
      const fbStart = new Date(today);
      fbStart.setMonth(today.getMonth() - 6);
      const fbStartStr = fbStart.toISOString().slice(0, 10);
      const fbEndStr = today.toISOString().slice(0, 10);
      const fbUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=40&ordering=-released&dates=${fbStartStr},${fbEndStr}`;
      const fbRes = await fetch(fbUrl);
      const fbData = await fbRes.json();
      results = fbData.results || [];
    }

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
