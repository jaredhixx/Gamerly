//
// Gamerly - rebuilt filter logic (stable, Apple/Netflix style)
//
// Handles platform toggles, date filters, and local sorting reliably.
//

const API_BASE = "/api/games";
const listEl = document.getElementById("game-list");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");
const platformRow = document.createElement("div");
platformRow.className = "platform-row";
document.querySelector(".toolbar").before(platformRow);

// Platform toggles setup
const platforms = [
  { id: "pc", label: "PC" },
  { id: "playstation", label: "PlayStation" },
  { id: "xbox", label: "Xbox" },
  { id: "nintendo", label: "Nintendo" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" }
];

let activePlatforms = new Set();
let allGames = [];

// Build buttons visually
platformRow.innerHTML = platforms
  .map(
    (p) => `
    <button class="platform-btn" data-id="${p.id}">
      ${p.label} <span class="checkmark">✓</span>
    </button>
  `
  )
  .join("");

// Add toggle behavior
platformRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".platform-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  if (activePlatforms.has(id)) {
    activePlatforms.delete(id);
    btn.classList.remove("active");
  } else {
    activePlatforms.add(id);
    btn.classList.add("active");
  }
  renderList();
});

// === Helper: Dates ===
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function withinRange(dateStr, range) {
  const d = new Date(dateStr);
  if (range === "today") return d >= daysAgo(1);
  if (range === "week") return d >= daysAgo(7);
  if (range === "year") return d >= daysAgo(90);
  return true;
}

// === Fetch RAWG data ===
async function fetchGames() {
  listEl.innerHTML = `
    <div class="shimmer"></div>
    <div class="shimmer"></div>
    <div class="shimmer"></div>
  `;

  const url = `${API_BASE}?page_size=100&ordering=-released`;
  console.log("Fetching:", url);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || !Array.isArray(data.results)) return [];
  const safeGames = data.results.filter(
    (g) =>
      g.released &&
      !/hentai|porn|sex|erotic/i.test(g.name || "") &&
      !/hentai|porn|sex|erotic/i.test(g.slug || "")
  );

  return safeGames;
}

// === Render ===
function renderGameCard(game) {
  const released = game.released || "TBA";
  const img = game.background_image || game.short_screenshots?.[0]?.image || "";
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

// === Render List ===
function renderList() {
  let visible = [...allGames];

  // Platform filtering
  if (activePlatforms.size > 0) {
    visible = visible.filter((g) =>
      g.parent_platforms?.some((p) => activePlatforms.has(p.platform.slug))
    );
  }

  // Date filtering
  const range = dateEl.value;
  if (range && range !== "all") {
    visible = visible.filter((g) => withinRange(g.released, range));
  }

  // Search
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter((g) => g.name.toLowerCase().includes(q));

  // Sorting
  const sort = sortEl.value;
  if (sort === "released") visible.sort((a, b) => new Date(b.released) - new Date(a.released));
  if (sort === "-rating") visible.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
  if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name));

  listEl.innerHTML = visible.length
    ? visible.map(renderGameCard).join("")
    : `<div style="padding:40px;text-align:center;color:#777;">No games found.</div>`;
}

// === Init ===
async function init() {
  allGames = await fetchGames();
  renderList();
}

// === Event listeners ===
sortEl.addEventListener("change", renderList);
searchEl.addEventListener("input", renderList);
dateEl.addEventListener("change", renderList);

// === Start ===
init();
