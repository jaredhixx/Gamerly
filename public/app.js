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

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

/* =========================
   ROUTE DEFAULTS
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
  } else {
    activeSection = "out";
    activeTime = "all";
  }
}

/* =========================
   STORE CTA (HIGH ROI CHANGE)
========================= */
function getSteamCtaLabel() {
  if (!ROUTE.STEAM) return "View on Steam →";
  if (activeSection === "soon") return "Wishlist on Steam →";
  return "Buy on Steam →";
}

function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;

  const p = game.platforms.join(" ").toLowerCase();
  const encodedName = encodeURIComponent(game.name);

  if (p.includes("windows") || p.includes("pc")) {
    return {
      label: getSteamCtaLabel(),
      url: `https://store.steampowered.com/search/?term=${encodedName}`
    };
  }

  return null;
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
    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const tomorrow = startOfTomorrow();

  const outNow = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) < tomorrow);
  const comingSoon = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) >= tomorrow);

  let list = activeSection === "out" ? outNow : comingSoon;
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
    const store = getPrimaryStore(game);
    const releaseDate = new Date(game.releaseDate).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" />
      <div class="card-body">
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">
          <span>${releaseDate}</span>
          ${
            store
              ? `<a class="card-cta"
                   href="${store.url}"
                   target="_blank"
                   rel="nofollow sponsored noopener"
                   onclick="event.stopPropagation()">
                   ${store.label}
                 </a>`
              : ""
          }
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   INIT
========================= */
initRouteDefaults();
loadGames();
