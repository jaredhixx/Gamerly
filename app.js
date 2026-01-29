//
// Gamerly app.js — Stable filters restored (from working v4) + 18+ popup
//

const API_BASE = "/api/games";

const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

let allGames = [];

// ==================== AGE GATE ====================
function showAgeGate() {
  if (sessionStorage.getItem("ageVerified")) return;
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);
    display:flex;align-items:center;justify-content:center;
    color:white;font-family:system-ui;text-align:center;backdrop-filter:blur(8px);
  `;
  overlay.innerHTML = `
    <div style="max-width:320px;background:#111827;padding:24px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.4);">
      <h2 style="margin-bottom:12px;font-weight:800;">Are you 18 or older?</h2>
      <p style="color:#ccc;margin-bottom:20px;">Gamerly may include mature-rated content.</p>
      <button id="yesBtn" style="padding:10px 20px;font-weight:700;background:#22c55e;border:none;border-radius:8px;color:white;cursor:pointer;">Yes, Enter</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById("yesBtn").onclick = () => {
    sessionStorage.setItem("ageVerified", "true");
    overlay.remove();
  };
}
showAgeGate();

// ==================== HELPERS ====================
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDateRange() {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);

  switch (dateEl.value) {
    case "today":
      break;
    case "week":
      start.setDate(today.getDate() - 7);
      break;
    case "year":
      start.setFullYear(today.getFullYear() - 1);
      break;
    default:
      start = new Date("2000-01-01");
      break;
  }
  return `${formatDate(start)},${formatDate(end)}`;
}

// ==================== FETCH GAMES ====================
async function fetchGames() {
  const platform = platformEl.value;
  const sort = sortEl.value;
  const ordering =
    sort === "released" ? "-released" :
    sort === "-rating" ? "-rating" :
    sort === "name" ? "name" : "-released";

  const dates = getDateRange();
  const url = `${API_BASE}?platform=${platform}&dates=${dates}&ordering=${ordering}&page_size=30`;

  console.log("Fetching games:", url);
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || !data?.results) return [];
  return data.results;
}

// ==================== RENDER GAME CARD ====================
function renderGameCard(game) {
  const released = game.released || "TBA";
  const isNew = game.released && (new Date() - new Date(game.released)) < 7 * 24 * 60 * 60 * 1000;
  const imgSrc = game.background_image || (game.short_screenshots?.[0]?.image ?? "");
  const imgHTML = imgSrc
    ? `<div class="card-img"><img src="${imgSrc}" alt="${game.name}" loading="lazy"></div>`
    : `<div class="safe-preview">Preview Unavailable</div>`;

  const platforms =
    game.parent_platforms?.map(p => `<span class="badge">${p.platform.name}</span>`).join(" ") || "";

  const meta = game.metacritic != null
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
          ${game.name}${isNew ? ` <span class="badge-new">NEW</span>` : ""}
        </div>
        <div class="meta-row">
          ${meta}
          <span class="release-date">Released: ${released}</span>
        </div>
        <div class="badges">${platforms}</div>
      </div>
    </div>
  `;
}

// ==================== RENDER LIST ====================
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

// ==================== LOAD GAMES ====================
async function loadGames() {
  listEl.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
  try {
    const games = await fetchGames();
    allGames = games;
    renderList();
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#777;">Error loading games.</div>`;
  }
}

// ==================== NAVIGATION ====================
function openGame(slug) {
  window.location.href = `/game.html?slug=${slug}`;
}

// ==================== EVENTS ====================
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
dateEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", renderList);

// ==================== INIT ====================
loadGames();
