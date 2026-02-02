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

let activeSection = "out"; // out | soon
let activeTime = "all";    // all | today | week | month
let activePlatform = "all";

let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   VIEW STATE (ADDITIVE)
========================= */
let viewMode = "list"; // list | details
let selectedGameId = null;

/* =========================
   ROUTING HELPERS (ADDITIVE)
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
  // Supports:
  // /game/123
  // /game/123-name-slug
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
   STORE LINK (SAFE + ROI)
   - Restores clicks NOW
   - Affiliate-ready later
========================= */
function buildStoreLink(game) {
  const name = (game?.name || "").trim();
  const q = encodeURIComponent(name);
  const p = Array.isArray(game?.platforms) ? game.platforms.join(" ").toLowerCase() : "";

  // Priority: Steam (best monetization surface) if PC exists
  if (p.includes("windows") || p.includes("pc")) {
    return `https://store.steampowered.com/search/?term=${q}`;
  }

  if (p.includes("playstation") || p.includes("ps")) {
    // PlayStation Store search
    return `https://store.playstation.com/search/${q}`;
  }

  if (p.includes("xbox")) {
    return `https://www.xbox.com/en-US/Search?q=${q}`;
  }

  if (p.includes("nintendo") || p.includes("switch")) {
    return `https://www.nintendo.com/us/search/#q=${q}`;
  }

  if (p.includes("ios") || p.includes("iphone") || p.includes("ipad")) {
    return `https://apps.apple.com/us/search?term=${q}`;
  }

  if (p.includes("android")) {
    return `https://play.google.com/store/search?q=${q}&c=apps`;
  }

  // Final fallback: general web search
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

    // Route on first load
    const id = parseDetailsIdFromPath(window.location.pathname);
    if (id) {
      const g = allGames.find(x => String(x.id) === String(id));
      if (g) {
        openDetails(g, { replace: true });
        return;
      }
      // If we couldn't find it, fall back safely to list
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

  const outNowGames = allGames.filter(g => {
    if (!g.releaseDate) return false;
    return new Date(g.releaseDate) <= now;
  });

  const comingSoonGames = allGames.filter(g => {
    if (!g.releaseDate) return false;
    return new Date(g.releaseDate) > now;
  });

  updateSectionCounts(outNowGames.length, comingSoonGames.length);

  let list =
    activeSection === "out"
      ? [...outNowGames]
      : [...comingSoonGames];

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
    const key = activePlatform.toLowerCase();
    list = list.filter(game =>
      Array.isArray(game.platforms) &&
      game.platforms.some(p => p.toLowerCase().includes(key))
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
   LIST RENDER
========================= */
function renderList(list) {
  viewMode = "list";
  selectedGameId = null;

  // Baseline meta for list page (stable)
  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile. Updated daily. Curated so you only see what matters.");

  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;

  grid.innerHTML = "";

  if (!slice.length) {
    grid.innerHTML = "<p>No games found.</p>";
    showMoreBtn.style.display = "none";
    return;
  }

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open details for ${game.name}`);

    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <img src="${game.coverUrl || ""}" loading="lazy" alt="${escapeHtml(game.name)} cover" />
      <div class="card-body">
        <div class="badge-row">
          ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        </div>
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">${new Date(game.releaseDate).toLocaleDateString()}</div>
      </div>
    `;

    card.onclick = () => openDetails(game);
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") openDetails(game);
    };

    grid.appendChild(card);
  });

  showMoreBtn.style.display =
    visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS RENDER (ADDITIVE)
   - Makes CSS actually apply
   - Keeps layout clean + conversion-focused
========================= */
function renderDetails(game) {
  viewMode = "details";
  selectedGameId = game?.id ?? null;

  const title = (game?.name || "Game") + " — Gamerly";
  setMetaTitle(title);

  const d = game?.releaseDate ? new Date(game.releaseDate) : null;
  const dateText = d ? d.toDateString() : "Release date unknown";
  const storeHref = buildStoreLink(game);

  // More CTR-friendly meta (safe: no backend change)
  setMetaDescription(`Release info for ${game?.name || "this game"} — platforms, date, and a fast store link. Powered by IGDB.`);

  grid.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" loading="lazy" />
      </div>

      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        <div class="details-sub">${escapeHtml(dateText)}</div>

        <div class="details-platforms">
          ${renderPlatforms(game)}
        </div>

        <a class="cta-primary" href="${storeHref}" target="_blank" rel="noopener noreferrer nofollow sponsored">
          View on Store
        </a>

        <button class="details-back" id="detailsBackBtn" type="button">
          ← Back
        </button>
      </div>
    </section>
  `;

  showMoreBtn.style.display = "none";

  const backBtn = document.getElementById("detailsBackBtn");
  if (backBtn) {
    backBtn.onclick = () => {
      history.pushState({}, "", "/");
      applyFilters(true);
    };
  }
}

function openDetails(game, opts = {}) {
  if (!game || !game.id) return;

  const slug = slugify(game.name);
  const path = `/game/${game.id}${slug ? "-" + slug : ""}`;

  if (opts.replace) {
    history.replaceState({}, "", path);
  } else {
    history.pushState({}, "", path);
  }

  renderDetails(game);
}

/* =========================
   RATINGS
========================= */
function renderRating(game) {
  const score = game.aggregated_rating;
  const count = game.aggregated_rating_count;

  if (typeof score !== "number" || typeof count !== "number" || score < 65 || count < 1) {
    return "";
  }

  return `<div class="rating-badge" title="Critic score">${Math.round(score)}</div>`;
}

/* =========================
   PLATFORM ICONS (LOCKED)
========================= */
function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";

  const p = game.platforms.join(" ").toLowerCase();
  const chips = [];

  if (p.includes("windows")) chips.push(`<span class="platform-chip pc">PC</span>`);
  if (p.includes("xbox")) chips.push(`<span class="platform-chip xbox">Xbox</span>`);
  if (p.includes("playstation")) chips.push(`<span class="platform-chip ps">PS</span>`);
  if (p.includes("nintendo")) chips.push(`<span class="platform-chip">Switch</span>`);
  if (p.includes("ios")) chips.push(`<span class="platform-chip">iOS</span>`);
  if (p.includes("android")) chips.push(`<span class="platform-chip">Android</span>`);

  return chips.join("");
}

/* =========================
   EVENTS (LOCKED)
   - If user clicks filters while on details:
     we safely return to list first
========================= */
document.querySelectorAll(".time-segment button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", "/");
    activeTime = btn.textContent.toLowerCase().replace(" ", "");
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".section-segment button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", "/");
    activeSection = btn.textContent.includes("Out") ? "out" : "soon";
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    if (viewMode === "details") history.pushState({}, "", "/");
    activePlatform = btn.dataset.platform || "all";
    setActive(btn);
    applyFilters(true);
  };
});

/* ✅ Show more (kept stable) */
showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  applyFilters();
};

/* =========================
   POPSTATE (BACK/FORWARD)
========================= */
window.addEventListener("popstate", () => {
  const id = parseDetailsIdFromPath(window.location.pathname);
  if (id) {
    const g = allGames.find(x => String(x.id) === String(id));
    if (g) {
      renderDetails(g);
      return;
    }
    // If route invalid, safely go home
    history.replaceState({}, "", "/");
  }
  applyFilters(true);
});

/* =========================
   UI HELPER (LOCKED)
========================= */
function setActive(button) {
  button.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

/* =========================
   SAFETY: ESCAPE HTML
========================= */
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   INIT
========================= */
loadGames();
