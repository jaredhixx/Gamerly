// public/app.js
// Gamerly — FINAL architecture: broad fetch, client-side filtering only

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
  section: "out-now",     // out-now | coming-soon
  timeFilter: "all",      // all | today | week | month
  platforms: new Set(),   // pc, xbox, etc
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
  // Only platform filtering server-side (coarse)
  const params = new URLSearchParams();
  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }
  return `/api/igdb?${params.toString()}`;
}

/* =========================
   CLIENT-SIDE FILTERING
========================= */
function applyFilters(games) {
  const now = Date.now();
  const DAY = 86400000;

  return games.filter(g => {
    // PLATFORM FILTER (client-side safety net)
    if (state.platforms.size && Array.isArray(g.platforms)) {
      const match = g.platforms.some(p => {
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
      if (!match) return false;
    }

    // TIME FILTER
    if (state.timeFilter === "all") return true;

    if (!g.releaseDate) {
      // Undated games stay visible except "Today"
      return state.timeFilter !== "today";
    }

    const t = new Date(g.releaseDate).getTime();

    if (state.section === "out-now") {
      if (t > now) return false;

      if (state.timeFilter === "today") return now - t < DAY;
      if (state.timeFilter === "week") return now - t < 7 * DAY;
      if (state.timeFilter === "month") return now - t < 30 * DAY;
    }

    if (state.section === "coming-soon") {
      if (t <= now) return false;

      if (state.timeFilter === "today") return t - now < DAY;
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

// See more
showMoreBtn.onclick = () => {
  state.visibleCount += PAGE_SIZE;
  render();
};

// Section
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

// Time
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

// Platform
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
