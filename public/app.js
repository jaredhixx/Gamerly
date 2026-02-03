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
  DETAILS: /^\/game\/\d+/.test(PATH),
  STEAM: /^\/steam-games/.test(PATH),
};

let lastListPath = "/";

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
let activeSection = "out";
let activeTime = "all";
let activePlatform = "all";
let visibleCount = 0;
const PAGE_SIZE = 24;
let viewMode = "list";

/* =========================
   DATE HELPERS (CRITICAL)
========================= */
function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function normalizeReleaseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return startOfLocalDay(d);
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

/* =========================
   TIME WINDOW (SAFE)
========================= */
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function getTimeWindow(section, key) {
  if (key === "all") return null;

  const today = startOfLocalDay(new Date());
  const tomorrow = startOfTomorrow();

  if (section === "out") {
    if (key === "today") return { start: today, end: tomorrow };
    if (key === "thisweek") return { start: addDays(today, -6), end: tomorrow };
    if (key === "thismonth") return { start: addDays(today, -29), end: tomorrow };
  } else {
    if (key === "today") return { start: tomorrow, end: addDays(tomorrow, 1) };
    if (key === "thisweek") return { start: tomorrow, end: addDays(tomorrow, 7) };
    if (key === "thismonth") return { start: tomorrow, end: addDays(tomorrow, 30) };
  }
  return null;
}

/* =========================
   ROUTE DEFAULTS
========================= */
function initRouteDefaults() {
  if (!ROUTE.STEAM) return;

  activePlatform = "pc";

  if (PATH === "/steam-games-today") {
    activeSection = "out";
    activeTime = "today";
  } else if (PATH === "/steam-games-this-week") {
    activeSection = "out";
    activeTime = "thisweek";
  } else if (PATH === "/steam-games-upcoming") {
    activeSection = "soon";
    activeTime = "all";
  }
}

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb", { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) throw new Error();

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

  const tomorrow = startOfTomorrow();

  // ✅ Base lists (for counters + integrity)
  const outNowBase = allGames.filter(g => {
    const rd = normalizeReleaseDate(g.releaseDate);
    return rd && rd < tomorrow;
  });

  const comingSoonBase = allGames.filter(g => {
    const rd = normalizeReleaseDate(g.releaseDate);
    return rd && rd >= tomorrow;
  });

  let list = activeSection === "out" ? outNowBase : comingSoonBase;

  // ✅ Time window ONLY if not "all"
  if (activeTime !== "all") {
    const win = getTimeWindow(activeSection, activeTime);
    if (win) {
      list = list.filter(g => {
        const rd = normalizeReleaseDate(g.releaseDate);
        return rd && rd >= win.start && rd < win.end;
      });
    }
  }

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(g =>
      g.platforms?.join(" ").toLowerCase().includes(key === "pc" ? "windows" : key)
    );
  }

  lastListPath = PATH || "/";
  renderList(list);
}

/* =========================
   LIST RENDER (UNCHANGED)
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
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="card-title">${game.name}</div>`;
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   INIT
========================= */
initRouteDefaults();
loadGames();
