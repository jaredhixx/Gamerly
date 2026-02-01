// public/app.js
// Gamerly frontend — staged loading (initial + full)

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

  // staged data
  initialGames: [],
  fullGames: [],
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
  stagedLoad(true);
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
function buildApiUrl(mode) {
  const params = new URLSearchParams();
  params.set("mode", mode);

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
   FILTERS / SORT
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

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
function updateCounts(outNow, comingSoon) {
  sectionButtons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes("out now")) {
      btn.innerHTML = `Out Now <span class="count">${outNow.length}</span>`;
    } else {
      btn.innerHTML = `Coming Soon <span class="count">${comingSoon.length}</span>`;
    }
  });
}

/* =========================
   RENDER
========================= */
function renderCards(games) {
  grid.innerHTML = "";

  const visible = games.slice(0, state.visibleCount);

  visible.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = g.coverUrl || "";
    img.alt = g.name;
    img.className = "lazy-img";
    img.onload = () => img.classList.add("loaded");
    img.onerror = () => (img.style.display = "none");

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

function renderFrom(sourceGames) {
  const filtered = sortNewestFirst(applyTimeFilter(sourceGames));
  const { outNow, comingSoon } = splitByRelease(filtered);

  updateCounts(outNow, comingSoon);

  const active = state.section === "coming-soon" ? comingSoon : outNow;
  renderCards(active);
}

/* =========================
   STAGED LOAD (KEY)
========================= */
async function stagedLoad(reset = false) {
  if (reset) state.visibleCount = INITIAL_RENDER;

  loading.style.display = "block";
  errorBox.textContent = "";

  try {
    // PHASE 1 — INITIAL
    const initialRes = await fetch(buildApiUrl("initial"));
    const initialData = await initialRes.json();
    if (!initialData.ok) throw new Error(initialData.error);

    state.initialGames = initialData.games;
    renderFrom(state.initialGames);
    loading.style.display = "none";

    // PHASE 2 — FULL (BACKGROUND)
    const fullRes = await fetch(buildApiUrl("full"));
    const fullData = await fullRes.json();
    if (!fullData.ok) throw new Error(fullData.error);

    state.fullGames = fullData.games;
    renderFrom(state.fullGames);

  } catch (err) {
    errorBox.textContent = err.message;
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
    stagedLoad(true);
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

    stagedLoad(true);
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
    renderFrom(state.fullGames.length ? state.fullGames : state.initialGames);
  };
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  stagedLoad(true);
}
