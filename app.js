//
// Gamerly app.js v7 — Fully correct filters + sorting + caching
//

const API_BASE = "/api/games";

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

let cache = {};
let allGames = [];

// ========== HELPER FUNCTIONS ==========

function normalizeText(x) {
  return String(x || "").toLowerCase();
}

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
  const esrb = normalizeText(game.esrb_rating?.name);
  if (esrb.includes("adults") || esrb.includes("mature 18")) return false;

  const img = normalizeText(game.background_image);
  if (img.match(/adult|hentai|sex|erotic/)) return false;

  return true;
}

function getDateRangeFilter(list) {
  const df = dateEl.value;
  const now = new Date();
  const filtered = list.filter(game => {
    if (!game.released) return false;

    const release = new Date(game.released);
    const diff = (now - release) / (1000 * 60 * 60 * 24);

    if (df === "today") return diff <= 1 && diff >= 0;
    if (df === "week") return diff <= 7 && diff >= 0;
    if (df === "year") return diff <= 365 && diff >= 0;
    return true; // all
  });

  return filtered;
}

function sortGames(list) {
  const s = sortEl.value;

  if (s === "released" || s === "-released") {
    return list.sort((a, b) => new Date(b.released) - new Date(a.released));
  }
  if (s === "-rating") {
    return list.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
  }
  if (s === "name") {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

function applySearch(list) {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(g => g.name.toLowerCase().includes(q));
}

function cacheKey() {
  return `${platformEl.value}-${dateEl.value}-${sortEl.value}`;
}

function getCached() {
  const k = cacheKey();
  const entry = cache[k];
  if (!entry) return null;
  if (Date.now() - entry.time > 1000 * 60 * 5) return null; // 5 min
  return entry.data;
}

function setCached(data) {
  cache[cacheKey()] = { data, time: Date.now() };
}

async function fetchGames() {
  const hit = getCached();
  if (hit) return hit;

  try {
    const url = `${API_BASE}?platform=${platformEl.value}&page_size=100`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const safe = data.results.filter(isSafe);
    setCached(safe);
    return safe;
  } catch {
    return [];
  }
}

// ========== RENDERING ==========

function renderGameCard(game) {
  const released = game.released || "TBA";
  const isNew = game.released && (new Date() - new Date(game.released)) <= 1000 * 60 * 60 * 24 * 7;
  const imgSrc = game.background_image || (game.short_screenshots?.[0]?.image ?? null);

  const imgHTML = imgSrc
    ? `<div class="card-img"><img src="${imgSrc}" alt="${game.name}" loading="lazy"></div>`
    : `<div class="safe-preview">Preview Unavailable</div>`;

  const platforms =
    game.parent_platforms?.map(p => `<span class="badge">${p.platform.name}</span>`).join(" ") || "";

  const mscore = game.metacritic != null
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
          ${game.name} ${isNew ? `<span class="badge-new">NEW</span>` : ""}
        </div>
        <div class="meta-row">
          ${mscore}
          <span class="release-date">Released: ${released}</span>
        </div>
        <div class="badges">${platforms}</div>
      </div>
    </div>
  `;
}

function renderList() {
  let list = [...allGames];
  list = getDateRangeFilter(list);
  list = sortGames(list);
  list = applySearch(list);

  if (!list.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#777;">No games found.</div>`;
    return;
  }

  listEl.innerHTML = list.map(renderGameCard).join("");
}

async function loadGames() {
  listEl.innerHTML = `
    <div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>
  `;

  allGames = await fetchGames();
  renderList();
}

function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// ========== EVENTS ==========
platformEl.addEventListener("change", () => { cache = {}; loadGames(); });
sortEl.addEventListener("change", renderList);
dateEl.addEventListener("change", renderList);
searchEl.addEventListener("input", renderList);

// ========== INIT ==========
loadGames();
