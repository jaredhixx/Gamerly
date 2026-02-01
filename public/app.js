// public/app.js
// Gamerly frontend — progressive render + lazy-loaded images

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const platformButtons = document.querySelectorAll("[data-platform]");
const timeButtons = document.querySelectorAll(".time-segment button");
const sectionButtons = document.querySelectorAll(".section-segment button");

const INITIAL_RENDER = 36;
const LOAD_MORE_STEP = 36;

const state = {
  platforms: new Set(),
  timeFilter: "all",
  section: "out-now",
  visibleCount: INITIAL_RENDER,
  lastResults: { outNow: [], comingSoon: [] }
};

/* =========================
   AGE VERIFICATION
========================= */
function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function confirmAge() {
  localStorage.setItem("gamerly_age_verified", "true");
  ageGate.style.display = "none";
  fetchGames(true);
}

if (!isAgeVerified()) {
  ageGate.style.display = "flex";
  ageConfirmBtn.addEventListener("click", confirmAge);
} else {
  ageGate.style.display = "none";
}

/* =========================
   HELPERS
========================= */
function buildApiUrl() {
  const params = new URLSearchParams();
  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }
  return `/api/igdb?${params.toString()}`;
}

function formatDate(date) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString();
}

/* =========================
   FILTERS & SORT
========================= */
function applyFutureCap(games) {
  const now = Date.now();
  const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;
  return games.filter(g =>
    !g.releaseDate || new Date(g.releaseDate).getTime() - now <= SIX_MONTHS
  );
}

function applyTimeFilter(games) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();

    if (state.timeFilter === "today") return t >= today && t < today + 86400000;
    if (state.timeFilter === "week") return t >= today - 6 * 86400000 && t <= today + 7 * 86400000;
    if (state.timeFilter === "month") return t >= today - 29 * 86400000 && t <= today + 30 * 86400000;
    return true;
  });
}

function sortNewestFirst(games) {
  return [...games].sort((a, b) =>
    new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0)
  );
}

function splitByRelease(games) {
  const now = Date.now();
  const outNow = [];
  const comingSoon = [];

  games.forEach(g => {
    if (!g.releaseDate || new Date(g.releaseDate).getTime() <= now) outNow.push(g);
    else comingSoon.push(g);
  });

  return { outNow, comingSoon };
}

/* =========================
   COUNTS
========================= */
function updateSectionCounts(outNow, comingSoon) {
  sectionButtons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes("out now")) {
      btn.innerHTML = `Out Now <span class="count">${outNow.length}</span>`;
    } else {
      btn.innerHTML = `Coming Soon <span class="count">${comingSoon.length}</span>`;
    }
  });
}

/* =========================
   RENDERING (LAZY IMAGES)
========================= */
function renderCards(games) {
  grid.innerHTML = "";

  const visible = games.slice(0, state.visibleCount);

  visible.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy";               // ✅ native lazy loading
    img.src = g.coverUrl || "";
    img.alt = g.name;
    img.className = "lazy-img";

    img.onerror = () => (img.style.display = "none");
    img.onload = () => img.classList.add("loaded");

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <div class="card-title">${g.name}</div>
      <div class="card-meta">${formatDate(g.releaseDate)}</div>
      <div class="card-meta">${g.rating ? g.rating + "/100" : "No rating"}</div>
    `;

    card.appendChild(img);
    card.appendChild(body);
    grid.appendChild(card);
  });

  if (games.length > state.visibleCount) {
    const btn = document.createElement("button");
    btn.className = "show-more";
    btn.textContent = `Show more (${games.length - state.visibleCount} remaining)`;
    btn.onclick = () => {
      state.visibleCount += LOAD_MORE_STEP;
      renderCards(games);
    };
    grid.appendChild(btn);
  }
}

function renderGames() {
  const { outNow, comingSoon } = state.lastResults;
  updateSectionCounts(outNow, comingSoon);

  const active = state.section === "coming-soon" ? comingSoon : outNow;
  renderCards(active);
}

/* =========================
   FETCH
========================= */
async function fetchGames(reset = false) {
  if (reset) state.visibleCount = INITIAL_RENDER;

  loading.style.display = "block";
  errorBox.textContent = "";

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load games");

    let games = applyFutureCap(data.games);
    games = applyTimeFilter(games);
    games = sortNewestFirst(games);

    state.lastResults = splitByRelease(games);
    renderGames();
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
========================= */
platformButtons.forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
    btn.classList.contains("active")
      ? state.platforms.add(btn.dataset.platform)
      : state.platforms.delete(btn.dataset.platform);
    fetchGames(true);
  };
});

timeButtons.forEach(btn => {
  btn.onclick = () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.timeFilter =
      btn.textContent.toLowerCase().includes("today") ? "today" :
      btn.textContent.toLowerCase().includes("week") ? "week" :
      btn.textContent.toLowerCase().includes("month") ? "month" :
      "all";

    fetchGames(true);
  };
});

sectionButtons.forEach(btn => {
  btn.onclick = () => {
    sectionButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.section = btn.textContent.toLowerCase().includes("coming")
      ? "coming-soon"
      : "out-now";

    state.visibleCount = INITIAL_RENDER;
    renderGames();
  };
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames(true);
}
