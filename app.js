//
// Gamerly – Main Front-End Logic
// Works with RAWG API (serverless proxy) + heavy NSFW filtering
//

const API_BASE = "/api/games";

// Strong blacklist to remove unsafe games
const NSFW_KEYWORDS = [
  "sex", "porn", "hentai", "nsfw", "XXX", "ecchi", "big tits", "boobs",
  "adult", "erotic", "18+", "fetish", "bdsm", "nude", "nudity",
  "strip", "lewd", "sexual", "explicit"
];

// DOM elements
const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");

let allGames = [];


// ==========================
// FETCH GAMES FROM BACKEND
// ==========================

async function fetchGames() {
  try {
    const url = `${API_BASE}?platform=${platformEl.value}&ordering=${sortEl.value}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!data || !Array.isArray(data.results)) return [];

    return data.results;
  } catch (e) {
    console.error("API failed, using fallback:", e);
    return [];
  }
}

// ==========================
// FILTER NSFW
// ==========================

function isSafe(game) {
  const name = (game?.name || "").toLowerCase();
  const desc = (game?.description_raw || "").toLowerCase();

  // Title / description keyword scan
  for (let bad of NSFW_KEYWORDS) {
    if (name.includes(bad) || desc.includes(bad)) return false;
  }

  // RAWG tags & genres
  const allTags = [
    ...(game?.tags?.map(t => t.name.toLowerCase()) || []),
    ...(game?.genres?.map(g => g.name.toLowerCase()) || [])
  ];

  for (let bad of NSFW_KEYWORDS) {
    if (allTags.some(t => t.includes(bad))) return false;
  }

  // ESRB rating check
  const rating = game?.esrb_rating?.name?.toLowerCase() || "";
  if (rating.includes("adults")) return false;

  return true;
}

// ==========================
// CARD HTML BUILDER
// ==========================

function renderGameCard(game) {
  const isNew =
    game.released &&
    Date.now() - new Date(game.released).getTime() <= 1000 * 60 * 60 * 24 * 7;

  // Safe preview if image is missing or intentionally blocked
  const safePreview = !game.background_image;

  const imgHTML = safePreview
    ? `<div class="safe-preview">Preview Unavailable</div>`
    : `<div class="card-img"><img src="${game.background_image}" alt="${game.name}" /></div>`;

  return `
    <div class="card" onclick="openGame('${game.slug}')">
      ${imgHTML}
      <div class="card-body">
        <div class="card-title">
          ${game.name}
          ${isNew ? `<span class="badge-new">NEW</span>` : ""}
        </div>
        <div style="font-size:0.85rem; color:#666;">
          Released: ${game.released || "TBA"}
        </div>
      </div>
    </div>
  `;
}

// ==========================
// SEARCH FILTER
// ==========================

function applySearch(list) {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(g => g.name.toLowerCase().includes(q));
}

// ==========================
// RENDER LIST
// ==========================

function renderList() {
  let visible = [...allGames];

  // Search
  visible = applySearch(visible);

  // Draw
  if (visible.length === 0) {
    listEl.innerHTML = `<div style="padding:40px; text-align:center; color:#555;">No matches found.</div>`;
    return;
  }

  listEl.innerHTML = visible.map(game => renderGameCard(game)).join("");
}

// ==========================
// MAIN LOADING FLOW
// ==========================

async function loadGames() {
  // Shimmer placeholders already in index.html

  let games = await fetchGames();

  // Strong NSFW filter
  games = games.filter(isSafe);

  // Assign to global
  allGames = games;

  // Render
  renderList();
}


// ==========================
// OPEN GAME PAGE
// ==========================

function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}


// ==========================
// EVENT LISTENERS
// ==========================

platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", () => renderList());


// Initial load
loadGames();
