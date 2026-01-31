// /public/app.js

// ===== DOM HOOKS (adjust IDs here if needed) =====
const gamesGrid = document.getElementById("gamesGrid");
const loadingEl = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const sortSelect = document.getElementById("sortSelect");
const rangeSelect = document.getElementById("rangeSelect");

const platformButtons = Array.from(document.querySelectorAll("[data-platform]"));

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

// ===== STATE =====
const state = {
  platforms: new Set(), // e.g. "pc", "xbox"
  sort: "newest",       // newest | highest_rated | az
  range: "this_week",   // this_week | past_3_months | all_time
  limit: 36,
  offset: 0,
  isReady: false,
};

// ===== HELPERS =====
function setLoading(isLoading) {
  if (!loadingEl) return;
  loadingEl.style.display = isLoading ? "block" : "none";
}

function setError(msg) {
  if (!errorBox) return;
  if (!msg) {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  } else {
    errorBox.style.display = "block";
    errorBox.textContent = msg;
  }
}

function formatDate(iso) {
  if (!iso) return "Unknown release date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown release date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function ratingText(rating, ratingCount) {
  if (typeof rating !== "number") return "No rating";
  if (typeof ratingCount === "number" && ratingCount > 0) {
    return `${rating}/100 (${ratingCount})`;
  }
  return `${rating}/100`;
}

function getSelectedPlatforms() {
  return Array.from(state.platforms);
}

function buildApiUrl() {
  const params = new URLSearchParams();
  const plats = getSelectedPlatforms();
  if (plats.length) params.set("platforms", plats.join(","));
  params.set("sort", state.sort);
  params.set("range", state.range);
  params.set("limit", String(state.limit));
  params.set("offset", String(state.offset));
  return `/api/igdb?${params.toString()}`;
}

function placeholderCover() {
  // If you add /public/assets/placeholder-cover.png use this:
  return "/assets/placeholder-cover.png";
  // Otherwise you can return a simple CSS background fallback and keep this blank:
  // return "";
}

function clearGrid() {
  if (gamesGrid) gamesGrid.innerHTML = "";
}

function renderGames(games) {
  clearGrid();

  if (!gamesGrid) return;

  if (!Array.isArray(games) || games.length === 0) {
    gamesGrid.innerHTML = `<div class="emptyState">No games found.</div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  for (const g of games) {
    const card = document.createElement("div");
    card.className = "gameCard";

    const coverUrl = g.coverUrl || placeholderCover();
    const rel = formatDate(g.releaseDate);
    const rText = ratingText(g.rating, g.ratingCount);

    // Use basic, resilient markup that won’t explode on missing data.
    card.innerHTML = `
      <div class="gameCover">
        <img src="${coverUrl}" alt="${escapeHtml(g.name)} cover"
             onerror="this.onerror=null;this.src='${placeholderCover()}';" />
      </div>
      <div class="gameInfo">
        <div class="gameTitle">${escapeHtml(g.name)}</div>
        <div class="gameMeta">
          <span class="releaseDate">${rel}</span>
          <span class="rating">${rText}</span>
        </div>
        <div class="gamePlatforms">${escapeHtml((g.platforms || []).slice(0, 3).join(" • "))}</div>
      </div>
    `;

    frag.appendChild(card);
  }

  gamesGrid.appendChild(frag);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== API =====
async function fetchGames() {
  setError("");
  setLoading(true);

  try {
    const url = buildApiUrl();
    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || !data?.ok) {
      const details = data?.error ? `: ${data.error}` : "";
      throw new Error(`Failed to load games${details}`);
    }

    renderGames(data.games);
  } catch (err) {
    renderGames([]);
    setError(err?.message || "Unknown error");
  } finally {
    setLoading(false);
  }
}

// ===== UI WIRING =====
function updatePlatformButtonStyles() {
  for (const btn of platformButtons) {
    const key = btn.getAttribute("data-platform");
    const active = state.platforms.has(key);
    btn.classList.toggle("active", active);
  }
}

function togglePlatform(key) {
  if (state.platforms.has(key)) state.platforms.delete(key);
  else state.platforms.add(key);

  updatePlatformButtonStyles();
  state.offset = 0;
  fetchGames();
}

function bindControls() {
  // Platform buttons
  platformButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-platform");
      if (!key) return;
      togglePlatform(key);
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.offset = 0;
      fetchGames();
    });
  }

  // Range
  if (rangeSelect) {
    rangeSelect.addEventListener("change", () => {
      state.range = rangeSelect.value;
      state.offset = 0;
      fetchGames();
    });
  }
}

// ===== AGE GATE =====
function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function setAgeVerified() {
  localStorage.setItem("gamerly_age_verified", "true");
}

function showApp() {
  if (ageGate) ageGate.style.display = "none";
  state.isReady = true;
  fetchGames();
}

function initAgeGate() {
  if (!ageGate || !ageConfirmBtn) {
    // If you don’t have an overlay in DOM, just load immediately.
    showApp();
    return;
  }

  if (isAgeVerified()) {
    showApp();
    return;
  }

  // Keep overlay visible until confirmed
  ageGate.style.display = "flex";
  ageConfirmBtn.addEventListener("click", () => {
    setAgeVerified();
    showApp();
  });
}

// ===== INIT =====
function init() {
  bindControls();

  // Optional defaults:
  // - start with none selected (shows all platforms)
  // - or preselect PC:
  // state.platforms.add("pc"); updatePlatformButtonStyles();

  // Pull initial values from selects if present
  if (sortSelect && sortSelect.value) state.sort = sortSelect.value;
  if (rangeSelect && rangeSelect.value) state.range = rangeSelect.value;

  updatePlatformButtonStyles();
  initAgeGate();
}

document.addEventListener("DOMContentLoaded", init);
