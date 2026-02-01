const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   AGE GATE (LOCKED)
========================= */
const ageGate = document.getElementById("ageGate");
const ageBtn = document.getElementById("ageConfirmBtn");

if (ageGate && ageBtn) {
  if (localStorage.getItem("gamerly_age_verified") === "true") {
    ageGate.style.display = "none";
  } else {
    ageGate.style.display = "flex";
  }

  ageBtn.onclick = () => {
    localStorage.setItem("gamerly_age_verified", "true");
    ageGate.style.display = "none";
  };
}

/* =========================
   STATE
========================= */
let outNowGames = [];
let comingSoonGames = [];

let visibleCount = 0;
const PAGE_SIZE = 24;

let activeSection = "out";      // out | soon
let activeTime = "all";         // all | today | week | month
let activePlatform = "all";     // all | pc | xbox | etc

/* =========================
   PLATFORM MATCHING (NAMES)
========================= */
function matchesPlatform(game, platform) {
  if (!Array.isArray(game.platforms)) return false;

  const p = platform.toLowerCase();
  return game.platforms.some(name =>
    name.toLowerCase().includes(p)
  );
}

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    const res = await fetch("/api/igdb");
    const data = await res.json();

    outNowGames = data.outNow || [];
    comingSoonGames = data.comingSoon || [];

    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTERS
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  let source =
    activeSection === "out"
      ? outNowGames
      : comingSoonGames;

  let filtered = [...source];
  const now = new Date();

  // TIME FILTER
  filtered = filtered.filter(g => {
    if (!g.releaseDate) return false;
    const d = new Date(g.releaseDate);

    if (activeTime === "today") {
      return d.toDateString() === now.toDateString();
    }

    if (activeTime === "week") {
      const diff = d - now;
      return diff >= 0 && diff <= 7 * 86400000;
    }

    if (activeTime === "month") {
      const diff = d - now;
      return diff >= 0 && diff <= 30 * 86400000;
    }

    return true;
  });

  // PLATFORM FILTER
  if (activePlatform !== "all") {
    filtered = filtered.filter(g =>
      matchesPlatform(g, activePlatform)
    );
  }

  render(filtered);
}

/* =========================
   RENDER
========================= */
function render(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;

  grid.innerHTML = "";

  if (!slice.length) {
    grid.innerHTML = "<p>No games found.</p>";
    showMoreBtn.style.display = "none";
    return;
  }

  slice.forEach(game => {
    const rating =
      game.aggregated_rating
        ? `${Math.round(game.aggregated_rating)}/100`
        : null;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      <img src="${game.coverUrl}" loading="lazy" />
      <div class="card-body">
        <div class="badge-row">
          ${game.category ? `<span class="badge-category">${game.category}</span>` : ""}
        </div>
        <div class="card-title">${game.name}</div>
        <div class="card-meta">
          ${new Date(game.releaseDate).toLocaleDateString()}
          ${rating ? ` • ⭐ ${rating}` : ""}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display =
    visibleCount < list.length ? "block" : "none";
}

/* =========================
   PLATFORM ICONS
========================= */
function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";

  const icons = [];
  const names = game.platforms.join(" ").toLowerCase();

  if (names.includes("windows")) icons.push(`<span class="platform-chip pc">PC</span>`);
  if (names.includes("xbox")) icons.push(`<span class="platform-chip xbox">Xbox</span>`);
  if (names.includes("playstation")) icons.push(`<span class="platform-chip">PS</span>`);
  if (names.includes("switch")) icons.push(`<span class="platform-chip">Switch</span>`);
  if (names.includes("ios")) icons.push(`<span class="platform-chip">iOS</span>`);
  if (names.includes("android")) icons.push(`<span class="platform-chip">Android</span>`);

  return icons.join("");
}

/* =========================
   EVENTS
========================= */
document.querySelectorAll(".time-segment button").forEach(btn => {
  btn.onclick = () => {
    activeTime = btn.textContent.toLowerCase().replace(" ", "");
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".section-segment button").forEach(btn => {
  btn.onclick = () => {
    activeSection = btn.textContent.includes("Out") ? "out" : "soon";
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    activePlatform = btn.dataset.platform || "all";
    setActive(btn);
    applyFilters(true);
  };
});

showMoreBtn.onclick = () => applyFilters();

/* =========================
   UI HELPERS
========================= */
function setActive(button) {
  button.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

loadGames();
