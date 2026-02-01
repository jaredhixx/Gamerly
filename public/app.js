// public/app.js
// Gamerly — stable baseline + tasteful platform glyphs (ROI-safe)

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

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
  ageConfirmBtn.onclick = confirmAge;
} else {
  ageGate.style.display = "none";
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
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  return games.filter(g => {
    if (!g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();

    if (state.timeFilter === "today") {
      return t >= todayStart && t < todayStart + 86400000;
    }
    if (state.timeFilter === "week") {
      return t >= todayStart - 6 * 86400000 &&
             t <= todayStart + 7 * 86400000;
    }
    if (state.timeFilter === "month") {
      return t >= todayStart - 29 * 86400000 &&
             t <= todayStart + 30 * 86400000;
    }
    return true;
  });
}

/* =========================
   PLATFORM GLYPHS (MINIMAL)
========================= */
const PLATFORM_GLYPHS = {
  pc: `<svg viewBox="0 0 24 24" aria-hidden="true">
         <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
         <path d="M8 20h8" stroke="currentColor" stroke-width="1.5"/>
       </svg>`,

  playstation: `<svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v18" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M12 3l6 4v10l-6-4" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,

  xbox: `<svg viewBox="0 0 24 24" aria-hidden="true">
           <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
           <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="1.2"/>
         </svg>`,

  nintendo: `<svg viewBox="0 0 24 24" aria-hidden="true">
               <rect x="4" y="6" width="16" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
             </svg>`,

  ios: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4c1.5 1.2 2 2.6 2 4" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 10c0-2.2 1.8-4 4-4s4 1.8 4 4v6c0 2.2-1.8 4-4 4s-4-1.8-4-4z"
                fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>`,

  android: `<svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="7" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9 4l-1-2M15 4l1-2" stroke="currentColor" stroke-width="1.2"/>
            </svg>`
};

function platformKey(name) {
  const n = name.toLowerCase();
  if (n.includes("playstation")) return "playstation";
  if (n.includes("xbox")) return "xbox";
  if (n.includes("switch") || n.includes("nintendo")) return "nintendo";
  if (n.includes("pc")) return "pc";
  if (n.includes("android")) return "android";
  if (n.includes("ios")) return "ios";
  return null;
}

function renderBadges(game) {
  const badges = [];

  if (game.category) {
    badges.push(
      `<span class="badge badge-category">
        ${game.category.replace("Role-playing (RPG)", "RPG")}
      </span>`
    );
  }

  if (Array.isArray(game.platforms)) {
    const seen = new Set();
    game.platforms.forEach(p => {
      const key = platformKey(p);
      if (key && !seen.has(key)) {
        seen.add(key);
        badges.push(
          `<span class="badge badge-platform icon" title="${key}">
            ${PLATFORM_GLYPHS[key]}
          </span>`
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

    sectionButtons[0].innerHTML =
      `Out Now <span class="count">${data.outNow.length}</span>`;
    sectionButtons[1].innerHTML =
      `Coming Soon <span class="count">${data.comingSoon.length}</span>`;

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
