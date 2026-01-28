export default async function handler(req, res) {
  const key = process.env.RAWG_KEY;
  if (key) {
    return res.status(200).json({ status: "✅ RAWG_KEY found", length: key.length });
  } else {
    return res.status(500).json({ status: "❌ RAWG_KEY missing" });
  }
}
