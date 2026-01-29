//
// Gamerly app.js v5 — API-accurate filters + Apple-style layout
//

const API_BASE = "/api/games";

// Safe filtering keywords
const NSFW_KEYWORDS = [
  "sex","porn","hentai","nsfw","xxx","ecchi","boob","tits","nude","nudity",
  "strip","lewd","fetish","bdsm","adult","erotic","sexual","explicit","18+",
  "uncensored","dating sim","waifu","mistress","brothel"
];

// DOM references
const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

let allGames = [];

// ==========================
// 🔹 Build API URL Dynamically
// ==========================
function buildApiUrl() {
  const platform = platformEl.value;
  const sort = sortEl.value;
  const dateFilter = dateEl.value;

  const today = new Date();
  const format = d => d.toISOString().split("T")[0];

  let startDate, endDate;
  if (dateFilter === "today") {
    startDate = endDate = format(today);
  } else if (dateFilter === "week") {
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    startDate = format(lastWeek);
    endDate = format(today);
  } else if (dateFilter === "year") {
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    startDate = format(lastYear);
    endDate = format(today);
  }

  const dateRange = startDate && endDate ? `&dates=${startDate},${endDate}` : "";
  const ordering = sort === "released" ? "-released" :
                   sort === "-rating" ? "-rating" :
                   sort === "name" ? "name" : "-released";

  return `${API_BASE}?platform=${platform}&ordering=${ordering}${dateRange}`;
}

// ==========================
// 🔹 Fetch Games from RAWG
// ==========================
async function fetchGames() {
  try {
    const url = buildApiUrl();
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return data?.results || [];
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

// ==========================
// 🔹 Safe Filter
// ==========================
function isSafe(game) {
  const fields = [
    game.name,
    game.description_raw,
    ...(game.tags || []).map(t => t.name),
    ...(game.genres || []).map(g => g.name),
    ...(game.developers || []).map(d => d.name),
    ...(game.publishers || []).map(p => p.name),
    ...(game.stores || []).map(s => s.store?.name || "")
  ].join(" ").toLowerCase();

  for (const bad of NSFW_KEYWORDS) if (fields.includes(bad)) return false;
  const esrb = game.esrb_rating?.name?.toLowerCase() || "";
  if (esrb.includes("adult") || esrb.includes("mature 18")) return false;
  const img = (game.background_image || "").toLowerCase();
  if (img.match(/adult|hentai|sex|erotic/)) return false;
  return true;
}

// ==========================
// 🔹 Render Each Game Card
// ==========================
function renderGameCard(game) {
  const released = game.released || "TBA";
  const isNew = game.released &&
    Date.now() - new Date(game.released).getTime() <= 7 * 24 * 60 * 60 * 1000;

  const imgSrc = game.background_image || (game.short_screenshots?.[0]?.image ?? null);
  const imgHTML = imgSrc
    ? `<div class="card-img"><img src="${imgSrc}" alt="${game.name}" loading="lazy"></div>`
    : `<div class="safe-preview">Preview Unavailable</div>`;

  const platforms =
    game.parent_platforms
      ?.map(p => `<span class="badge">${p.platform.name}</span>`)
      .join(" ") || "";

  const metacritic = game.metacritic != null
    ? `<span class="badge-meta ${
        game.metacritic >= 75 ? "meta-good" :
        game.metacritic >= 50 ? "meta-mid" : "meta-bad"
      }">${game.metacritic}</span>`
    : `<span class="badge-meta meta-na">N/A</span>`;

  return `
    <div class="card" onclick="openGame('${game.slug}')">
      ${imgHTML}
      <div class="card-body">
        <div class="card-title">
          ${game.name}
          ${isNew ? `<span class="badge-new">NEW</span>` : ""}
        </div>
        <div class="meta-row">
          ${metacritic}
          <span class="release-date">Released: ${released}</span>
        </div>
        <div class="badges">${platforms}</div>
      </div>
    </div>
  `;
}

// ==========================
// 🔹 Render All Games
// ==========================
function renderList() {
  let visible = allGames;
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter(g => g.name.toLowerCase().includes(q));

  if (!visible.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#777;">No games found for this filter.</div>`;
    return;
  }

  listEl.innerHTML = visible.map(renderGameCard).join("");
}

// ==========================
// 🔹 Load and Display Games
// ==========================
async function loadGames() {
  listEl.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
  let games = await fetchGames();
  games = games.filter(isSafe);
  allGames = games;
  renderList();
}

// ==========================
// 🔹 Open Game Page
// ==========================
function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// ==========================
// 🔹 Event Listeners
// ==========================
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
dateEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", renderList);

// ==========================
// 🔹 Init
// ==========================
loadGames();
