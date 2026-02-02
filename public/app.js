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
   STATE
========================= */
let allGames = [];

let activeSection = "out"; // out | soon
let activeTime = "all";    // all | today | week | month
let activePlatform = "all";

let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   SEO ROUTING (ADDITIVE)
========================= */
function applyRoute(path) {
  const clean = path.replace(/^\/+|\/+$/g, "");
  activePlatform = "all";
  activeSection = "out";

  if (clean === "coming-soon") activeSection = "soon";
  if (clean === "out-now") activeSection = "out";

  const platforms = ["pc", "playstation", "xbox", "nintendo", "ios", "android"];
  if (platforms.includes(clean)) {
    activePlatform = clean;
  }

  syncUI();
}

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
      if (activeTime === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (activeTime === "week") {
        return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
      }
      if (activeTime === "month") {
        return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
      }
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

  render(list);
}

/* =========================
   SECTION COUNTS
========================= */
function updateSectionCounts(outCount, soonCount) {
  const buttons = document.querySelectorAll(".section-segment button");
  if (buttons.length < 2) return;

  buttons[0].innerHTML = `Out Now <span class="count">${outCount}</span>`;
  buttons[1].innerHTML = `Coming Soon <span class="count">${soonCount}</span>`;
}

/* =========================
   RENDER
========================= */
function render(list) {
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

    card.innerHTML = `
      <div class="platform-overlay">${renderPlatforms(game)}</div>
      ${renderRating(game)}
      <img src="${game.coverUrl || ""}" loading="lazy" />
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
   RATINGS
========================= */
function renderRating(game) {
  const score = game.aggregated_rating;
  const count = game.aggregated_rating_count;

  if (
    typeof score !== "number" ||
    typeof count !== "number" ||
    score < 65 ||
    count < 1
  ) {
    return "";
  }

  return `
    <div class="rating-badge" title="Critic score">
      ${Math.round(score)}
    </div>
  `;
}

/* =========================
   PLATFORM ICONS
========================= */
function renderPlatforms(game) {
  if (!Array.isArray(game.platforms)) return "";

  const p = game.platforms.join(" ").toLowerCase();
  const chips = [];

  if (p.includes("windows")) chips.push(`<span class="platform-chip pc">PC</span>`);
  if (p.includes("xbox")) chips.push(`<span class="platform-chip xbox">Xbox</span>`);
  if (p.includes("playstation")) chips.push(`<span class="platform-chip">PS</span>`);
  if (p.includes("nintendo")) chips.push(`<span class="platform-chip">Switch</span>`);
  if (p.includes("ios")) chips.push(`<span class="platform-chip">iOS</span>`);
  if (p.includes("android")) chips.push(`<span class="platform-chip">Android</span>`);

  return chips.join("");
}

/* =========================
   EVENTS (URL SYNC)
========================= */
document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    activePlatform = btn.dataset.platform || "all";
    history.pushState({}, "", activePlatform === "all" ? "/" : `/${activePlatform}`);
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

showMoreBtn.onclick = () => applyFilters();

window.addEventListener("popstate", () => {
  applyRoute(window.location.pathname);
  applyFilters(true);
});

/* =========================
   UI HELPER
========================= */
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
