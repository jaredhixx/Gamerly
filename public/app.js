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
  STEAM: /^\/steam-games(?:-|$)/.test(PATH) || PATH === "/steam-games",
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

/* ✅ CANONICAL HELPER (SEO, SAFE) */
function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

/* =========================
   SEO ROUTE META (HIGH ROI, SAFE)
========================= */
function applyRouteMeta() {
  const path = window.location.pathname;

  if (path === "/steam-games") {
    setMetaTitle("Steam Games — New & Recent Releases | Gamerly");
    setMetaDescription(
      "Browse new and recent Steam game releases. Updated daily with curated PC games available now on Steam."
    );
    setCanonical("https://gamerly.net/steam-games");
    return;
  }

  if (path === "/steam-games-today") {
    setMetaTitle("Steam Games Released Today | Gamerly");
    setMetaDescription(
      "See all Steam games released today. Discover new PC games available now on Steam, updated daily."
    );
    setCanonical("https://gamerly.net/steam-games-today");
    return;
  }

  if (path === "/steam-games-this-week") {
    setMetaTitle("Steam Games This Week | New PC Releases");
    setMetaDescription(
      "Browse Steam games released this week. Stay up to date with the latest PC game launches on Steam."
    );
    setCanonical("https://gamerly.net/steam-games-this-week");
    return;
  }

  if (path === "/steam-games-upcoming") {
    setMetaTitle("Upcoming Steam Games | PC Releases Coming Soon");
    setMetaDescription(
      "Explore upcoming Steam games and PC releases coming soon. Track new games before they launch on Steam."
    );
    setCanonical("https://gamerly.net/steam-games-upcoming");
    return;
  }

  // Homepage fallback
  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription(
    "Track new and upcoming game releases across PC, console, and mobile. Updated daily and curated so you only see what matters."
  );
}

/* =========================
   SEO ROUTE H1 (HIGH ROI, SAFE)
========================= */
function applyRouteH1() {
  const h1 = document.querySelector(".hero-title");
  if (!h1) return;

  const path = window.location.pathname;

  if (path === "/steam-games-today") {
    h1.textContent = "Steam Games Released Today";
    return;
  }

  if (path === "/steam-games-this-week") {
    h1.textContent = "Steam Game Releases This Week";
    return;
  }

  if (path === "/steam-games-upcoming") {
    h1.textContent = "Upcoming Steam Games";
    return;
  }

  if (path === "/steam-games") {
    h1.textContent = "Steam Game Releases";
    return;
  }

  h1.textContent = "Daily Game Releases, Curated";
}

/* =========================
   INIT
========================= */
initRouteDefaults();
syncActiveButtons();
applyRouteMeta();
applyRouteH1();
loadGames();
