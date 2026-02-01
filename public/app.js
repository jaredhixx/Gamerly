// public/app.js
// Gamerly — stable baseline + See More (FINAL)

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
  section: "out-now",        // out-now | coming-soon
  timeFilter: "all",         // all | today | week | month
  platforms: new Set(),
  data: { outNow: [], comingSoon: [] },
  visibleCount: PAGE_SIZE,
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
   TIME FILTERS (LOCKED & TRUSTED)
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = Date.now();
  const DAY = 86400000;

  // OUT NOW — strict past-facing logic
  if (state.section === "out-now") {
    return games.filter(g => {
      if (!g.releaseDate) return false;
      const t = new Date(g.releaseDate).getTime();
      if (t > now) return false;

      if (state.timeFilter === "today") return now - t < DAY;
      if (state.timeFilter === "week") return now - t < 7 * DAY;
      if (state.timeFilter === "month") return now - t < 30 * DAY;
      return true;
    });
  }

  // COMING SOON — TRUST IGDB (week/month == all)
  if (state.section === "coming-soon") {
    if (state.timeFilter === "today") {
      return games.filter(g => {
        if (!g.releaseDate) return false;
        const t = new Date(g.releaseDate).getTime();
        return t > now && t - now < DAY;
      });
    }
    return games;
  }

  return games;
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

    render(state.section === "out-now" ? data.outNow : data.comingSoon);
  } catch (err) {
    errorBox.textContent = err.message || "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
========================= */

// See More
showMoreBtn.onclick = () => {
  state.visibleCount += PAGE_SIZE;
  render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
};

// Section switch
sectionButtons.forEach(btn => {
  btn.onclick = () => {
    sectionButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.section = btn.textContent.toLowerCase().includes("coming")
      ? "coming-soon"
      : "out-now";

    state.visibleCount = PAGE_SIZE;
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

// Time filters
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

    state.visibleCount = PAGE_SIZE;
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

// Platform filters
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
