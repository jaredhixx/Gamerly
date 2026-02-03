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
  return str.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
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

function setActive(button) {
  const group = button.parentElement;
  if (!group) return;
  group.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

function isPCSteamCandidate(game) {
  if (!game || !Array.isArray(game.platforms)) return false;
  const p = game.platforms.join(" ").toLowerCase();
  return p.includes("windows") || p.includes("pc");
}

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* =========================
   STORE CTA LOGIC (LOCKED)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;

  const encodedName = encodeURIComponent(game.name);
  const appleTerm = appleSearchTerm(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows") || p.includes("pc"))
    return { label: "View on Steam →", url: `https://store.steampowered.com/search/?term=${encodedName}` };
  if (p.includes("playstation"))
    return { label: "View on PlayStation →", url: `https://store.playstation.com/search/${encodedName}` };
  if (p.includes("xbox"))
    return { label: "View on Xbox →", url: `https://www.xbox.com/en-US/Search?q=${encodedName}` };
  if (p.includes("nintendo"))
    return { label: "View on Nintendo →", url: `https://www.nintendo.com/us/search/#q=${encodedName}` };
  if (p.includes("ios"))
    return { label: "View on App Store →", url: `https://apps.apple.com/us/search?term=${encodeURIComponent(appleTerm)}` };
  if (p.includes("android"))
    return { label: "View on Google Play →", url: `https://play.google.com/store/search?q=${encodedName}&c=apps` };

  return { label: "View on Store →", url: `https://www.google.com/search?q=${encodedName}+game` };
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
      if (g) return renderDetails(g, true);
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
   LIST RENDER (LOCKED — FIXED STACKING)
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
    card.setAttribute("role", "button");

    card.innerHTML = `
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" />
      ${renderRating(game)}
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      <div class="card-body">
        ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta" style="display:flex; justify-content:space-between; align-items:center;">
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

    card.onclick = () => renderDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   RATINGS / PLATFORMS (LOCKED)
========================= */
function renderRating(game) {
  const s = game.aggregated_rating;
  const c = game.aggregated_rating_count;
  if (typeof s !== "number" || typeof c !== "number" || s < 65) return "";
  return `<div class="rating-badge">${Math.round(s)}</div>`;
}

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
   INIT
========================= */
loadGames();
