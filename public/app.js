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
   STATE (LOCKED)
========================= */
let allGames = [];

let activeSection = "out";
let activeTime = "all";
let activePlatform = "all";

let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   VIEW STATE
========================= */
let viewMode = "list";
let selectedGameId = null;

/* =========================
   ROUTING HELPERS
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

/* =========================
   STORE LINK (ROI)
========================= */
function buildStoreLink(game) {
  const name = (game?.name || "").trim();
  const q = encodeURIComponent(name);
  const p = Array.isArray(game?.platforms) ? game.platforms.join(" ").toLowerCase() : "";

  if (p.includes("windows") || p.includes("pc")) {
    return `https://store.steampowered.com/search/?term=${q}`;
  }
  if (p.includes("playstation")) {
    return `https://store.playstation.com/search/${q}`;
  }
  if (p.includes("xbox")) {
    return `https://www.xbox.com/en-US/Search?q=${q}`;
  }
  if (p.includes("nintendo")) {
    return `https://www.nintendo.com/us/search/#q=${q}`;
  }
  if (p.includes("ios")) {
    return `https://apps.apple.com/us/search?term=${q}`;
  }
  if (p.includes("android")) {
    return `https://play.google.com/store/search?q=${q}&c=apps`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(name + " game store")}`;
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
        openDetails(g, { replace: true });
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
   FILTER PIPELINE (LOCKED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  const now = new Date();

  const outNowGames = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) <= now);
  const comingSoonGames = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) > now);

  updateSectionCounts(outNowGames.length, comingSoonGames.length);

  let list = activeSection === "out" ? outNowGames : comingSoonGames;

  if (activeTime !== "all") {
    list = list.filter(game => {
      const d = new Date(game.releaseDate);
      if (activeTime === "today") return d.toDateString() === now.toDateString();
      if (activeTime === "week") return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
      if (activeTime === "month") return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
      return true;
    });
  }

  if (activePlatform !== "all") {
    list = list.filter(game =>
      Array.isArray(game.platforms) &&
      game.platforms.some(p => p.toLowerCase().includes(activePlatform))
    );
  }

  renderList(list);
}

/* =========================
   SECTION COUNTS (LOCKED)
========================= */
function updateSectionCounts(outCount, soonCount) {
  const buttons = document.querySelectorAll(".section-segment button");
  if (buttons.length < 2) return;

  buttons[0].innerHTML = `Out Now <span class="count">${outCount}</span>`;
  buttons[1].innerHTML = `Coming Soon <span class="count">${soonCount}</span>`;
}

/* =========================
   LIST RENDER (LOCKED)
========================= */
function renderList(list) {
  viewMode = "list";
  selectedGameId = null;

  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile.");

  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;

  grid.innerHTML = "";

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <img src="${game.coverUrl || ""}" loading="lazy" />
      <div class="card-body">
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">${new Date(game.releaseDate).toLocaleDateString()}</div>
      </div>
    `;
    card.onclick = () => openDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS RENDER (FIXED STRUCTURE)
========================= */
function renderDetails(game) {
  viewMode = "details";
  selectedGameId = game.id;

  setMetaTitle(`${game.name} — Gamerly`);
  setMetaDescription(`Release info for ${game.name}. Platforms, release date, and store link.`);

  const storeHref = buildStoreLink(game);
  const releaseText = game.releaseDate
    ? new Date(game.releaseDate).toDateString()
    : "Release date unknown";

  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" loading="lazy" />
      </div>

      <div class="details-content">
        <header class="details-header">
          <h1>${escapeHtml(game.name)}</h1>
          <p>${releaseText}</p>
          <div class="details-platforms">
            ${renderPlatforms(game)}
          </div>
        </header>

        <div class="details-cta">
          <a href="${storeHref}" target="_blank" rel="nofollow noopener">
            View on Store
          </a>
        </div>

        <nav class="details-nav">
          <button id="detailsBackBtn">← Back</button>
        </nav>
      </div>
    </section>
  `;

  showMoreBtn.style.display = "none";

  document.getElementById("detailsBackBtn").onclick = () => {
    history.pushState({}, "", "/");
    applyFilters(true);
  };
}

function openDetails(game, opts = {}) {
  const slug = slugify(game.name);
  const path = `/game/${game.id}-${slug}`;
  opts.replace ? history.replaceState({}, "", path) : history.pushState({}, "", path);
  renderDetails(game);
}

/* =========================
   RENDER HELPERS (LOCKED)
========================= */
function renderRating(game) {
  if (!game.aggregated_rating) return "";
  return `<div class="rating-badge">${Math.round(game.aggregated_rating)}</div>`;
}

function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";
  return game.platforms.map(p => `<span class="platform-chip">${p}</span>`).join("");
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m])
  );
}

/* =========================
   INIT
========================= */
loadGames();
