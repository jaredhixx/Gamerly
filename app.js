//
// Gamerly – Final Stable Version with Quick Preview (Apple / Netflix Feel)
//
const API_BASE = "/api/games";
const listEl = document.getElementById("game-list");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

// ---------- Platform Toggles ----------
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

// ---------- Render Single Card ----------
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
    <div class="card" data-slug="${game.slug}" title="${game.name}">
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

// ---------- Render List ----------
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

    // lazy fade-in
    document.querySelectorAll(".fade-in").forEach((el) => {
      el.style.opacity = 0;
      setTimeout(() => {
        el.style.transition = "opacity 0.8s ease";
        el.style.opacity = 1;
      }, 100);
    });
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

// ---------- Quick Preview Modal ----------
const modal = document.getElementById("preview-modal");
const closeBtn = document.getElementById("close-preview");
const previewBody = document.getElementById("preview-body");

document.body.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card || !card.dataset.slug) return;

  const game = allGames.find((g) => g.slug === card.dataset.slug);
  if (!game) return;

  showPreview(game);
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("preview-backdrop")) {
    modal.classList.add("hidden");
  }
});

function showPreview(game) {
  const img = game.background_image || game.short_screenshots?.[0]?.image || "";
  const desc = (game.description_raw || game.name || "")
    .slice(0, 220)
    .replace(/<\/?[^>]+(>|$)/g, "") + "…";
  const platforms =
    game.parent_platforms
      ?.map((p) => `<span>${p.platform.name}</span>`)
      .join("") || "";
  const meta = game.metacritic
    ? `<span style="background:${
        game.metacritic >= 75
          ? "#16a34a"
          : game.metacritic >= 50
          ? "#facc15"
          : "#dc2626"
      };padding:4px 8px;border-radius:8px;margin-left:8px;">${game.metacritic}</span>`
    : "";

  previewBody.innerHTML = `
    <div class="preview-body">
      ${img ? `<img src="${img}" alt="${game.name}" />` : ""}
      <div class="preview-title">${game.name}${meta}</div>
      <div class="preview-desc">${desc}</div>
      <div class="preview-badges">${platforms}</div>
      <a href="/game.html?slug=${game.slug}" class="view-btn">View Full Details</a>
    </div>
  `;

  modal.classList.remove("hidden");
}
