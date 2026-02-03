const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   ROUTE MODE (LOCKED)
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
let activeSection = "out";        // out | soon
let activeTime = "all";           // all | today | thisweek | thismonth
let activePlatform = "all";       // all | pc | playstation | xbox | nintendo | ios | android
let visibleCount = 0;
const PAGE_SIZE = 24;
let viewMode = "list";

/* =========================
   HELPERS
========================= */
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseDetailsIdFromPath(pathname) {
  const m = pathname.match(/^\/game\/(\d+)/);
  return m ? m[1] : null;
}

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

/* =========================
   SEO (LOCKED SAFE)
========================= */
function applyRouteMeta() {
  const path = window.location.pathname;
  const h1 = document.querySelector(".hero-title");

  if (path === "/steam-games-today") {
    document.title = "Steam Games Released Today | Gamerly";
    if (h1) h1.textContent = "Steam Games Released Today";
    return;
  }

  if (path === "/steam-games-this-week") {
    document.title = "Steam Games This Week | Gamerly";
    if (h1) h1.textContent = "Steam Game Releases This Week";
    return;
  }

  if (path === "/steam-games-upcoming") {
    document.title = "Upcoming Steam Games | Gamerly";
    if (h1) h1.textContent = "Upcoming Steam Games";
    return;
  }

  if (path === "/steam-games") {
    document.title = "Steam Game Releases | Gamerly";
    if (h1) h1.textContent = "Steam Game Releases";
    return;
  }

  document.title = "Gamerly — Daily Game Releases, Curated";
  if (h1) h1.textContent = "Daily Game Releases, Curated";
}

/* =========================
   ROUTE DEFAULTS (LOCKED)
========================= */
function initRouteDefaults() {
  if (!ROUTE.STEAM) return;

  activePlatform = "pc";

  if (PATH === "/steam-games-upcoming") {
    activeSection = "soon";
    activeTime = "all";
  } else if (PATH === "/steam-games-today") {
    activeSection = "out";
    activeTime = "today";
  } else if (PATH === "/steam-games-this-week") {
    activeSection = "out";
    activeTime = "thisweek";
  }
}

/* =========================
   STEAM CTA (SAFE, TEXT ONLY)
========================= */
function getSteamLabel() {
  if (!ROUTE.STEAM) return "View on Steam →";
  if (activeSection === "soon") return "Wishlist on Steam →";
  return "Buy on Steam →";
}

function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;
  const p = game.platforms.join(" ").toLowerCase();
  if (!p.includes("windows")) return null;

  return {
    label: getSteamLabel(),
    url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`
  };
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
    if (!data.ok) throw new Error("API failed");

    allGames = data.games || [];

    const id = parseDetailsIdFromPath(window.location.pathname);
    if (id) {
      const g = allGames.find(x => String(x.id) === id);
      if (g) return renderDetails(g, true);
    }

    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE (LOCKED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const tomorrow = startOfTomorrow();
  const outNow = allGames.filter(g => new Date(g.releaseDate) < tomorrow);
  const comingSoon = allGames.filter(g => new Date(g.releaseDate) >= tomorrow);

  let list = activeSection === "out" ? outNow : comingSoon;

  renderList(list);
}

/* =========================
   LIST RENDER (LOCKED)
========================= */
function renderList(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;
  grid.innerHTML = "";

  slice.forEach(game => {
    const store = getPrimaryStore(game);
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${game.coverUrl}" alt="${escapeHtml(game.name)}" />
      <div class="card-body">
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">
          ${store ? `<a class="card-cta" href="${store.url}" target="_blank" rel="nofollow sponsored noopener">${store.label}</a>` : ""}
        </div>
      </div>
    `;

    card.onclick = () => renderDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS PAGE (RESTORED)
========================= */
function renderDetails(game, replace = false) {
  viewMode = "details";
  const slug = slugify(game.name);
  const path = `/game/${game.id}-${slug}`;

  replace ? history.replaceState({}, "", path) : history.pushState({}, "", path);

  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl}" />
      </div>
      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        <p class="details-summary">${escapeHtml(game.summary || "")}</p>
        ${getPrimaryStore(game)
          ? `<a class="cta-primary" href="${getPrimaryStore(game).url}" target="_blank">${getPrimaryStore(game).label}</a>`
          : ""
        }
        <button class="details-back">← Back</button>
      </div>
    </section>
  `;

  document.querySelector(".details-back").onclick = () => {
    history.pushState({}, "", lastListPath || "/");
    applyFilters(true);
  };
}

/* =========================
   INIT
========================= */
initRouteDefaults();
applyRouteMeta();
loadGames();
