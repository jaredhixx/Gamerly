const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   ROUTE MODE (SAFE)
========================= */
const PATH = (window.location.pathname || "").split("?")[0].split("#")[0];

const ROUTE = {
  HOME: PATH === "/" || PATH === "",
};

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
   STATE (LOCKED)
========================= */
let allGames = [];
let activeSection = "out";        // out | soon
let activePlatform = "all";       // all | pc | xbox | etc
let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   HELPERS
========================= */
function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb");
    const data = await res.json();
    if (!data.ok) throw new Error("API failed");

    allGames = data.games || [];
    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE (FIXED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  const tomorrowStart = startOfTomorrow();

  let list =
    activeSection === "out"
      ? allGames.filter(g => new Date(g.releaseDate) < tomorrowStart)
      : allGames.filter(g => new Date(g.releaseDate) >= tomorrowStart);

  // ✅ PLATFORM FILTER (RESTORED)
  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(
      g =>
        Array.isArray(g.platforms) &&
        g.platforms.some(p => p.toLowerCase().includes(key))
    );
  }

  renderList(list);
}

/* =========================
   LIST RENDER
========================= */
function renderList(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;
  grid.innerHTML = "";

  if (!slice.length) {
    grid.innerHTML = "<p>No games found.</p>";
    showMoreBtn.style.display = "none";
    return;
  }

  slice.forEach(game => {
    const releaseDate = new Date(game.releaseDate).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" />
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      <div class="card-body">
        ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">${releaseDate}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   PLATFORMS (LOCKED)
========================= */
function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";
  const p = game.platforms.join(" ").toLowerCase();
  const chips = [];
  if (p.includes("windows")) chips.push(`<span class="platform-chip">PC</span>`);
  if (p.includes("xbox")) chips.push(`<span class="platform-chip xbox">Xbox</span>`);
  if (p.includes("playstation")) chips.push(`<span class="platform-chip ps">PS</span>`);
  if (p.includes("nintendo")) chips.push(`<span class="platform-chip">Switch</span>`);
  if (p.includes("ios")) chips.push(`<span class="platform-chip">iOS</span>`);
  if (p.includes("android")) chips.push(`<span class="platform-chip">Android</span>`);
  return chips.join("");
}

/* =========================
   UI EVENTS
========================= */
document.querySelectorAll(".section-segment button").forEach(btn => {
  btn.onclick = () => {
    activeSection = btn.textContent.includes("Out") ? "out" : "soon";
    document.querySelectorAll(".section-segment button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    activePlatform = btn.dataset.platform || "all";
    document.querySelectorAll(".platforms button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters(true);
  };
});

showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  applyFilters();
};

/* =========================
   INIT
========================= */
loadGames();
