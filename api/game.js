export default async function handler(req, res) {
  // 🧠 One-time debug log (shows up in Vercel logs)
  console.log("RAWG_KEY loaded:", process.env.RAWG_KEY ? "✅ present" : "❌ missing");

  const { slug } = req.query;

  // 🧱 Step 1: validate input
  if (!slug) {
    return res.status(400).json({ error: "Missing slug parameter" });
  }

  // 🧱 Step 2: grab your RAWG key from Vercel env vars
  const RAWG_API_KEY = process.env.RAWG_KEY;

  if (!RAWG_API_KEY) {
    console.error("❌ RAWG_KEY missing from environment variables.");
    return res.status(500).json({ error: "Server missing RAWG API key." });
  }

  // 🧱 Step 3: Build RAWG API URL
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_API_KEY}`;

  try {
    // 🧱 Step 4: Fetch data
    const response = await fetch(url);
    const data = await response.json();

    // 🧱 Step 5: Handle bad response
    if (!response.ok) {
      console.error("RAWG API error:", data);
      return res.status(response.status).json({
        error: data?.error || "Error fetching game details from RAWG.",
      });
    }

    // 🧱 Step 6: Return data to front-end
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching game details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
