//
// Gamerly – Final Stable Version (Apple/Netflix feel)
// One RAWG fetch → local filtering for platform/date/sort/search.
//

const API_BASE = "/api/games";
const listEl = document.getElementById("game-list");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

// ---------- Platform Toggles (top row) ----------
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

// ---------- Fetch once ----------
async function fetchGames() {
  listEl.innerHTML =
    `<div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
  try {
    const res = await fetch(`${API_BASE}?page_size=80`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.results)) return [];
    return data.results.filter(
      (g) =>
        g.released &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.slug || "")
    );
  } catch (err) {
    console.error("fetch error:", err);
    return [];
  }
}

// ---------- Render ----------
return `
  <div class="card" onclick="window.location='/game.html?slug=${game.slug}'" title="${game.name}">
    ${img
      ? `<div class="card-img"><img src="${img}" alt="${game.name}" loading="lazy"></div>`
      : `<div class="safe-preview">Preview Unavailable</div>`}
    <div class="card-body">
      <div class="card-title">${game.name}</div>
      <div class="meta-row">${meta}<span class="release-date">Released: ${released}</span></div>
      <div class="badges">${platforms}</div>
    </div>
  </div>`;


  return `
    <div class="card">
      ${
        img
          ? `<div class="card-img"><img src="${img}" alt="${game.name}" loading="lazy"></div>`
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
      g.parent_platforms?.some((p) => activePlatforms.has(p.platform.slug))
    );
  }

  // --- Date Range ---
  const range = dateEl.value;
  if (range && range !== "all") visible = visible.filter((g) => withinRange(g.released, range));

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
  allGames = await fetchGames();
  renderList();
}

sortEl.addEventListener("change", renderList);
searchEl.addEventListener("input", renderList);
dateEl.addEventListener("change", renderList);

init();
