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

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isPCSteamCandidate(game) {
  if (!Array.isArray(game.platforms)) return false;
  return game.platforms.join(" ").toLowerCase().includes("windows");
}

/* =========================
   STORE CTA (LOCKED)
========================= */
function getPrimaryStore(game) {
  const encoded = encodeURIComponent(game.name);
  const p = (game.platforms || []).join(" ").toLowerCase();

  if (p.includes("windows"))
    return { label: "View on Steam →", url: `https://store.steampowered.com/search/?term=${encoded}` };
  if (p.includes("playstation"))
    return { label: "View on PlayStation →", url: `https://store.playstation.com/search/${encoded}` };
  if (p.includes("xbox"))
    return { label: "View on Xbox →", url: `https://www.xbox.com/en-US/Search?q=${encoded}` };
  if (p.includes("nintendo"))
    return { label: "View on Nintendo →", url: `https://www.nintendo.com/us/search/#q=${encoded}` };
  if (p.includes("ios"))
    return { label: "View on App Store →", url: `https://apps.apple.com/us/search?term=${encoded}` };
  if (p.includes("android"))
    return { label: "View on Google Play →", url: `https://play.google.com/store/search?q=${encoded}&c=apps` };

  return null;
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
  } catch (e) {
    errorBox.textContent = "Failed to load games.";
    console.error(e);
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
  const now = new Date();

  if (IS_STEAM_MONEY_PAGE) {
    let list = allGames.filter(g => g.releaseDate && isPCSteamCandidate(g));

    if (ROUTE.STEAM_TODAY) {
      const start = startOfLocalDay(now);
      const end = new Date(start.getTime() + 86400000);
      list = list.filter(g => {
        const d = new Date(g.releaseDate);
        return d >= start && d < end;
      });
    } else if (ROUTE.STEAM_WEEK) {
      const end = new Date(now.getTime() + 7 * 86400000);
      list = list.filter(g => new Date(g.releaseDate) <= end);
    } else if (ROUTE.STEAM_UPCOMING) {
      list = list.filter(g => new Date(g.releaseDate) > now);
    }

    lastListPath = PATH;
    renderList(list);
    return;
  }

  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile. Updated daily.");

  const outNow = allGames.filter(g => new Date(g.releaseDate) <= now);
  const comingSoon = allGames.filter(g => new Date(g.releaseDate) > now);

  updateSectionCounts(outNow.length, comingSoon.length);
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
    const release = new Date(game.releaseDate).toLocaleDateString();

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover">
      <div class="card-body">
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">
          <span>${release}</span>
          ${store ? `<a class="card-cta" href="${store.url}" target="_blank" rel="nofollow noopener">Store →</a>` : ""}
        </div>
      </div>
    `;

    card.onclick = () => renderDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS PAGE
========================= */
function renderDetails(game, replace = false) {
  viewMode = "details";

  const slug = slugify(game.name);
  const path = `/game/${game.id}${slug ? "-" + slug : ""}`;
  replace ? history.replaceState({}, "", path) : history.pushState({}, "", path);

  setMetaTitle(`${game.name} — Gamerly`);
  setMetaDescription(game.summary || `Release info for ${game.name}.`);

  const store = getPrimaryStore(game);

  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover">
      </div>
      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        ${game.summary ? `<p class="details-summary">${escapeHtml(game.summary)}</p>` : ""}
        ${store ? `<a class="cta-primary" href="${store.url}" target="_blank" rel="nofollow noopener">${store.label}</a>` : ""}
        <button class="details-back" id="backBtn">← Back</button>
      </div>
    </section>
  `;

  document.getElementById("backBtn").onclick = () => {
    history.pushState({}, "", lastListPath || "/");
    applyFilters(true);
  };
}

/* =========================
   COUNTS
========================= */
function updateSectionCounts(out, soon) {
  const btns = document.querySelectorAll(".section-segment button");
  if (btns.length >= 2) {
    btns[0].innerHTML = `Out Now <span class="count">${out}</span>`;
    btns[1].innerHTML = `Coming Soon <span class="count">${soon}</span>`;
  }
}

/* =========================
   INIT
========================= */
loadGames();
