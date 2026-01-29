//
// Gamerly — Fast-cache build (Apple/Netflix-feel foundation)
// Keeps aesthetics & filters identical, adds local caching and instant reload
//

const API_BASE = "/api/games";
const CACHE_KEY = "gamerly_cache_v1";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const listEl = document.getElementById("game-list");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

// ---------- Platform Buttons ----------
const platformRow = document.createElement("div");
platformRow.className = "platform-row";
document.querySelector(".toolbar").before(platformRow);

const platforms = [
  { id: "pc", label: "PC" },
  { id: "playstation", label: "PlayStation" },
  { id: "xbox", label: "Xbox" },
  { id: "nintendo", label: "Nintendo" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
];

let activePlatforms = new Set();
let allGames = [];

platformRow.innerHTML = platforms
  .map(
    (p) => `
      <button class="platform-btn" data-id="${p.id}">
        ${p.label}<span class="checkmark">✓</span>
      </button>`
  )
  .join("");

platformRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".platform-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  btn.classList.toggle("active");
  if (activePlatforms.has(id)) activePlatforms.delete(id);
  else activePlatforms.add(id);
  renderList();
});

// ---------- Helpers ----------
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const withinRange = (dateStr, range) => {
  const d = new Date(dateStr);
  if (range === "today") return d >= daysAgo(1);
  if (range === "week") return d >= daysAgo(7);
  if (range === "year") return d >= daysAgo(90);
  return true;
};

// ---------- Cache Helpers ----------
function loadCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!cached) return null;
    const age = Date.now() - cached.timestamp;
    if (age > CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function saveCache(data) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ timestamp: Date.now(), data })
  );
}

// ---------- Fetch ----------
async function fetchGames(force = false) {
  if (!force) {
    const cached = loadCache();
    if (cached?.length) {
      console.log("Loaded from cache ✅");
      allGames = cached;
      renderList();
      refreshInBackground(); // silently refresh newer data
      return;
    }
  }

  listEl.innerHTML =
    `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;

  try {
    const res = await fetch(`${API_BASE}?page_size=80`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.results)) throw new Error("Bad data");
    const clean = data.results.filter(
      (g) =>
        g.released &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.slug || "")
    );
    allGames = clean;
    saveCache(clean);
    renderList();
  } catch (err) {
    console.error("fetch error:", err);
    listEl.innerHTML =
      `<div style="padding:40px;text-align:center;color:#777;">Error loading games.</div>`;
  }
}

// ---------- Background refresh ----------
async function refreshInBackground() {
  try {
    const res = await fetch(`${API_BASE}?page_size=80`, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data.results) && data.results.length) {
      const clean = data.results.filter((g) => g.released);
      saveCache(clean);
      console.log("Cache refreshed 🔁");
    }
  } catch (err) {
    console.warn("Background refresh failed:", err);
  }
}

// ---------- Render ----------
function renderGameCard(game) {
  const released = game.released || "TBA";
  const img = game.background_image || game.short_screenshots?.[0]?.image || "";
  const platformsHTML =
    game.parent_platforms
      ?.map((p) => `<span class="badge">${p.platform.name}</span>`)
      .join(" ") || "";

  const meta =
    game.metacritic != null
      ? `<span class="badge-meta ${
          game.metacritic >= 75
            ? "meta-good"
            : game.metacritic >= 50
            ? "meta-mid"
            : "meta-bad"
        }">${game.metacritic}</span>`
      : `<span class="badge-meta meta-na">N/A</span>`;

  return `
    <div class="card" onclick="window.location='/game.html?slug=${game.slug}'" title="${game.name}">
      ${
        img
          ? `<div class="card-img fade-in"><img src="${img}" alt="${game.name}" loading="lazy"></div>`
          : `<div class="safe-preview">Preview Unavailable</div>`
      }
      <div class="card-body">
        <div class="card-title">${game.name}</div>
        <div class="meta-row">${meta}<span class="release-date">Released: ${released}</span></div>
        <div class="badges">${platformsHTML}</div>
      </div>
    </div>`;
}

function renderList() {
  let visible = [...allGames];

  // --- Platforms ---
  if (activePlatforms.size) {
    visible = visible.filter((g) =>
      g.parent_platforms?.some((p) =>
        activePlatforms.has(p.platform.slug || p.platform.name?.toLowerCase())
      )
    );
  }

  // --- Date Range ---
  const range = dateEl.value;
  if (range && range !== "all")
    visible = visible.filter((g) => withinRange(g.released, range));

  // --- Search ---
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter((g) => g.name.toLowerCase().includes(q));

  // --- Sort ---
  const sort = sortEl.value;
  if (sort === "released")
    visible.sort((a, b) => new Date(b.released) - new Date(a.released));
  if (sort === "-rating")
    visible.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
  if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name));

  // --- Render ---
  listEl.style.opacity = 0;
  setTimeout(() => {
    listEl.innerHTML = visible.length
      ? visible.map(renderGameCard).join("")
      : `<div style="padding:40px;text-align:center;color:#777;">No games found.</div>`;
    listEl.style.opacity = 1;
  }, 150);
}

// ---------- Init ----------
async function init() {
  await fetchGames();
}

sortEl.addEventListener("change", renderList);
searchEl.addEventListener("input", renderList);
dateEl.addEventListener("change", renderList);

init();
