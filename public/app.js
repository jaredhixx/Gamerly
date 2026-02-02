const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   VIEW CONTAINERS (NEW – SAFE)
========================= */
const listView = document.querySelector("main");
const detailView = document.getElementById("detailView");

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
   VIEW STATE
========================= */
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
   STORE LINK (ROI SAFE)
========================= */
function buildStoreLink(game) {
  const name = (game?.name || "").trim();
  const q = encodeURIComponent(name);
  const p = Array.isArray(game?.platforms)
    ? game.platforms.join(" ").toLowerCase()
    : "";

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

  return `https://www.google.com/search?q=${encodeURIComponent(name + " game")}`;
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

  detailView.style.display = "none";
  detailView.innerHTML = "";
  listView.style.display = "block";

  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription(
    "Track new and upcoming game releases across PC, console, and mobile. Updated daily."
  );

  const now = new Date();

  const outNow = allGames.filter(
    g => g.releaseDate && new Date(g.releaseDate) <= now
  );
  const comingSoon = allGames.filter(
    g => g.releaseDate && new Date(g.releaseDate) > now
  );

  updateSectionCounts(outNow.length, comingSoon.length);

  let list = activeSection === "out" ? outNow : comingSoon;

  if (activeTime !== "all") {
    list = list.filter(g => {
      const d = new Date(g.releaseDate);
      if (activeTime === "today") return d.toDateString() === now.toDateString();
      if (activeTime === "week") return d <= new Date(now.getTime() + 7 * 864e5);
      if (activeTime === "month") return d <= new Date(now.getTime() + 30 * 864e5);
      return true;
    });
  }

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(
      g =>
        Array.isArray(g.platforms) &&
        g.platforms.some(p => p.toLowerCase().includes(key))
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

    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" />
      <div class="card-body">
        ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">${new Date(game.releaseDate).toLocaleDateString()}</div>
      </div>
    `;

    card.onclick = () => openDetails(game);
    grid.appendChild(card);
  });

  showMoreBtn.style.display =
    visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS PAGE (ROOT-LEVEL)
========================= */
function renderDetails(game, replace = false) {
  viewMode = "details";

  const slug = slugify(game.name);
  const path = `/game/${game.id}${slug ? "-" + slug : ""}`;

  replace
    ? history.replaceState({}, "", path)
    : history.pushState({}, "", path);

  setMetaTitle(`${game.name} — Gamerly`);

  const summaryText = game.summary
    ? escapeHtml(game.summary.slice(0, 240))
    : "";

  setMetaDescription(
    summaryText ||
    `Release info for ${game.name}. Platforms, release date, and store links.`
  );

  const release = game.releaseDate
    ? new Date(game.releaseDate).toDateString()
    : "Release date unknown";

  const screenshotsHtml =
    Array.isArray(game.screenshots) && game.screenshots.length
      ? `
        <div class="details-gallery">
          ${game.screenshots.map(url => `
            <img src="${url}" alt="${escapeHtml(game.name)} screenshot" loading="lazy" />
          `).join("")}
        </div>
      `
      : "";

  listView.style.display = "none";
  detailView.style.display = "block";

  detailView.innerHTML = `
    <section class="details">
      <div class="details-cover">
        <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover">
      </div>

      <div class="details-info">
        <h1 class="details-title">${escapeHtml(game.name)}</h1>
        <div class="details-sub">${escapeHtml(release)}</div>

        ${summaryText ? `<p class="details-summary">${summaryText}</p>` : ""}

        ${screenshotsHtml}

        <div class="details-platforms">
          ${renderPlatforms(game)}
        </div>

        <a class="cta-primary"
           href="${buildStoreLink(game)}"
           target="_blank"
           rel="nofollow sponsored noopener">
          View on Store
        </a>

        <button class="details-back" id="backBtn">← Back to list</button>
      </div>
    </section>
  `;

  showMoreBtn.style.display = "none";

  document.getElementById("backBtn").onclick = () => {
    history.pushState({}, "", "/");
    applyFilters(true);
  };
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
   FILTER EVENTS (LOCKED)
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

showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  applyFilters();
};

window.addEventListener("popstate", () => {
  const id = parseDetailsIdFromPath(window.location.pathname);

  if (id) {
    const g = allGames.find(x => String(x.id) === String(id));
    if (g) return renderDetails(g, true);
  }

  applyFilters(true);
});

function setActive(button) {
  button.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

/* =========================
   INIT
========================= */
loadGames();
