export default async function handler(req, res) {
  try {
    const RAWG_KEY = process.env.RAWG_KEY;
    if (!RAWG_KEY) {
      return res.status(500).json({ error: "Missing RAWG_KEY" });
    }

    // accept both “dates” and “range”
    const { platform, ordering, dates, range, sort } = req.query;
    const today = new Date();

    // if dates explicitly provided, trust it
    let startStr, endStr;
    if (dates) {
      const parts = dates.split(",");
      [startStr, endStr] = [parts[0], parts[1] || new Date().toISOString().slice(0, 10)];
    } else {
      // fallback to range logic
      let startDate = new Date(today);
      let endDate = new Date(today);

      switch (range) {
        case "today":
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        case "upcoming":
          endDate.setDate(today.getDate() + 90);
          break;
        default:
          startDate = new Date("2000-01-01");
          break;
      }

      startStr = startDate.toISOString().slice(0, 10);
      endStr = endDate.toISOString().slice(0, 10);
    }

    // assemble URL for RAWG
    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", RAWG_KEY);
    url.searchParams.set("page_size", "40");
    url.searchParams.set("exclude_additions", "true");
    url.searchParams.set("ordering", ordering || sort || "-released");
    url.searchParams.set("dates", `${startStr},${endStr}`);
    if (platform) url.searchParams.set("platforms", platform);

    const resp = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "GamerlyApp/1.0",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "RAWG API error" });
    }

    const data = await resp.json();
    let results = Array.isArray(data.results) ? data.results : [];

    // remove unreleased, unsafe, pre-2018 titles
    const now = new Date();
    results = results.filter((g) => {
      if (!g.released) return false;
      const rd = new Date(g.released);
      const safe =
        !/hentai|porn|sex|erotic|nude|bdsm/i.test(g.name || "") &&
        !/hentai|porn|sex|erotic|nude|bdsm/i.test(g.slug || "");
      return rd <= now && rd.getFullYear() >= 2018 && safe;
    });

    if (results.length === 0) {
      // fallback for trending titles if empty
      const fb = new URL("https://api.rawg.io/api/games");
      fb.searchParams.set("key", RAWG_KEY);
      fb.searchParams.set("page_size", "20");
      fb.searchParams.set("ordering", "-added");
      fb.searchParams.set("dates", "2024-01-01," + endStr);
      const fbRes = await fetch(fb);
      const fbData = await fbRes.json();
      results = Array.isArray(fbData.results) ? fbData.results : [];
    }

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
