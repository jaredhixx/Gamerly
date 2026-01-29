//
// Gamerly app.js v6 — Smart Filters, Caching, and Apple-Polished
//

const API_BASE = "/api/games";

// 🔞 NSFW keyword blacklist
const NSFW_KEYWORDS = [
  "sex","porn","hentai","nsfw","xxx","ecchi","boob","tits","nude","nudity",
  "strip","lewd","fetish","bdsm","adult","erotic","sexual","explicit","18+",
  "uncensored","dating sim","waifu","mistress","brothel"
];

const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

let allGames = [];
let cache = {};

// =============== 🔹 Build API URL ===============
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
  const ordering =
    sort === "released" ? "-released" :
    sort === "-rating" ? "-rating" :
    sort === "name" ? "name" : "-released";

  // RAWG needs platform IDs not names, but your API proxy may handle this
  return `${API_BASE}?platform=${platform}&ordering=${ordering}${dateRange}&page_size=30`;
}

// =============== 🔹 NSFW Filter ===============
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

// =============== 🔹 Smart Cache (5min) ===============
function getCacheKey() {
  return `${platformEl.value}-${sortEl.value}-${dateEl.value}`;
}

function getCachedResults() {
  const key = getCacheKey();
  const entry = cache[key];
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age > 5 * 60 * 1000) return null; // 5 min expiry
  return entry.data;
}

function setCachedResults(data) {
  const key = getCacheKey();
  cache[key] = { data, timestamp: Date.now() };
}

// =============== 🔹 Fetch & Filter Games ===============
async function fetchGames() {
  const cached = getCachedResults();
  if (cached) return cached;

  try {
    const url = buildApiUrl();
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    let results = (data?.results || []).filter(isSafe);

    // Strict recheck: filter by release window locally too
    const now = new Date();
    const dateFilter = dateEl.value;
    if (dateFilter !== "all") {
      results = results.filter(g => {
        if (!g.released) return false;
        const release = new Date(g.released);
        const diffDays = (now - release) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today") return diffDays <= 1 && diffDays >= 0;
        if (dateFilter === "week") return diffDays <= 7 && diffDays >= 0;
        if (dateFilter === "year") return diffDays <= 365 && diffDays >= 0;
        return true;
      });
    }

    // Store in cache
    setCachedResults(results);
    return results;
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

// =============== 🔹 Render Cards ===============
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

// =============== 🔹 Render List ===============
function renderList() {
  let visible = [...allGames];
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter(g => g.name.toLowerCase().includes(q));

  if (!visible.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#777;">No games found for this filter.</div>`;
    return;
  }

  listEl.innerHTML = visible.map(renderGameCard).join("");
}

// =============== 🔹 Load Games ===============
async function loadGames() {
  listEl.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
  let games = await fetchGames();
  allGames = games;
  renderList();
}

// =============== 🔹 Open Game ===============
function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// =============== 🔹 Event Listeners ===============
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
dateEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", renderList);

// =============== 🔹 Init ===============
loadGames();
