//
// Gamerly App.js — Stable v2 (NSFW fix + Platforms restored + Safe previews)
//

const API_BASE = "/api/games";

// Expanded NSFW blacklist
const NSFW_KEYWORDS = [
  "sex", "porn", "hentai", "nsfw", "xxx", "ecchi", "boob", "tits",
  "nude", "nudity", "strip", "lewd", "fetish", "bdsm", "adult",
  "erotic", "sexual", "explicit", "18+", "uncensored", "hot girls",
  "dating sim", "waifu", "mistress", "brothel"
];

const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");

let allGames = [];

// ---------- FETCH ----------
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

// ---------- NSFW FILTER ----------
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

// ---------- BUILD CARD ----------
function renderGameCard(game) {
  const released = game.released || "TBA";
  const isNew =
    game.released &&
    Date.now() - new Date(game.released).getTime() <= 7 * 24 * 60 * 60 * 1000;

  // Safe preview logic
  const imgSrc = game.background_image || (game.short_screenshots?.[0]?.image ?? null);
  const hasImage = !!imgSrc;
  const imgHTML = hasImage
    ? `<div class="card-img"><img src="${imgSrc}" alt="${game.name}"></div>`
    : `<div class="safe-preview">Preview Unavailable</div>`;

  // Platforms
  const platforms =
    game.parent_platforms
      ?.map(p => `<span class="badge">${p.platform.name}</span>`)
      .join(" ") || "";

  return `
    <div class="card" onclick="openGame('${game.slug}')">
      ${imgHTML}
      <div class="card-body">
        <div class="card-title">
          ${game.name}
          ${isNew ? `<span class="badge-new">NEW</span>` : ""}
        </div>
        <div style="font-size:0.85rem;color:#666;">Released: ${released}</div>
        <div class="badges">${platforms}</div>
      </div>
    </div>
  `;
}

// ---------- SEARCH ----------
function applySearch(list) {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(g => g.name.toLowerCase().includes(q));
}

// ---------- RENDER ----------
function renderList() {
  let visible = [...allGames];
  visible = applySearch(visible);

  if (!visible.length) {
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#555;">No results found.</div>`;
    return;
  }

  listEl.innerHTML = visible.map(renderGameCard).join("");
}

// ---------- LOAD ----------
async function loadGames() {
  listEl.innerHTML = `
    <div class="shimmer"></div>
    <div class="shimmer"></div>
    <div class="shimmer"></div>
  `;

  let games = await fetchGames();
  games = games.filter(isSafe);
  allGames = games;
  renderList();
}

// ---------- OPEN ----------
function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// ---------- EVENTS ----------
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", () => renderList());

loadGames();
