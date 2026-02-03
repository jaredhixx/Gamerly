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
  STEAM_ALL: PATH === "/steam-games",
  STEAM_TODAY: PATH === "/steam-games-today",
  STEAM_WEEK: PATH === "/steam-games-this-week",
  STEAM_UPCOMING: PATH === "/steam-games-upcoming",
};

const IS_STEAM_MONEY_PAGE =
  ROUTE.STEAM_ALL || ROUTE.STEAM_TODAY || ROUTE.STEAM_WEEK || ROUTE.STEAM_UPCOMING;

let lastListPath = ROUTE.HOME ? "/" : (IS_STEAM_MONEY_PAGE ? PATH : "/");

/* =========================
   AGE GATE (RESTORED — LOCKED)
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
let visibleCount = 0;
const PAGE_SIZE = 24;

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

function isPCSteamCandidate(game) {
  if (!game || !Array.isArray(game.platforms)) return false;
  const p = game.platforms.join(" ").toLowerCase();
  return p.includes("windows") || p.includes("pc");
}

/* =========================
   STORE CTA (LOCKED)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;

  const encoded = encodeURIComponent(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows") || p.includes("pc"))
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
   FETCH (STABLE)
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb", { cache: "no-store" });
    const data = await res.json();

    if (!data || !data.ok || !Array.isArray(data.games)) {
      throw new Error("Invalid API response");
    }

    allGames = data.games;
    renderList(allGames);
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   LIST RENDER (STABLE)
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
    const releaseDate = game.releaseDate
      ? new Date(game.releaseDate).toLocaleDateString()
      : "TBA";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${game.coverUrl || ""}" alt="${escapeHtml(game.name)} cover" />
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <div class="card-body">
        ${game.category ? `<span class="badge-category">${escapeHtml(game.category)}</span>` : ""}
        <div class="card-title">${escapeHtml(game.name)}</div>
        <div class="card-meta">
          <span>${releaseDate}</span>
          ${store ? `<a class="card-cta" href="${store.url}" target="_blank" rel="nofollow noopener">${store.label}</a>` : ""}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   BADGES (LOCKED)
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
   SHOW MORE
========================= */
showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  renderList(allGames);
};

/* =========================
   INIT
========================= */
loadGames();
