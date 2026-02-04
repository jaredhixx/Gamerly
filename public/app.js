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
  STEAM: PATH.startsWith("/steam-games"),
};

// =========================
// STEAM GENRE ROUTE (SAFE)
// =========================
const GENRE_MATCH = PATH.match(/^\/steam-games\/genre\/([a-z-]+)/);
const ACTIVE_GENRE = GENRE_MATCH ? GENRE_MATCH[1] : null;

let lastListPath = "/";

/* =========================
   AGE GATE (LOCKED)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const ageGate = document.getElementById("ageGate");
  const ageBtn = document.getElementById("ageConfirmBtn");

  if (!ageGate || !ageBtn) return;

  if (localStorage.getItem("gamerly_age_verified") === "true") {
    ageGate.style.display = "none";
  } else {
    ageGate.style.display = "flex";
  }

  ageBtn.onclick = () => {
    localStorage.setItem("gamerly_age_verified", "true");
    ageGate.style.display = "none";
  };
});

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

function getGenreSlugsForLinks(genres = []) {
  const supported = ["action", "rpg", "horror", "simulation", "indie"];

  return genres
    .map(g => normalizeGenreName(g))
    .flatMap(g => {
      if (g.includes("role")) return ["rpg"];
      return supported.filter(s => g.includes(s));
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3); // hard cap for SEO cleanliness
}

function normalizeGenreName(name = "") {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")   // remove (RPG)
    .replace(/[-/]/g, " ")     // convert hyphens & slashes to spaces
    .replace(/[^a-z\s]/g, "")  // remove remaining punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function genreMatches(game, genreSlug) {
  if (!game || !Array.isArray(game.genres)) return false;

  const genres = game.genres.map(g => normalizeGenreName(g));

  switch (genreSlug) {
    case "horror":
      return genres.some(g => g.includes("horror"));

    case "action":
      return genres.some(g =>
        g.includes("action") ||
        g.includes("shooter") ||
        g.includes("fighting") ||
        g.includes("platform")
      );

    case "rpg":
      return genres.some(g =>
        g.includes("role") ||
        g.includes("rpg")
      );

    case "simulation":
      return genres.some(g =>
        g.includes("simulation") ||
        g.includes("simulator") ||
        g.includes("management") ||
        g.includes("tycoon")
      );

    case "indie":
      // Indie exists in IGDB data — use it directly now
      return genres.some(g => g.includes("indie"));

    default:
      return false;
  }
}

function isNewRelease(game, days = 7) {
  if (!game || !game.releaseDate) return false;

  const today = localDay(new Date());
  const released = localDay(game.releaseDate);
  const cutoff = addDays(startOfLocalDay(new Date()), -days).getTime();

  return released >= cutoff && released <= today;
}

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
  const today = new Date();
    // =========================
  // STEAM GENRE SEO (HIGH ROI)
  // =========================
  if (ACTIVE_GENRE) {
    const label = ACTIVE_GENRE.replace(/-/g, " ");
    setMetaTitle(`New ${label} Games on Steam — Updated Daily`);
    setMetaDescription(
      `Browse new and upcoming ${label} games on Steam. Updated daily with PC releases worth playing.`
    );
    setCanonical(`https://gamerly.net/steam-games/genre/${ACTIVE_GENRE}`);
    return;
  }
  const fmt = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (path === "/steam-games-today") {
    setMetaTitle(`New Steam Games Today (${fmt}) — Full Release List`);
    setMetaDescription(
  "See Steam games released today. Updated daily with new PC game launches now available on Steam."
);
    setCanonical("https://gamerly.net/steam-games-today");
    return;
  }

  if (path === "/steam-games-this-week") {
    setMetaTitle(`Steam Games This Week (${fmt}) — New PC Releases`);
    setMetaDescription(
  "Browse Steam games released this week. Updated daily with the latest new PC releases on Steam."
);
    setCanonical("https://gamerly.net/steam-games-this-week");
    return;
  }

  if (path === "/steam-games-upcoming") {
    setMetaTitle("Upcoming Steam Games (Next 30 Days) — Updated Daily");
    setMetaDescription(
  "Explore upcoming Steam games coming soon to PC. Updated daily so you never miss a new Steam release."
);
    setCanonical("https://gamerly.net/steam-games-upcoming");
    return;
  }

  if (path === "/steam-games") {
    setMetaTitle("Steam Game Releases — New & Upcoming PC Games");
    setMetaDescription(
  "Browse new and recent Steam game releases on PC. Updated daily with curated games available now on Steam."
);
    setCanonical("https://gamerly.net/steam-games");
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

    if (ACTIVE_GENRE) {
    const label = ACTIVE_GENRE.replace(/-/g, " ");
    h1.textContent = `New ${label} Games on Steam`;
    return;
  }

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

// ✅ Clean truncation: no mid-word cuts, prefers ending on punctuation
function smartSnippet(text = "", max = 240) {
  const s = String(text).replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= max) return s;

  // look a bit past max so we can find punctuation or a word break
  const window = s.slice(0, max + 20);

  // Prefer ending on sentence punctuation if it appears "late enough"
  const lastPeriod = window.lastIndexOf(".");
  const lastBang = window.lastIndexOf("!");
  const lastQ = window.lastIndexOf("?");
  const punct = Math.max(lastPeriod, lastBang, lastQ);

  // only use punctuation if it's not too early (avoids tiny snippets)
  if (punct >= Math.floor(max * 0.6)) {
    return window.slice(0, punct + 1).trim();
  }

  // otherwise cut at last space before max
  const cut = s.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, max);
  return base.trim() + "…";
}

/* =========================
   GAME SCHEMA (SEO, SAFE)
========================= */
function injectGameSchema(game) {
  const existing = document.getElementById("game-schema");
  if (existing) existing.remove();

  if (!game || !game.name || !game.releaseDate) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.name,
    "datePublished": game.releaseDate.split("T")[0],
    "image": [
      game.coverUrl,
      ...(Array.isArray(game.screenshots) ? game.screenshots : [])
    ].filter(Boolean),
    "gamePlatform": Array.isArray(game.platforms)
      ? game.platforms
      : undefined,
    "applicationCategory": "Game"
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "game-schema";
  script.textContent = JSON.stringify(schema);

  document.head.appendChild(script);
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

/* ✅ LOCAL DAY NORMALIZER (FIXES UTC BUG) */
function localDay(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/* =========================
   TIME WINDOW (SAFE, ADDITIVE)
========================= */
function addDays(dateObj, days) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getTimeWindow(section, timeKey) {
  if (!timeKey || timeKey === "all") return null;

  const today = startOfLocalDay(new Date());
  const tomorrow = addDays(today, 1);

  if (section === "out") {
  if (timeKey === "today") {
    return { start: today, end: tomorrow };
  }

  if (timeKey === "thisweek") {
    const start = startOfWeek(today);
    return { start, end: tomorrow };
  }

  if (timeKey === "thismonth") {
    const start = startOfMonth(today);
    return { start, end: tomorrow };
  }

  return null;
}

  // coming soon
  if (timeKey === "today") {
    return { start: tomorrow, end: addDays(tomorrow, 1) };
  }
  if (timeKey === "thisweek") {
    return { start: tomorrow, end: addDays(tomorrow, 7) };
  }
  if (timeKey === "thismonth") {
    return { start: tomorrow, end: addDays(tomorrow, 30) };
  }

  return null;
}

function applyTimeWindow(list, section, timeKey) {
  const win = getTimeWindow(section, timeKey);
  if (!win) return list;

  const startMs = win.start.getTime();
  const endMs = win.end.getTime();

  return list.filter(g => {
    if (!g || !g.releaseDate) return false;
    const d = new Date(g.releaseDate);
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
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

if (ACTIVE_GENRE) {
  activeSection = "all";   // 🔑 allow out + upcoming
  activeTime = "all";
  activePlatform = "pc";
  return;
}

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
  return { label: "View on Steam (PC) →", url: `https://store.steampowered.com/search/?term=${encodedName}` };

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
   FILTER PIPELINE (LOCKED + FIXED)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  const todayLocal = localDay(new Date());

  const outNow = allGames.filter(
    g => g.releaseDate && localDay(g.releaseDate) <= todayLocal
  );

  const comingSoon = allGames.filter(
    g => g.releaseDate && localDay(g.releaseDate) > todayLocal
  );

  let list =
  activeSection === "out"
    ? outNow
    : activeSection === "soon"
    ? comingSoon
    : [...outNow, ...comingSoon]; // ✅ genre pages

   if (activePlatform !== "all") {
  const key = activePlatform.toLowerCase();
  list = list.filter(g => platformMatches(g, key));
}

list = applyTimeWindow(list, activeSection, activeTime);

/* ✅ FRESHNESS CAP (GLOBAL, GENRE-AWARE) */
if (activeTime === "all") {
  const days =
    ACTIVE_GENRE
      ? 120   // 🎯 genre pages: last ~4 months only
      : activePlatform === "ios" || activePlatform === "android"
        ? 30
        : 90;

  const cutoff = addDays(startOfLocalDay(new Date()), -days).getTime();

  list = list.filter(g => {
    if (!g.releaseDate) return false;
    const t = localDay(g.releaseDate);
    return t >= cutoff;
  });
}



// =========================
// STEAM GENRE FILTER (SAFE)
// =========================
if (ACTIVE_GENRE) {
  list = list.filter(g => genreMatches(g, ACTIVE_GENRE));
}

/* ✅ EXPLICIT SORT */
list.sort((a, b) => {
  const da = a.releaseDate ? localDay(a.releaseDate) : 0;
  const db = b.releaseDate ? localDay(b.releaseDate) : 0;
  /* ✅ SORT: newest first (genre-safe) */
list.sort((a, b) => {
  const da = a.releaseDate ? localDay(a.releaseDate) : 0;
  const db = b.releaseDate ? localDay(b.releaseDate) : 0;
  return db - da;
});
});

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
    const releaseObj = new Date(game.releaseDate);
const releaseDate = releaseObj.toLocaleDateString();
const releaseISO = releaseObj.toISOString().split("T")[0];

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");

    card.innerHTML = `
  <img
  src="${game.coverUrl || ""}"
  alt="${escapeHtml(game.name)} cover"
  loading="lazy"
  decoding="async"
  width="264"
  height="352"
/>
  ${isNewRelease(game) ? `<div class="new-badge">NEW</div>` : ""}
  ${renderRating(game)}
  <div class="platform-overlay">${renderPlatforms(game)}</div>
  <div class="card-body">
        ${Array.isArray(game.genres) && game.genres.length
  ? `<span class="badge-category">${escapeHtml(game.genres[0])}</span>`
  : ""
}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">
  <time datetime="${releaseISO}">${releaseDate}</time>
</div>
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
  const rawSummary = game.summary ? String(game.summary) : "";
const metaDesc = rawSummary ? smartSnippet(rawSummary, 155) : `Release info for ${game.name}.`;
setMetaDescription(metaDesc);

const summaryText = rawSummary ? escapeHtml(smartSnippet(rawSummary, 420)) : "";
  setCanonical(`https://gamerly.net${path}`);
  injectGameSchema(game);

  let release = "Release date unknown";
let releaseISO = null;

if (game.releaseDate) {
  const d = new Date(game.releaseDate);
  release = d.toDateString();
  releaseISO = d.toISOString().split("T")[0];
}

  const store = getPrimaryStore(game);

  const gallery =
  Array.isArray(game.screenshots) && game.screenshots.length
    ? `
      <section class="details-screenshots" aria-labelledby="screenshots-heading" style="margin-top:14px;">
        <h2 id="screenshots-heading" style="font-weight:800; margin-bottom:8px;">
          Screenshots
        </h2>
        <div class="details-gallery">
          ${game.screenshots.map(
  (url, i) => `
              <img
  src="${url}"
  alt="${escapeHtml(game.name)} screenshot"
  loading="lazy"
  class="screenshot-thumb"
  data-screenshot-index="${i}"
/>
            `
          ).join("")}
        </div>
      </section>
    `
    : "";

  const genreLinks = getGenreSlugsForLinks(game.genres || []);
 
  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover">
      </div>
      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        <div class="details-sub">
  ${
    releaseISO
      ? `<time datetime="${releaseISO}">${escapeHtml(release)}</time>`
      : escapeHtml(release)
  }
</div>
        ${summaryText ? `<p class="details-summary">${summaryText}</p>` : ""}
        <div class="details-platforms">${renderPlatforms(game)}</div>
        ${gallery}
        ${store ? `
  <div class="steam-actions">
    <a
      class="cta-primary"
      href="${store.url}"
      target="_blank"
      rel="nofollow sponsored noopener"
    >
      Buy on Steam →
    </a>

    <div class="steam-secondary">
      <a
        href="https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}&category1=998"
        target="_blank"
        rel="nofollow sponsored noopener"
      >
        View Reviews
      </a>

      <a
        href="https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}"
        target="_blank"
        rel="nofollow sponsored noopener"
      >
        Add to Wishlist
      </a>
    </div>
  </div>
` : ""}

                <div class="more-steam">
  <div style="font-weight:800; margin-top:14px; margin-bottom:6px;">
    More PC Games on Steam
  </div>

  <ul style="list-style:none; padding:0; margin:0;">
  ${
    genreLinks.length
      ? genreLinks
          .map(
            g =>
              `<li><a href="/steam-games/genre/${g}">${g.charAt(0).toUpperCase() + g.slice(1)} games on Steam</a></li>`
          )
          .join("")
      : ""
  }
  ${
    game.releaseDate && localDay(game.releaseDate) === localDay(new Date())
      ? `<li><a href="/steam-games-today">New PC games on Steam today</a></li>`
      : ""
  }

  ${
    game.releaseDate &&
    localDay(game.releaseDate) >= addDays(startOfLocalDay(new Date()), -6).getTime() &&
    localDay(game.releaseDate) <= localDay(new Date())
      ? `<li><a href="/steam-games-this-week">New PC releases on Steam this week</a></li>`
      : ""
  }

  <li>
    <a href="/steam-games-upcoming">Steam games coming soon to PC</a>
  </li>

  <li>
    <a href="/steam-games">Full Steam game release list</a>
  </li>
</ul>

  <p style="margin-top:8px; font-size:0.75rem; opacity:0.75; max-width:420px;">
    Gamerly tracks new and upcoming Steam game releases daily so you never miss what’s launching on PC.
  </p>
</div>

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

// Enable CSS route-copy targeting
document.body.setAttribute("data-path", PATH);

loadGames();

/* =========================================================
   FULLSCREEN SCREENSHOT VIEWER (SAFE)
========================================================= */
let viewerIndex = 0;
let viewerImages = [];

function openScreenshotViewer(index) {
  viewerIndex = index;

  const viewer = document.createElement("div");
  viewer.className = "screenshot-viewer active";

  viewer.innerHTML = `
    <button class="screenshot-close">✕</button>
    <button class="screenshot-nav screenshot-prev">‹</button>
    <img src="${viewerImages[viewerIndex]}" alt="Screenshot">
    <button class="screenshot-nav screenshot-next">›</button>
  `;

  document.body.appendChild(viewer);

  const img = viewer.querySelector("img");

  function update() {
    img.src = viewerImages[viewerIndex];
  }

  viewer.querySelector(".screenshot-close").onclick = close;
  viewer.querySelector(".screenshot-prev").onclick = () => {
    viewerIndex = (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
    update();
  };
  viewer.querySelector(".screenshot-next").onclick = () => {
    viewerIndex = (viewerIndex + 1) % viewerImages.length;
    update();
  };

  viewer.onclick = e => {
    if (e.target === viewer) close();
  };

  document.addEventListener("keydown", esc);

  function esc(e) {
    if (e.key === "Escape") close();
  }

  function close() {
    document.removeEventListener("keydown", esc);
    viewer.remove();
  }
}

/* Attach handlers after details render */
document.addEventListener("click", e => {
  const img = e.target.closest(".screenshot-thumb");
  if (!img) return;

  const gallery = img.closest(".details-gallery");
  if (!gallery) return;

  viewerImages = Array.from(
    gallery.querySelectorAll(".screenshot-thumb")
  ).map(i => i.src);

  openScreenshotViewer(Number(img.dataset.screenshotIndex));
});
