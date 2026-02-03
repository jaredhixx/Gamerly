const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   STATE (LOCKED)
========================= */
let allGames = [];
let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   HELPERS
========================= */
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appleSearchTerm(str = "") {
  return str.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

/* =========================
   STORE CTA (LOCKED)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;

  const encodedName = encodeURIComponent(game.name);
  const appleTerm = appleSearchTerm(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows") || p.includes("pc"))
    return { label: "View on Steam →", url: `https://store.steampowered.com/search/?term=${encodedName}` };
  if (p.includes("playstation"))
    return { label: "View on PlayStation →", url: `https://store.playstation.com/search/${encodedName}` };
  if (p.includes("xbox"))
    return { label: "View on Xbox →", url: `https://www.xbox.com/en-US/Search?q=${encodedName}` };
  if (p.includes("nintendo"))
    return { label: "View on Nintendo →", url: `https://www.nintendo.com/us/search/#q=${encodedName}` };
  if (p.includes("ios"))
    return { label: "View on App Store →", url: `https://apps.apple.com/us/search?term=${encodeURIComponent(appleTerm)}` };
  if (p.includes("android"))
    return { label: "View on Google Play →", url: `https://play.google.com/store/search?q=${encodedName}&c=apps` };

  return { label: "View on Store →", url: `https://www.google.com/search?q=${encodedName}+game` };
}

/* =========================
   RENDER HELPERS (LOCKED)
========================= */
function renderRating(game) {
  const s = game.aggregated_rating;
  const c = game.aggregated_rating_count;
  if (typeof s !== "number" || typeof c !== "number" || s < 65) return "";
  return `<div class="rating-badge">${Math.round(s)}</div>`;
}

function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";
  const p = game.platforms.join(" ").toLowerCase();
  const chips = [];
  if (p.includes("windows")) chips.push(`<span class="platform-chip">PC</span>`);
  if (p.includes("xbox")) chips.push(`<span class="platform-chip xbox">Xbox</span>`);
  if (p.includes("playstation")) chips.push(`<span class="platform-chip ps">PS</span>`);
  if (p.includes("nintendo")) chips.push(`<span class="platform-chip">Switch</span>`);
  if (p.includes("ios")) chips.push(`<span class="platform-chip">iOS</span>`);
  if (p.includes("android")) chips.push(`<span class="platform-chip">Android</span>`);
  return chips.join("");
}

/* =========================
   LIST RENDER (STABLE)
========================= */
function renderList(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;
  grid.innerHTML = "";

  if (!slice.length) {
    grid.innerHTML = "<p>No games found.</p>";
    showMoreBtn.style.display = "none";
    return;
  }

  slice.forEach(game => {
    const store = getPrimaryStore(game);
    const releaseDate = new Date(game.releaseDate).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");

    card.innerHTML = `
      <img src="${game.coverUrl}" alt="${escapeHtml(game.name)} cover" />
      ${renderRating(game)}
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      <div class="card-body">
        ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta" style="display:flex; justify-content:space-between; align-items:center;">
          <span>${releaseDate}</span>
          ${
            store
              ? `<a class="card-cta"
                   href="${store.url}"
                   target="_blank"
                   rel="nofollow sponsored noopener"
                   onclick="event.stopPropagation()">
                   ${store.label}
                 </a>`
              : ""
          }
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   APPLY FILTERS (RESTORED — MINIMAL)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  renderList(allGames);
}

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb");
    const data = await res.json();
    if (!data.ok) throw new Error("API failed");

    allGames = data.games || [];
    applyFilters(true);
  } catch (err) {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   INIT
========================= */
loadGames();
