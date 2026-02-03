export default async function handler(req, res) {
  try {
    const protocol =
      req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Fetch games from existing IGDB endpoint (read-only)
    const apiRes = await fetch(`${baseUrl}/api/igdb`);
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

    const today = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Homepage
    xml += `  <url>\n`;
    xml += `    <loc>https://gamerly.net/</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 🔥 STEAM MONEY PAGES (HIGHEST ROI)
    const steamPages = [
      "/steam-games",
      "/steam-games-today",
      "/steam-games-this-week",
      "/steam-games-upcoming"
    ];

    for (const path of steamPages) {
      xml += `  <url>\n`;
      xml += `    <loc>https://gamerly.net${path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // Game detail pages
    for (const game of games) {
      if (!game || !game.id || !game.name) continue;

      const slug = slugify(game.name);
      const url = `https://gamerly.net/game/${game.id}${
        slug ? "-" + slug : ""
      }`;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Sitemap generation failed");
  }
}
