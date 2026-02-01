// public/app.js
// Gamerly — stable render + IGDB ratings + platform icons (FINAL SAFE BUILD)

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const sectionButtons = document.querySelectorAll(".section-segment button");
const timeButtons = document.querySelectorAll(".time-segment button");
const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  section: "out-now",
  timeFilter: "all",
  platforms: new Set(),
  data: { outNow: [], comingSoon: [] },
  visibleCount: 18,
};

/* =========================
   AGE GATE
========================= */
function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function confirmAge() {
  localStorage.setItem("gamerly_age_verified", "true");
  ageGate.style.display = "none";
  fetchGames();
}

if (isAgeVerified()) {
  ageGate.style.display = "none";
} else {
  ageGate.style.display = "flex";
  ageConfirmBtn.addEventListener("click", confirmAge);
}

/* =========================
   API
========================= */
function buildApiUrl() {
  const params = new URLSearchParams();
  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }
  return `/api/igdb?${params.toString()}`;
}

/* =========================
   TIME FILTERS
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();

    if (state.timeFilter === "today") {
      return t >= today && t < today + 86400000;
    }
    if (state.timeFilter === "week") {
      return t >= today - 6 * 86400000 && t <= today + 7 * 86400000;
    }
    if (state.timeFilter === "month") {
      return t >= today - 29 * 86400000 && t <= today + 30 * 86400000;
    }
    return true;
  });
}

/* =========================
   PLATFORM ICONS
========================= */
function mapPlatformChip(name) {
  const n = name.toLowerCase();
  if (n.includes("xbox")) return { key: "xbox", label: "Xbox" };
  if (n.includes("playstation")) return { key: "ps", label: "PS" };
  if (n.includes("nintendo")) return { key: "nintendo", label: "N" };
  if (n.includes("pc")) return { key: "pc", label: "PC" };
  if (n.includes("ios")) return { key: "ios", label: "iOS" };
  if (n.includes("android")) return { key: "android", label: "Android" };
  return null;
}

function renderPlatformOverlay(game) {
  if (!Array.isArray(game.platforms)) return "";

  const seen = new Set();
  const chips = [];

  game.platforms.forEach(p => {
    const mapped = mapPlatformChip(p);
    if (mapped && !seen.has(mapped.key)) {
      seen.add(mapped.key);
      chips.push(
        `<span class="platform-chip ${mapped.key}">${mapped.label}</span>`
      );
    }
  });

  return chips.length
    ? `<div class="platform-overlay">${chips.join("")}</div>`
    : "";
}

/* =========================
   CATEGORY
========================= */
function renderCategoryBadge(game) {
  if (!game.category) return "";
  const label = game.category.replace("Role-playing (RPG)", "RPG");
  return `<div class="badge-row"><span class="badge-category">${label}</span></div>`;
}

/* =========================
   RATINGS (IGDB)
========================= */
function renderRating(game) {
  const rating =
    game.aggregated_rating ??
    game.rating ??
    null;

  if (!rating) return "";

  return `
    <div class="rating-pill">
      ${Math.round(rating)}
    </div>
  `;
}

/* =========================
   RENDER
========================= */
function render(games) {
  grid.innerHTML = "";

  const filtered = applyTimeFilter(games);
  const visible = filtered.slice(0, state.visibleCount);

  if (!visible.length) {
    grid.innerHTML = "<p>No games found.</p>";
    showMoreBtn.style.display = "none";
    return;
  }

  visible.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-media">
        ${renderPlatformOverlay(g)}
        ${renderRating(g)}
        <img loading="lazy" src="${g.coverUrl || ""}" alt="${g.name}">
      </div>
      <div class="card-body">
        ${renderCategoryBadge(g)}
        <div class="card-title">${g.name}</div>
        <div class="card-meta">
          ${g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBD"}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display =
    state.visibleCount < filtered.length ? "block" : "none";
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
    if (!data.ok) throw new Error(data.error);

    state.data = data;
    state.visibleCount = 18;

    sectionButtons[0].innerHTML = `Out Now <span class="count">${data.outNow.length}</span>`;
    sectionButtons[1].innerHTML = `Coming Soon <span class="count">${data.comingSoon.length}</span>`;

    render(state.section === "out-now" ? data.outNow : data.comingSoon);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
========================= */
sectionButtons.forEach(btn => {
  btn.onclick = () => {
    sectionButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.section = btn.textContent.toLowerCase().includes("coming")
      ? "coming-soon"
      : "out-now";
    state.visibleCount = 18;
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

timeButtons.forEach(btn => {
  btn.onclick = () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const label = btn.textContent.toLowerCase();
    state.timeFilter =
      label.includes("today") ? "today" :
      label.includes("week") ? "week" :
      label.includes("month") ? "month" :
      "all";

    state.visibleCount = 18;
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

platformButtons.forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
    btn.classList.contains("active")
      ? state.platforms.add(btn.dataset.platform)
      : state.platforms.delete(btn.dataset.platform);
    fetchGames();
  };
});

showMoreBtn.onclick = () => {
  state.visibleCount += 18;
  render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
};

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
