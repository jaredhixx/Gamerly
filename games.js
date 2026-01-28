export default async function handler(req, res) {
  const {
    platform,
    sort,
    start,
    end
  } = req.query;

  const API_KEY = process.env.RAWG_API_KEY;

  const url = `https://api.rawg.io/api/games?dates=${start},${end}&platforms=${platform}&ordering=${sort}&page_size=50&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
}

