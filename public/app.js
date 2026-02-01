// public/app.js
// Gamerly — stable base with corrected Coming Soon time filtering (PC-safe)

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
  if (ageGate) ageGate.style.display = "none";
  fetchGames();
}

if (ageGate && ageConfirmBtn) {
  if (isAgeVerified()) {
    ageGate.style.display = "none";
  } else {
    ageGate.style.display = "flex";
    ageConfirmBtn.onclick = confirmAge;
  }
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
   TIME FILTERS (CORRECT, PC-SAFE)
   Key rule:
   - Out Now: strict past windows
   - Coming Soon: trust API; keep undated; only apply upper bound
========================= */
function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const DAY = 86400000;

  // Helper: parse release time safely
  const toTime = (g) => (g.releaseDate ? new Date(g.releaseDate).getTime() : null);

  // OUT NOW (strict, past-facing)
  if (state.section === "out-now") {
    return games.filter(g => {
      const t = toTime(g);
      if (!t) return false;

      // Must be released already (use now, not midnight)
      if (t > Date.now()) return false;

      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        return t >= todayStart - 6 * DAY && t < todayStart + DAY;
      }
      if (state.timeFilter === "month") {
        return t >= todayStart - 29 * DAY && t < todayStart + DAY;
      }
      return true;
    });
  }

  // COMING SOON (trust API classification)
  if (state.section === "coming-soon") {
    // relaxed windows (these were the “good build” values)
    const WEEK_CAP_DAYS = 10;
    const MONTH_CAP_DAYS = 45;

    return games.filter(g => {
      const t = toTime(g);

      // Keep undated games (common on PC)
      if (!t) return true;

      // For Coming Soon, do NOT require t > now — IGDB uses UTC-midnight-ish values.
      // We only cap how far ahead it is, relative to today.
      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        return t < todayStart + (WEEK_CAP_DAYS * DAY);
      }
      if (state.timeFilter === "month") {
        return t < todayStart + (MONTH_CAP_DAYS * DAY);
      }
      return true;
    });
  }

  return games;
}

/* =========================
   PLATFORM OVERLAY CHIPS
========================= */
function mapPlatformChip(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("xbox")) return { cls: "xbox", label: "Ⓧ" };
  if (n.includes("playstation")) return { cls: "", label: "PS" };
  if (n.includes("pc")) return { cls: "", label: "PC" };
  if (n.includes("switch") || n.includes("nintendo")) return { cls: "", label: "Switch" };
  if (n.includes("ios")) return { cls: "", label: "iOS" };
  if (n.includes("android")) return { cls: "", label: "Android" };
  return null;
}

function renderPlatformOverlay(game) {
  if (!Array.isArray(game.platforms)) return "";

  const seen = new Set();
  const chips = [];

  game.platforms.forEach(p => {
    const chip = mapPlatformChip(p);
    if (!chip || seen.has(chip.label)) return;
    seen.add(chip.label);
    chips.push(`<span class="platform-chip ${chip.cls}">${chip.label}</span>`);
  });

  return chips.length
    ? `<div class="platform-overlay">${chips.join("")}</div>`
    : "";
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
      ${renderPlatformOverlay(g)}
      <img loading="lazy" src="${g.coverUrl || ""}" alt="${g.name}">
      <div class="card-body">
        <div class="badge-row">
          ${g.category ? `<span class="badge-category">${g.category.replace("Role-playing (RPG)", "RPG")}</span>` : ""}
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
  if (loading) loading.style.display = "block";
  if (errorBox) errorBox.textContent = "";

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    state.data = data;

    if (sectionButtons[0]) {
      sectionButtons[0].innerHTML = `Out Now <span class="count">${data.outNow.length}</span>`;
    }
    if (sectionButtons[1]) {
      sectionButtons[1].innerHTML = `Coming Soon <span class="count">${data.comingSoon.length}</span>`;
    }

    render(state.section === "out-now" ? data.outNow : data.comingSoon);
  } catch (err) {
    if (errorBox) errorBox.textContent = err.message || "Failed to load games.";
  } finally {
    if (loading) loading.style.display = "none";
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
