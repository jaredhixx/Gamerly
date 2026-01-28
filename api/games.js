export default async function handler(req, res) {
  const { platform, sort, range } = req.query;
  const RAWG_KEY = process.env.RAWG_KEY;
  if (!RAWG_KEY) return res.status(500).json({ error: "Missing RAWG_KEY" });

  const today = new Date();
  let startDate, endDate;

  // 🎯 Accurate range control
  switch (range) {
    case "today":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1); // ±1 day buffer for time zones
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 1);
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      endDate = new Date(today);
      break;
    case "upcoming":
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 90);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);
      break;
  }

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", RAWG_KEY);
  url.searchParams.set("page_size", "40");
  url.searchParams.set("ordering", sort || "-released");
  url.searchParams.set("dates", `${startStr},${endStr}`);
  url.searchParams.set("exclude_additions", "true");
  if (platform) url.searchParams.set("platforms", platform);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": "GamerlyApp/1.0" },
      cache: "no-store",
    });
    const data = await response.json();

    let results = Array.isArray(data.results) ? data.results : [];

    // 🎯 Keep only exact-range, modern, safe games
    results = results.filter((g) => {
      if (!g.released) return false;
      const releaseDate = new Date(g.released);
      const after2018 = releaseDate.getFullYear() >= 2018;
      const withinRange = releaseDate >= startDate && releaseDate <= endDate;
      const safe =
        !/hentai|porn|sex|erotic/i.test(g.name || "") &&
        !/hentai|porn|sex|erotic/i.test(g.slug || "");
      return after2018 && safe && withinRange;
    });

    // 🧩 Fallback: fetch trending recent titles only if 0 results
    if (results.length === 0) {
      const fallbackUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=20&ordering=-added&dates=2024-01-01,${endStr}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      results = Array.isArray(fallbackData.results)
        ? fallbackData.results.filter((g) => g.released && g.released >= "2024-01-01")
        : [];
    }

    res.status(200).json({ count: results.length, results });
  } catch (err) {
    console.error("RAWG fetch error:", err);
    res.status(500).json({ error: "Server error fetching games" });
  }
}
