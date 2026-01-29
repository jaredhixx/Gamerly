//
// Gamerly app.js — ultra-stable minimal build (final filter fix)
// Stripped down to verified RAWG behavior + local release-date validation
//

const API_BASE = "/api/games";
const listEl = document.getElementById("game-list");
const platformEl = document.getElementById("platform");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

let allGames = [];

// =============== HELPERS ===============
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDateRange() {
  const today = new Date();
  let start = new Date("2000-01-01");
  let end = new Date(today);

  switch (dateEl.value) {
    case "today":
      start = new Date(today);
      break;
    case "week":
      start.setDate(today.getDate() - 7);
      break;
    case "year":
      start.setFullYear(today.getFullYear() - 1);
      break;
    default:
      break;
  }

  return `${formatDate(start)},${formatDate(end)}`;
}

// =============== FETCH GAMES ===============
async function fetchGames() {
  const platform = platformEl.value;
  const sort = sortEl.value;
  const ordering =
    sort === "released" ? "-released" :
    sort === "-rating" ? "-rating" :
    sort === "name" ? "name" : "-released";

  const dates = getDateRange();
  const url = `${API_BASE}?platform=${platform}&dates=${dates}&ordering=${ordering}&page_size=40`;

  console.log("Fetching:", url);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok || !data?.results) return [];

    const now = new Date();

    // ✅ Strictest possible filtering:
    return data.results
      .filter(g => {
        if (!g?.released) return false;
        const rel = new Date(g.released);
        return (
          !g.tba &&
          rel <= now &&
          rel.getFullYear() >= 2000 &&
          rel.toString() !== "Invalid Date"
        );
      })
      .sort((a, b) => new Date(b.released) - new Date(a.released));
  } catch (err) {
    console.error(err);
    return [];
  }
}

// =============== RENDER ===============
function renderGameCard(game) {
  const released = game.released || "TBA";
  const img = game.background_image || (game.short_screenshots?.[0]?.image ?? "");
  const platforms =
    game.parent_platforms?.map(p => `<span class="badge">${p.platform.name}</span>`).join(" ") || "";
  const meta =
    game.metacritic != null
      ? `<span class="badge-meta ${
          game.metacritic >= 75 ? "meta-good" :
          game.metacritic >= 50 ? "meta-mid" : "meta-bad"
        }">${game.metacritic}</span>`
      : `<span class="badge-meta meta-na">N/A</span>`;

  return `
    <div class="card">
      ${img
        ? `<div class="card-img"><img src="${img}" alt="${game.name}" loading="lazy"></div>`
        : `<div class="safe-preview">Preview Unavailable</div>`}
      <div class="card-body">
        <div class="card-title">${game.name}</div>
        <div class="meta-row">${meta}<span class="release-date">Released: ${released}</span></div>
        <div class="badges">${platforms}</div>
      </div>
    </div>`;
}

function renderList() {
  let visible = [...allGames];
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter(g => g.name.toLowerCase().includes(q));

  listEl.innerHTML = visible.length
    ? visible.map(renderGameCard).join("")
    : `<div style="padding:40px;text-align:center;color:#777;">No games found.</div>`;
}

// =============== LOAD ===============
async function loadGames() {
  listEl.innerHTML = `
    <div class="shimmer"></div>
    <div class="shimmer"></div>
    <div class="shimmer"></div>
  `;
  const games = await fetchGames();
  allGames = games;
  renderList();
}

// =============== EVENTS ===============
platformEl.addEventListener("change", loadGames);
sortEl.addEventListener("change", loadGames);
dateEl.addEventListener("change", loadGames);
searchEl.addEventListener("input", renderList);

// =============== INIT ===============
loadGames();
