export default async function handler(req, res) {
  const API_KEY = process.env.RAWG_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "The API key is not found" });
  }

  // Read query params (with safe defaults)
  const platform = req.query.platform || "4"; // PC default
  const sort = req.query.sort || "-added";
  const start = req.query.start;
  const end = req.query.end;
  const pageSize = req.query.pageSize || "50";

  // If dates are missing, return a helpful error
  if (!start || !end) {
    return res.status(400).json({
      error: "Missing start/end dates. Example: /api/games?platform=4&sort=-added&start=YYYY-MM-DD&end=YYYY-MM-DD"
    });
  }

  const url =
    `https://api.rawg.io/api/games` +
    `?dates=${start},${end}` +
    `&platforms=${platform}` +
    `&ordering=${sort}` +
    `&page_size=${pageSize}` +
    `&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch games" });
  }
}
