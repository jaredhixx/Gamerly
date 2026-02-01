// public/app.js
// Gamerly — stable base with corrected time filtering

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const sectionButtons = document.querySelectorAll(".section-segment button");
const timeButtons = document.querySelectorAll(".time-segment button");
const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  section: "out-now",        // out-now | coming-soon
  timeFilter: "all",         // all | today | week | month
  platforms: new Set(),
  data: { outNow: [], comingSoon: [] },
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
   TIME FILTERS (FIXED)
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const DAY = 86400000;

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();

    // OUT NOW = past-focused
    if (state.section === "out-now") {
      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        return t >= todayStart - 6 * DAY && t <= todayStart;
      }
      if (state.timeFilter === "month") {
        return t >= todayStart - 29 * DAY && t <= todayStart;
      }
    }

    // COMING SOON = future-focused (RELAXED WINDOWS)
    if (state.section === "coming-soon") {
      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        // relaxed to absorb IGDB PC/iOS date fuzz
        return t > todayStart && t <= todayStart + 10 * DAY;
      }
      if (state.timeFilter === "month") {
        // relaxed window for realistic upcoming releases
        return t > todayStart && t <= todayStart + 45 * DAY;
      }
    }

    return true;
  });
}

/* =========================
   BADGE HELPERS
========================= */
function mapPlatformBadge(name) {
  const n = name.toLowerCase();
  if (n.includes("playstation")) return "PS";
  if (n.includes("xbox")) return "Xbox";
  if (n.includes("switch") || n.includes("nintendo")) return "Switch";
  if (n.includes("pc")) return "PC";
  if (n.includes("android")) return "Android";
  if (n.includes("ios")) return "iOS";
  return null;
}

function renderBadges(game) {
  const badges = [];

  if (game.category) {
    badges.push(
      `<span class="badge badge-category">${game.category.replace(
        "Role-playing (RPG)",
        "RPG"
      )}</span>`
    );
  }

  if (Array.isArray(game.platforms)) {
    const seen = new Set();
    game.platforms.forEach(p => {
      const label = mapPlatformBadge(p);
      if (label && !seen.has(label)) {
        seen.add(label);
        badges.push(
          `<span class="badge badge-platform">${label}</span>`
        );
      }
    });
  }

  return badges.join("");
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

  filtered.slice(0, 36).forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img loading="lazy" src="${g.coverUrl || ""}" alt="${g.name}">
      <div class="card-body">
        <div class="badge-row">
          ${renderBadges(g)}
        </div>
        <div class="card-title">${g.name}</div>
        <div class="card-meta">
          ${g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBD"}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
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
