export default async function handler(req, res) {
  try {
    const BASE_URL = "https://gamerly.net";

    // Fetch games from existing IGDB endpoint (read-only)
    const apiRes = await fetch(`${BASE_URL}/api/igdb`, { cache: "no-store" });
    const data = await apiRes.json();

    if (!data || !data.ok || !Array.isArray(data.games)) {
      throw new Error("Invalid IGDB response");
    }

    const games = data.games;

    // Must match frontend routing exactly
    const slugify = (str = "") =>
      str
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "");

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    /* =========================
       HOMEPAGE
    ========================= */
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    /* =========================
       STEAM MONEY PAGES (HIGHEST ROI)
    ========================= */
    const steamPages = [
      "/steam-games",
      "/steam-games-today",
      "/steam-games-this-week",
      "/steam-games-upcoming"
    ];

    for (const path of steamPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    /* =========================
       GAME DETAIL PAGES
    ========================= */
    let count = 0;
    const MAX_URLS = 45000; // safety margin

    for (const game of games) {
      if (count >= MAX_URLS) break;
      if (!game || !game.id || !game.name) continue;

      const slug = slugify(game.name);
      const url = `${BASE_URL}/game/${game.id}${slug ? "-" + slug : ""}`;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;

      if (game.releaseDate) {
        xml += `    <lastmod>${new Date(game.releaseDate).toISOString()}</lastmod>\n`;
      }

      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;

      count++;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Sitemap generation failed");
  }
}
