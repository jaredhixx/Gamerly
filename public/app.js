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

let isDetailsView = false;

/* =========================
   SEO TITLE (LOCKED)
========================= */
function setTitle(title) {
  document.title = title;
}

function setRouteTitle(path) {
  const clean = path.replace(/^\/+|\/+$/g, "");

  if (!clean) {
    setTitle("Daily Game Releases & Upcoming Games | Gamerly");
    return;
  }

  if (clean === "out-now") {
    setTitle("Out Now: New Game Releases | Gamerly");
    return;
  }

  if (clean === "coming-soon") {
    setTitle("Coming Soon Games & Release Dates | Gamerly");
    return;
  }

  const platforms = {
    pc: "PC",
    playstation: "PlayStation",
    xbox: "Xbox",
    nintendo: "Nintendo",
    ios: "iOS",
    android: "Android",
  };

  if (platforms[clean]) {
    setTitle(`New & Upcoming ${platforms[clean]} Games | Gamerly`);
    return;
  }

  setTitle("Game Releases & Upcoming Games | Gamerly");
}

/* =========================
   ROUTING
========================= */
function applyRoute(path) {
  setRouteTitle(path);

  const clean = path.replace(/^\/+|\/+$/g, "");

  if (clean.startsWith("game/")) {
    renderDetailsPage(clean.split("/")[1]);
    return;
  }

  isDetailsView = false;
  showMoreBtn.style.display = "block";

  activeSection = "out";
  activePlatform = "all";

  if (clean === "coming-soon") activeSection = "soon";
  if (clean === "out-now") activeSection = "out";

  const platforms = ["pc", "playstation", "xbox", "nintendo", "ios", "android"];
  if (platforms.includes(clean)) {
    activePlatform = clean;
  }

  syncUI();
  applyFilters(true);
}

/* =========================
   UI SYNC
========================= */
function syncUI() {
  document.querySelectorAll(".platforms button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.platform === activePlatform);
  });

  document.querySelectorAll(".section-segment button").forEach(btn => {
    const isOut = btn.textContent.includes("Out");
    btn.classList.toggle(
      "active",
      (activeSection === "out" && isOut) ||
      (activeSection === "soon" && !isOut)
    );
  });

  document.querySelectorAll(".time-segment button").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().replace(" ", "") === activeTime
    );
  });
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
    applyRoute(window.location.pathname);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   DETAILS PAGE (UNCHANGED)
========================= */
function renderDetailsPage(id) {
  const game = allGames.find(g => String(g.id) === String(id));
  if (!game) return;

  isDetailsView = true;
  showMoreBtn.style.display = "none";

  setTitle(`${game.name} – Release Date, Platforms & Rating | Gamerly`);

  const isPC = game.platforms.some(p =>
    p.toLowerCase().includes("windows")
  );

  const steamUrl = isPC
    ? `https://store.steampowered.com/search/?term=${encodeURIComponent(
        game.name
      )}`
    : null;

  grid.innerHTML = `
    <div class="details">
      <div class="details-cover">
        <img src="${game.coverUrl}" />
      </div>
      <div class="details-info">
        <h1>${game.name}</h1>
        <div class="details-meta">
          <div>${new Date(game.releaseDate).toLocaleDateString()}</div>
          <div>${game.platforms.join(", ")}</div>
        </div>
        ${
          steamUrl
            ? `<a class="cta-primary" href="${steamUrl}" target="_blank">View on Steam</a>`
            : ""
        }
        <button class="details-back" onclick="goBack()">← Back</button>
      </div>
    </div>
  `;
}

function goBack() {
  history.pushState({}, "", "/");
  applyRoute("/");
}

/* =========================
   FILTER PIPELINE (LOCKED)
========================= */
function applyFilters(reset = false) {
  if (isDetailsView) return;

  if (reset) visibleCount = 0;

  const now = new Date();

  const outNowGames = allGames.filter(
    g => g.releaseDate && new Date(g.releaseDate) <= now
  );
  const comingSoonGames = allGames.filter(
    g => g.releaseDate && new Date(g.releaseDate) > now
  );

  updateSectionCounts(outNowGames.length, comingSoonGames.length);

  let list = activeSection === "out" ? outNowGames : comingSoonGames;

  if (activeTime !== "all") {
    list = list.filter(game => {
      const d = new Date(game.releaseDate);
      if (activeTime === "today") return d.toDateString() === now.toDateString();
      if (activeTime === "week")
        return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
      if (activeTime === "month")
        return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
      return true;
    });
  }

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(game =>
      game.platforms.some(p => p.toLowerCase().includes(key))
    );
  }

  render(list);
}

/* =========================
   COUNTS
========================= */
function updateSectionCounts(outCount, soonCount) {
  const buttons = document.querySelectorAll(".section-segment button");
  if (buttons.length < 2) return;
  buttons[0].innerHTML = `Out Now <span class="count">${outCount}</span>`;
  buttons[1].innerHTML = `Coming Soon <span class="count">${soonCount}</span>`;
}

/* =========================
   GRID RENDER (FIXED)
========================= */
function render(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;
  grid.innerHTML = "";

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => {
      history.pushState({}, "", `/game/${game.id}`);
      renderDetailsPage(game.id);
    };

    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <img src="${game.coverUrl}" loading="lazy" />
      <div class="card-body">
        <div class="badge-row">
          ${game.category ? `<span class="badge-category">${game.category}</span>` : ""}
        </div>
        <div class="card-title">${game.name}</div>
        <div class="card-meta">
          ${new Date(game.releaseDate).toLocaleDateString()}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display =
    visibleCount < list.length ? "block" : "none";
}

/* =========================
   HELPERS
========================= */
function renderRating(game) {
  if (
    typeof game.aggregated_rating !== "number" ||
    game.aggregated_rating < 65
  ) return "";
  return `<div class="rating-badge">${Math.round(game.aggregated_rating)}</div>`;
}

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
   EVENTS
========================= */
document.querySelectorAll(".time-segment button").forEach(btn => {
  btn.onclick = () => {
    activeTime = btn.textContent.toLowerCase().replace(" ", "");
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".section-segment button").forEach(btn => {
  btn.onclick = () => {
    activeSection = btn.textContent.includes("Out") ? "out" : "soon";
    history.pushState({}, "", activeSection === "out" ? "/out-now" : "/coming-soon");
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    activePlatform = btn.dataset.platform || "all";
    history.pushState({}, "", activePlatform === "all" ? "/" : `/${activePlatform}`);
    setActive(btn);
    applyFilters(true);
  };
});

function setActive(button) {
  button.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

window.addEventListener("popstate", () => {
  applyRoute(window.location.pathname);
});

/* =========================
   INIT
========================= */
loadGames();
