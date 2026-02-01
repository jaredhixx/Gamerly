// public/app.js
// Gamerly — FINAL stable filtering + platform icons restored

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const timeButtons = document.querySelectorAll(".time-segment button");
const sectionButtons = document.querySelectorAll(".section-segment button");
const platformButtons = document.querySelectorAll("[data-platform]");

const PAGE_SIZE = 36;

const state = {
  section: "out-now",
  timeFilter: "all",
  platforms: new Set(),
  visibleCount: PAGE_SIZE,
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
  return "/api/igdb";
}

/* =========================
   PLATFORM ICON OVERLAY
========================= */
function renderPlatformOverlay(game) {
  if (!Array.isArray(game.platforms)) return "";

  const seen = new Set();
  const chips = [];

  game.platforms.forEach(p => {
    const n = p.toLowerCase();
    if (n.includes("xbox") && !seen.has("xbox")) {
      seen.add("xbox");
      chips.push(`<span class="platform-chip xbox">Ⓧ</span>`);
    }
    if (n.includes("playstation") && !seen.has("ps")) {
      seen.add("ps");
      chips.push(`<span class="platform-chip">PS</span>`);
    }
    if (n.includes("pc") && !seen.has("pc")) {
      seen.add("pc");
      chips.push(`<span class="platform-chip">PC</span>`);
    }
    if (n.includes("nintendo") && !seen.has("switch")) {
      seen.add("switch");
      chips.push(`<span class="platform-chip">Switch</span>`);
    }
    if (n.includes("ios") && !seen.has("ios")) {
      seen.add("ios");
      chips.push(`<span class="platform-chip">iOS</span>`);
    }
    if (n.includes("android") && !seen.has("android")) {
      seen.add("android");
      chips.push(`<span class="platform-chip">Android</span>`);
    }
  });

  return chips.length
    ? `<div class="platform-overlay">${chips.join("")}</div>`
    : "";
}

/* =========================
   FILTERING (CLIENT-SIDE)
========================= */
function applyFilters(games) {
  const now = Date.now();
  const DAY = 86400000;

  return games.filter(g => {
    // PLATFORM FILTER
    if (state.platforms.size && Array.isArray(g.platforms)) {
      const ok = g.platforms.some(p => {
        const n = p.toLowerCase();
        return (
          (state.platforms.has("pc") && n.includes("pc")) ||
          (state.platforms.has("xbox") && n.includes("xbox")) ||
          (state.platforms.has("playstation") && n.includes("playstation")) ||
          (state.platforms.has("nintendo") && n.includes("nintendo")) ||
          (state.platforms.has("ios") && n.includes("ios")) ||
          (state.platforms.has("android") && n.includes("android"))
        );
      });
      if (!ok) return false;
    }

    if (state.timeFilter === "all") return true;

    const t = g.releaseDate ? new Date(g.releaseDate).getTime() : null;

    // OUT NOW — strict past
    if (state.section === "out-now") {
      if (!t || t > now) return false;

      if (state.timeFilter === "today") return now - t < DAY;
      if (state.timeFilter === "week") return now - t < 7 * DAY;
      if (state.timeFilter === "month") return now - t < 30 * DAY;
    }

    // COMING SOON — TRUST BACKEND
    if (state.section === "coming-soon") {
      if (!t) return true; // keep undated games

      if (state.timeFilter === "today") return t >= now && t - now < DAY;
      if (state.timeFilter === "week") return t - now < 7 * DAY;
      if (state.timeFilter === "month") return t - now < 30 * DAY;
    }

    return true;
  });
}

/* =========================
   RENDER
========================= */
function render() {
  grid.innerHTML = "";

  const source =
    state.section === "out-now"
      ? state.data.outNow
      : state.data.comingSoon;

  const filtered = applyFilters(source);
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

  showMoreBtn.style.display =
    state.visibleCount < filtered.length ? "inline-flex" : "none";
}

/* =========================
   FETCH
========================= */
async function fetchGames() {
  loading.style.display = "block";
  errorBox.textContent = "";
  state.visibleCount = PAGE_SIZE;

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    state.data = data;

    sectionButtons[0].innerHTML =
      `Out Now <span class="count">${data.outNow.length}</span>`;
    sectionButtons[1].innerHTML =
      `Coming Soon <span class="count">${data.comingSoon.length}</span>`;

    render();
  } catch (err) {
    errorBox.textContent = err.message || "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
========================= */
showMoreBtn.onclick = () => {
  state.visibleCount += PAGE_SIZE;
  render();
};

sectionButtons.forEach(btn => {
  btn.onclick = () => {
    sectionButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.section = btn.textContent.toLowerCase().includes("coming")
      ? "coming-soon"
      : "out-now";

    state.visibleCount = PAGE_SIZE;
    render();
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

    state.visibleCount = PAGE_SIZE;
    render();
  };
});

platformButtons.forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
    btn.classList.contains("active")
      ? state.platforms.add(btn.dataset.platform)
      : state.platforms.delete(btn.dataset.platform);

    state.visibleCount = PAGE_SIZE;
    render();
  };
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
