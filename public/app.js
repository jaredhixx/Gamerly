// public/app.js
// Gamerly frontend — All + Today + This Week + This Month (locked flow)

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const platformButtons = document.querySelectorAll("[data-platform]");
const timeButtons = document.querySelectorAll(".time-segment button");

const state = {
  platforms: new Set(),
  timeFilter: "all", // all | today | week | month
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
  fetchGames();
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
   6-MONTH FUTURE CAP
========================= */
function applyFutureCap(games) {
  const now = Date.now();
  const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;

  return games.filter(g => {
    if (!g.releaseDate) return true;
    const t = new Date(g.releaseDate).getTime();
    return t - now <= SIX_MONTHS;
  });
}

/* =========================
   TODAY FILTER
========================= */
function applyTodayFilter(games) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const end = start + 24 * 60 * 60 * 1000;

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();
    return t >= start && t < end;
  });
}

/* =========================
   THIS WEEK FILTER
========================= */
function applyWeekFilter(games) {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const pastStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const futureEnd = todayStart + 7 * 24 * 60 * 60 * 1000;

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();
    return t >= pastStart && t <= futureEnd;
  });
}

/* =========================
   THIS MONTH FILTER (NEW)
========================= */
function applyMonthFilter(games) {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const pastStart = todayStart - 29 * 24 * 60 * 60 * 1000;
  const futureEnd = todayStart + 30 * 24 * 60 * 60 * 1000;

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();
    return t >= pastStart && t <= futureEnd;
  });
}

/* =========================
   SORT (NEWEST → OLDEST)
========================= */
function sortNewestFirst(games) {
  return [...games].sort((a, b) => {
    const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return bTime - aTime;
  });
}

/* =========================
   SPLIT OUT NOW / COMING SOON
========================= */
function splitByRelease(games) {
  const now = Date.now();
  const outNow = [];
  const comingSoon = [];

  games.forEach(g => {
    if (!g.releaseDate) {
      outNow.push(g);
    } else {
      const t = new Date(g.releaseDate).getTime();
      if (t <= now) outNow.push(g);
      else comingSoon.push(g);
    }
  });

  return { outNow, comingSoon };
}

/* =========================
   RENDER SECTIONS
========================= */
function renderSection(title, games) {
  if (!games.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "section-wrapper";
  wrapper.id = title.toLowerCase().replace(" ", "-");

  const header = document.createElement("h2");
  header.className = "section-title";
  header.textContent = title;

  const sectionGrid = document.createElement("div");
  sectionGrid.className = "grid-section";

  games.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = g.coverUrl || "";
    img.alt = g.name;
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
    sectionGrid.appendChild(card);
  });

  wrapper.appendChild(header);
  wrapper.appendChild(sectionGrid);
  grid.appendChild(wrapper);
}

function renderGames(games) {
  grid.innerHTML = "";

  if (!games.length) {
    grid.innerHTML = "<p>No games found.</p>";
    return;
  }

  const { outNow, comingSoon } = splitByRelease(games);

  renderSection("Out Now", outNow);
  renderSection("Coming Soon", comingSoon);
}

/* =========================
   FETCH
========================= */
async function fetchGames() {
  loading.style.display = "block";
  errorBox.textContent = "";

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to load games");
    }

    let games = applyFutureCap(data.games);

    if (state.timeFilter === "today") {
      games = applyTodayFilter(games);
    } else if (state.timeFilter === "week") {
      games = applyWeekFilter(games);
    } else if (state.timeFilter === "month") {
      games = applyMonthFilter(games);
    }

    games = sortNewestFirst(games);
    renderGames(games);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   PLATFORM EVENTS
========================= */
platformButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const p = btn.dataset.platform;

    if (state.platforms.has(p)) {
      state.platforms.delete(p);
      btn.classList.remove("active");
    } else {
      state.platforms.add(p);
      btn.classList.add("active");
    }

    fetchGames();
  });
});

/* =========================
   TIME SEGMENT EVENTS
========================= */
timeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const label = btn.textContent.toLowerCase();

    if (label === "today") state.timeFilter = "today";
    else if (label === "this week") state.timeFilter = "week";
    else if (label === "this month") state.timeFilter = "month";
    else state.timeFilter = "all";

    fetchGames();
  });
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
