// new deployment
const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   ROUTE MODE (SAFE, ADDITIVE)
========================= */
const PATH = (window.location.pathname || "").split("?")[0].split("#")[0];

const ROUTE = {
  HOME: PATH === "/" || PATH === "",
  DETAILS: /^\/game\/\d+/.test(PATH),
  STEAM_ALL: PATH === "/steam-games",
  STEAM_TODAY: PATH === "/steam-games-today",
  STEAM_WEEK: PATH === "/steam-games-this-week",
  STEAM_UPCOMING: PATH === "/steam-games-upcoming",
};

const IS_STEAM_MONEY_PAGE =
  ROUTE.STEAM_ALL || ROUTE.STEAM_TODAY || ROUTE.STEAM_WEEK || ROUTE.STEAM_UPCOMING;

let lastListPath = ROUTE.HOME ? "/" : (IS_STEAM_MONEY_PAGE ? PATH : "/");

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
   HELPERS
========================= */
function slugify(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function appleSearchTerm(str = "") {
  return str
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDetailsIdFromPath(pathname) {
  const clean = (pathname || "").split("?")[0].split("#")[0];
  const m = clean.match(/^\/game\/(\d+)(?:-.*)?$/);
  return m ? m[1] : null;
}

function setMetaTitle(title) {
  document.title = title;
}

function setMetaDescription(desc) {
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", desc);
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

    const id = parseDetailsIdFromPath(window.location.pathname);
    if (id) {
      const g = allGames.find(x => String(x.id) === String(id));
      if (g) {
        renderDetails(g, true);
        return;
      }
      history.replaceState({}, "", "/");
    }

    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE (LOCKED + STEAM MONEY PAGES)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const now = new Date();

  // ===== STEAM MONEY PAGES (CTR-OPTIMIZED META ONLY) =====
  if (IS_STEAM_MONEY_PAGE) {
    if (ROUTE.STEAM_ALL) {
      setMetaTitle("Steam Games — New & Upcoming PC Releases (Updated Daily)");
      setMetaDescription(
        "Browse new and upcoming Steam games in one place. Daily-updated PC releases with direct links to Steam."
      );
    } else if (ROUTE.STEAM_TODAY) {
      setMetaTitle("New Steam Games Today — PC Releases You Can Play Now");
      setMetaDescription(
        "All new Steam games released today. Discover PC games you can buy and play right now on Steam."
      );
    } else if (ROUTE.STEAM_WEEK) {
      setMetaTitle("New Steam Games This Week — Best PC Releases");
      setMetaDescription(
        "See new Steam games released this week plus upcoming PC titles worth watching. Updated daily."
      );
    } else if (ROUTE.STEAM_UPCOMING) {
      setMetaTitle("Upcoming Steam Games — New PC Releases Coming Soon");
      setMetaDescription(
        "Track upcoming Steam games and future PC releases. Stay ahead of what’s launching next on Steam."
      );
    }

    let list = allGames.filter(g => g.releaseDate && isPCSteamCandidate(g));

    if (ROUTE.STEAM_TODAY) {
      const start = startOfLocalDay(now);
      const end = new Date(start.getTime() + 86400000);
      list = list.filter(g => {
        const d = new Date(g.releaseDate);
        return d >= start && d < end;
      });
      list.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    } else if (ROUTE.STEAM_WEEK) {
      const start = startOfLocalDay(now);
      const end = new Date(start.getTime() + 7 * 86400000);
      list = list.filter(g => {
        const d = new Date(g.releaseDate);
        return d >= start && d < end;
      });
      list.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    } else if (ROUTE.STEAM_UPCOMING) {
      list = list.filter(g => new Date(g.releaseDate) > now);
      list.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    } else if (ROUTE.STEAM_ALL) {
      const outNow = list.filter(g => new Date(g.releaseDate) <= now);
      const comingSoon = list.filter(g => new Date(g.releaseDate) > now);
      outNow.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      comingSoon.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
      list = [...outNow, ...comingSoon];
    }

    lastListPath = PATH;
    renderList(list);
    return;
  }

  // ===== HOME (UNCHANGED) =====
  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile. Updated daily.");

  const outNow = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) <= now);
  const comingSoon = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) > now);

  updateSectionCounts(outNow.length, comingSoon.length);

  let list = activeSection === "out" ? outNow : comingSoon;

  if (activeTime !== "all") {
    list = list.filter(g => {
      const d = new Date(g.releaseDate);
      if (activeTime === "today") return d.toDateString() === now.toDateString();
      if (activeTime === "week") return d <= new Date(now.getTime() + 7 * 864e5);
      if (activeTime === "month") return d <= new Date(now.getTime() + 30 * 864e5);
      return true;
    });
  }

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(g =>
      Array.isArray(g.platforms) &&
      g.platforms.some(p => p.toLowerCase().includes(key))
    );
  }

  lastListPath = "/";
  renderList(list);
}

/* =========================
   INIT
========================= */
loadGames();
