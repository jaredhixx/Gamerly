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

/* ✅ CANONICAL HELPER (SEO, SAFE, ADDITIVE ONLY) */
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

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfTomorrow() {
  const t = startOfLocalDay(new Date());
  t.setDate(t.getDate() + 1);
  return t;
}

/* =========================
   TIME WINDOW (SAFE, ADDITIVE)
========================= */
function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

function getTimeWindow(section, timeKey) {
  if (!timeKey || timeKey === "all") return null;

  const todayStart = startOfLocalDay(new Date());
  const tomorrowStart = startOfTomorrow();

  if (section === "out") {
    if (timeKey === "today") return { start: todayStart, end: tomorrowStart };
    if (timeKey === "thisweek") return { start: addDays(todayStart, -6), end: tomorrowStart };
    if (timeKey === "thismonth") return { start: addDays(todayStart, -29), end: tomorrowStart };
    return null;
  }

  if (timeKey === "today") return { start: tomorrowStart, end: addDays(tomorrowStart, 1) };
  if (timeKey === "thisweek") return { start: tomorrowStart, end: addDays(tomorrowStart, 7) };
  if (timeKey === "thismonth") return { start: tomorrowStart, end: addDays(tomorrowStart, 30) };
  return null;
}

function applyTimeWindow(list, section, timeKey) {
  const win = getTimeWindow(section, timeKey);
  if (!win) return list;

  const startMs = win.start.getTime();
  const endMs = win.end.getTime();

  return list.filter(g => {
    if (!g || !g.releaseDate) return false;
    const t = new Date(g.releaseDate).getTime();
    if (!Number.isFinite(t)) return false;
    return t >= startMs && t < endMs;
  });
}

function platformMatches(game, key) {
  if (!game || !Array.isArray(game.platforms)) return false;
  const p = game.platforms.join(" ").toLowerCase();
  if (key === "pc") return p.includes("windows") || p.includes("pc");
  return p.includes(key);
}

/* =========================
   ROUTE DEFAULTS (SAFE, ADDITIVE)
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

function syncActiveButtons() {
  const sectionBtns = Array.from(document.querySelectorAll(".section-segment button"));
  if (sectionBtns.length) {
    const target = sectionBtns.find(b =>
      activeSection === "out" ? b.textContent.includes("Out") : b.textContent.includes("Coming")
    );
    if (target) setActive(target);
  }

  const timeBtns = Array.from(document.querySelectorAll(".time-segment button"));
  if (timeBtns.length) {
    let label = "All";
    if (activeTime === "today") label = "Today";
    if (activeTime === "thisweek") label = "This Week";
    if (activeTime === "thismonth") label = "This Month";

    const target = timeBtns.find(b => (b.textContent || "").trim() === label);
    if (target) setActive(target);
  }

  const platBtns = Array.from(document.querySelectorAll(".platforms button"));
  if (platBtns.length) {
    const target = platBtns.find(b => (b.dataset.platform || "all") === activePlatform);
    if (target) setActive(target);
  }
}

/* =========================
   STORE CTA LOGIC (LOCKED)
========================= */
function appleSearchTerm(str = "") {
  return str.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

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

    const res = await fetch("/api/igdb", { cache: "no-store" });
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
   FILTER PIPELINE (LOCKED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const tomorrow = startOfTomorrow();

  const outNow = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) < tomorrow);
  const comingSoon = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) >= tomorrow);

  let list = activeSection === "out" ? outNow : comingSoon;

  list = applyTimeWindow(list, activeSection, activeTime);

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(g => platformMatches(g, key));
  }

  lastListPath = window.location.pathname || "/";
  renderList(list);
}

/* =========================
   LIST RENDER (LOCKED)
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

    card.onclick = () => openDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS PAGE (FIXED + SAFE)
========================= */
function renderDetails(game, replace = false) {
  viewMode = "details";

  const slug = slugify(game.name);
  const path = `/game/${game.id}${slug ? "-" + slug : ""}`;

  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);

  setMetaTitle(`${game.name} — Gamerly`);

  const summaryText = game.summary ? escapeHtml(game.summary.slice(0, 240)) : "";
  setMetaDescription(summaryText || `Release info for ${game.name}.`);

  /* ✅ DETAIL SELF-CANONICAL (HIGH ROI, SAFE) */
  setCanonical(`https://gamerly.net${path}`);

  const release = game.releaseDate
    ? new Date(game.releaseDate).toDateString()
    : "Release date unknown";

  const store = getPrimaryStore(game);

  const gallery =
    Array.isArray(game.screenshots) && game.screenshots.length
      ? `
        <div style="margin-top:14px;">
          <div style="font-weight:800; margin-bottom:8px;">Screenshots</div>
          <div class="details-gallery">
            ${game.screenshots
              .map(
                (url) => `
                <img
                  src="${url}"
                  alt="${escapeHtml(game.name)} screenshot"
                  loading="lazy"
                />
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover">
      </div>

      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        <div class="details-sub">${escapeHtml(release)}</div>

        ${summaryText ? `<p class="details-summary">${summaryText}</p>` : ""}

        <div class="details-platforms">${renderPlatforms(game)}</div>

        ${gallery}

        ${
          store
            ? `<a class="cta-primary"
                 href="${store.url}"
                 target="_blank"
                 rel="nofollow sponsored noopener">
                 ${store.label}
               </a>`
            : ""
        }

        <button class="details-back" id="backBtn">← Back to list</button>
      </div>
    </section>
  `;

  showMoreBtn.style.display = "none";

  const back = document.getElementById("backBtn");
  if (back) {
    back.onclick = () => {
      history.pushState({}, "", lastListPath || "/");
      applyFilters(true);
    };
  }
}

function openDetails(game) {
  renderDetails(game);
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
   FILTER EVENTS (SAFE)
========================= */
document.querySelectorAll(".section-segment button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", lastListPath || "/");
    activeSection = btn.textContent.includes("Out") ? "out" : "soon";
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".time-segment button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", lastListPath || "/");

    const label = (btn.textContent || "").trim().toLowerCase();
    if (label === "all") activeTime = "all";
    else if (label === "today") activeTime = "today";
    else if (label === "this week") activeTime = "thisweek";
    else if (label === "this month") activeTime = "thismonth";
    else activeTime = "all";

    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", lastListPath || "/");
    activePlatform = btn.dataset.platform || "all";
    setActive(btn);
    applyFilters(true);
  };
});

showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  applyFilters();
};

/* =========================
   POPSTATE (DETAILS RESTORE)
========================= */
window.addEventListener("popstate", () => {
  const id = parseDetailsIdFromPath(window.location.pathname);
  if (id) {
    const g = allGames.find(x => String(x.id) === String(id));
    if (g) return renderDetails(g, true);
  }
  applyFilters(true);
});

/* =========================
   INIT
========================= */
initRouteDefaults();
syncActiveButtons();
applyRouteMeta();
applyRouteH1();
loadGames();
