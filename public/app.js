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

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   SEO ROUTE META + H1 (LOCKED)
========================= */
function applyRouteMeta() {
  const path = window.location.pathname;

  if (path === "/steam-games-today") {
    setMetaTitle("Steam Games Released Today | Gamerly");
    setMetaDescription("See all Steam games released today. Discover new PC games available now on Steam.");
    return;
  }

  if (path === "/steam-games-this-week") {
    setMetaTitle("Steam Games This Week | New PC Releases");
    setMetaDescription("Browse Steam games released this week. Stay up to date with new PC releases on Steam.");
    return;
  }

  if (path === "/steam-games-upcoming") {
    setMetaTitle("Upcoming Steam Games | PC Releases Coming Soon");
    setMetaDescription("Explore upcoming Steam games and PC releases coming soon.");
    return;
  }

  if (path === "/steam-games") {
    setMetaTitle("Steam Game Releases | Gamerly");
    setMetaDescription("Browse new and recent Steam game releases. Updated daily.");
    return;
  }

  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile.");
}

function applyRouteH1() {
  const h1 = document.querySelector(".hero-title");
  if (!h1) return;

  const path = window.location.pathname;

  if (path === "/steam-games-today") return h1.textContent = "Steam Games Released Today";
  if (path === "/steam-games-this-week") return h1.textContent = "Steam Game Releases This Week";
  if (path === "/steam-games-upcoming") return h1.textContent = "Upcoming Steam Games";
  if (path === "/steam-games") return h1.textContent = "Steam Game Releases";

  h1.textContent = "Daily Game Releases, Curated";
}

/* =========================
   DATE HELPERS
========================= */
function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

/* =========================
   STORE CTA (LOCKED)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;
  const name = encodeURIComponent(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows")) return { label: "View on Steam →", url: `https://store.steampowered.com/search/?term=${name}` };
  if (p.includes("playstation")) return { label: "View on PlayStation →", url: `https://store.playstation.com/search/${name}` };
  if (p.includes("xbox")) return { label: "View on Xbox →", url: `https://www.xbox.com/en-US/Search?q=${name}` };
  if (p.includes("nintendo")) return { label: "View on Nintendo →", url: `https://www.nintendo.com/us/search/#q=${name}` };

  return null;
}

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    const res = await fetch("/api/igdb", { cache: "no-store" });
    const data = await res.json();
    allGames = data.games || [];

    const id = parseDetailsIdFromPath(location.pathname);
    if (id) {
      const g = allGames.find(x => String(x.id) === String(id));
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
   FILTER + LIST (LOCKED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const tomorrow = startOfTomorrow();
  const outNow = allGames.filter(g => new Date(g.releaseDate) < tomorrow);
  const soon = allGames.filter(g => new Date(g.releaseDate) >= tomorrow);
  renderList(activeSection === "out" ? outNow : soon);
}

function renderList(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;
  grid.innerHTML = "";

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${game.coverUrl}" alt="${escapeHtml(game.name)} cover" />`;
    card.onclick = () => renderDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS PAGE (ROI ADDITION)
========================= */
function renderDetails(game, replace = false) {
  viewMode = "details";

  const slug = slugify(game.name);
  const path = `/game/${game.id}-${slug}`;
  replace ? history.replaceState({}, "", path) : history.pushState({}, "", path);

  setMetaTitle(`${game.name} — Gamerly`);
  setMetaDescription(game.summary?.slice(0, 160) || `Details for ${game.name}.`);

  const store = getPrimaryStore(game);

  grid.innerHTML = `
    <section class="details">
      <h1 class="details-title">${escapeHtml(game.name)}</h1>

      ${store ? `<a class="cta-primary" href="${store.url}" target="_blank" rel="nofollow sponsored">${store.label}</a>` : ""}

      <!-- 🔥 HIGH-ROI INTERNAL STEAM LINKS -->
      <div style="margin-top:14px; font-size:0.85rem; opacity:0.85;">
        <strong>Browse more Steam games:</strong>
        <a href="/steam-games-today">Steam Today</a> ·
        <a href="/steam-games-this-week">This Week</a> ·
        <a href="/steam-games-upcoming">Upcoming</a>
      </div>

      <button class="details-back" id="backBtn">← Back</button>
    </section>
  `;

  document.getElementById("backBtn").onclick = () => {
    history.pushState({}, "", lastListPath || "/");
    applyFilters(true);
  };
}

/* =========================
   INIT
========================= */
applyRouteMeta();
applyRouteH1();
loadGames();
