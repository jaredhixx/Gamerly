// public/app.js
// Gamerly — stable build with platform overlay restored

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const sectionButtons = document.querySelectorAll(".section-segment button");
const timeButtons = document.querySelectorAll(".time-segment button");
const platformButtons = document.querySelectorAll("[data-platform]");

let visibleCount = 36;

const state = {
  section: "out-now",
  timeFilter: "all",
  platforms: new Set(),
  data: { outNow: [], comingSoon: [] }
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
  ageConfirmBtn.onclick = confirmAge;
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
   TIME FILTER
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();

    if (state.timeFilter === "today") {
      return t >= startOfToday && t < startOfToday + 86400000;
    }

    if (state.timeFilter === "week") {
      return t >= startOfToday - 6 * 86400000 &&
             t <= startOfToday + 6 * 86400000;
    }

    if (state.timeFilter === "month") {
      return t >= startOfToday - 29 * 86400000 &&
             t <= startOfToday + 30 * 86400000;
    }

    return true;
  });
}

/* =========================
   PLATFORM OVERLAY
========================= */
function renderPlatformOverlay(game) {
  if (!Array.isArray(game.platforms)) return "";

  const chips = [];
  const seen = new Set();

  game.platforms.forEach(p => {
    const n = p.toLowerCase();
    if (n.includes("xbox") && !seen.has("xbox")) {
      seen.add("xbox");
      chips.push(`<span class="platform-chip xbox">XBOX</span>`);
    }
    if (n.includes("playstation") && !seen.has("ps")) {
      seen.add("ps");
      chips.push(`<span class="platform-chip">PS</span>`);
    }
    if (n.includes("pc") && !seen.has("pc")) {
      seen.add("pc");
      chips.push(`<span class="platform-chip">PC</span>`);
    }
    if (n.includes("ios") && !seen.has("ios")) {
      seen.add("ios");
      chips.push(`<span class="platform-chip">iOS</span>`);
    }
    if (n.includes("android") && !seen.has("android")) {
      seen.add("android");
      chips.push(`<span class="platform-chip">Android</span>`);
    }
    if (n.includes("nintendo") && !seen.has("switch")) {
      seen.add("switch");
      chips.push(`<span class="platform-chip">Switch</span>`);
    }
  });

  if (!chips.length) return "";
  return `<div class="platform-overlay">${chips.join("")}</div>`;
}

/* =========================
   RENDER
========================= */
function render(games) {
  grid.innerHTML = "";

  const filtered = applyTimeFilter(games);
  if (!filtered.length) {
    grid.innerHTML = "<p>No games found.</p>";
    return;
  }

  filtered.slice(0, visibleCount).forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${renderPlatformOverlay(g)}
      <img loading="lazy" src="${g.coverUrl || ""}" alt="${g.name}">
      <div class="card-body">
        <div class="card-title">${g.name}</div>
        <div class="card-meta">
          ${g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBD"}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  if (visibleCount < filtered.length) {
    const btn = document.createElement("button");
    btn.className = "show-more";
    btn.textContent = "Show more";
    btn.onclick = () => {
      visibleCount += 36;
      render(filtered);
    };
    grid.appendChild(btn);
  }
}

/* =========================
   FETCH
========================= */
async function fetchGames() {
  loading.style.display = "block";
  errorBox.textContent = "";
  visibleCount = 36;

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    state.data = data;

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
    state.section = btn.textContent.toLowerCase().includes("coming") ? "coming-soon" : "out-now";
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

timeButtons.forEach(btn => {
  btn.onclick = () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const t = btn.textContent.toLowerCase();
    state.timeFilter =
      t.includes("today") ? "today" :
      t.includes("week") ? "week" :
      t.includes("month") ? "month" :
      "all";

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

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
