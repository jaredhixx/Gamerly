//
// Gamerly – app.js v3 (Stable Build)
// Complete: Metacritic, Date Filters, NSFW Safe Mode
//

const API_BASE = "/api/games";

// Expanded blacklist for safe browsing
const NSFW_KEYWORDS = [
  "sex", "porn", "hentai", "nsfw", "xxx", "ecchi", "boob", "tits",
  "nude", "nudity", "strip", "lewd", "fetish", "bdsm", "adult",
  "erotic", "sexual", "explicit", "18+", "uncensored", "hot girls",
  "dating sim", "waifu", "mistress", "brothel"
];

// DOM Elements
const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const todayBtn = document.getElementById("btn-today");
const weekBtn = document.getElementById("btn-week");
const yearBtn = document.getElementById("btn-year");

let allGames = [];
let filteredGames = [];
let currentDateFilter = "all";

// =======================
// FETCH GAMES
// =======================
async function fetchGames() {
  try {
    const url = `${API_BASE}?platform=${platformEl.value}&ordering=${sortEl.value}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return data?.results || [];
  } catch (err) {
    console.error("API error:", err);
    return [];
  }
}

// =======================
// SAFE FILTERING
// =======================
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

  for (const bad of NSFW_KEYWORDS) {
    if (fields.includes(bad)) return false;
  }

  const esrb = game.esrb_rating?.name?.toLowerCase() || "";
  if (esrb.includes("adults") || esrb.includes("mature 18")) return false;

  const img = (game.background_image || "").toLowerCase();
  if (img.match(/adult|hentai|sex|erotic/)) return false;

  return true;
}

// =======================
// DATE FILTERS
// =======================
function applyDateFilter(list) {
  if (currentDateFilter === "all") return list;

  const now = new Date();
  return list.filter(g => {
    if (!g.released) return false;
    const release = new Date(g.released);
    const diffDays = (now - release) / (1000 * 60 * 60 * 24);

    if (currentDateFilter === "today") return diffDays <= 1 && diffDays >= 0;
    if (currentDateFilter === "week") return diffDays <= 7 && diffDays >= 0;
    if (currentDateFilter === "year") return diffDays <= 365 && diffDays >= 0;
    return true;
  });
}

// =======================
// SEARCH
// =======================
function applySearch(list) {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(g => g.name.toLowerCase().includes(q));
}

// =======================
// RENDER CARD
// =======================
function renderGameCard(game) {
  const released = game.released || "TBA";
  const isNew =
    game.released &&
    Date.now() - new Date(game.released).getTime() <= 7 * 24 * 60 * 60 * 1000;

  const imgSrc = game.background_image || (game.short_screenshots?.[0]?.image ?? null);
  const hasImage = !!imgSrc;
  const imgHTML = hasImage
    ? `<div class="card-img"><img src="${imgSrc}" alt="${game.name}"></div>`
    : `<div class="safe-preview">Preview Unavailable</div>`;

  const platforms =
    game.parent_platforms
      ?.map(p => `<span class="badge">${p.platform.name}</span>`)
      .join(" ") || "";

  const metacritic =
    game.metacritic != null
      ? `<span class="badge-meta">${game.metacritic}</span>`
      : `<span class="badge-meta na">N/A</span>`;

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

// =======================
// RENDER LIST
// =======================
function renderList() {
  let visible = [...filteredGames];
  visible = applySearch(visible);
  visible = applyDateFilter(visible);

  if (!visible.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#555;">No results found.</div>`;
    return;
  }

  listEl.innerHTML = visible.map(renderGameCard).join("");
}

// =======================
// LOAD GAMES
// =======================
async function loadGames() {
  listEl.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
  let games = await fetchGames();
  games = games.filter(isSafe);
  allGames = games;
  filteredGames = [...allGames];
  renderList();
}

// =======================
// OPEN GAME PAGE
// =======================
function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// =======================
// EVENT LISTENERS
// =======================
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", renderList);

todayBtn?.addEventListener("click", () => {
  currentDateFilter = "today";
  renderList();
});
weekBtn?.addEventListener("click", () => {
  currentDateFilter = "week";
  renderList();
});
yearBtn?.addEventListener("click", () => {
  currentDateFilter = "year";
  renderList();
});

// =======================
// INIT
// =======================
loadGames();
