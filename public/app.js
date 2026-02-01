const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

let allGames = [];
let visibleCount = 0;
const PAGE_SIZE = 24;

let activeTime = "all";
let activeSection = "out";
let activePlatform = "all";

/* =========================
   PLATFORM MAP (RESTORED)
========================= */
const PLATFORM_MAP = {
  pc: [6],
  playstation: [48, 49, 167],
  xbox: [49, 169],
  nintendo: [130, 167],
  ios: [39],
  android: [34],
};

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    const res = await fetch("/api/igdb");
    const data = await res.json();

    allGames = [...data.outNow, ...data.comingSoon];
    applyFilters(true);
  } catch (e) {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTERING
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  let filtered = [...allGames];

  // SECTION
  filtered = filtered.filter(g =>
    activeSection === "out"
      ? new Date(g.releaseDate) <= new Date()
      : new Date(g.releaseDate) > new Date()
  );

  // TIME
  const now = new Date();
  filtered = filtered.filter(g => {
    const d = new Date(g.releaseDate);
    if (activeTime === "today") return d.toDateString() === now.toDateString();
    if (activeTime === "week") return d - now <= 7 * 86400000;
    if (activeTime === "month") return d - now <= 30 * 86400000;
    return true;
  });

  // PLATFORM (FIXED)
  if (activePlatform !== "all") {
    const validIds = PLATFORM_MAP[activePlatform] || [];
    filtered = filtered.filter(g =>
      Array.isArray(g.platformIds) &&
      g.platformIds.some(id => validIds.includes(id))
    );
  }

  render(filtered);
}

/* =========================
   RENDER
========================= */
function render(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;

  grid.innerHTML = "";

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="platform-overlay">
        ${renderPlatforms(game)}
      </div>
      <img src="${game.cover}" loading="lazy" />
      <div class="card-body">
        <div class="badge-row">
          ${game.genres.map(g => `<span class="badge-category">${g}</span>`).join("")}
        </div>
        <div class="card-title">${game.name}</div>
        <div class="card-meta">${game.releaseDate}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   HELPERS
========================= */
function renderPlatforms(game) {
  if (!game.platformIds) return "";
  const icons = [];

  if (game.platformIds.includes(6)) icons.push(`<span class="platform-chip pc">PC</span>`);
  if ([48,49].some(id => game.platformIds.includes(id))) icons.push(`<span class="platform-chip xbox">Xbox</span>`);
  if ([130,167].some(id => game.platformIds.includes(id))) icons.push(`<span class="platform-chip">Switch</span>`);
  if (game.platformIds.includes(39)) icons.push(`<span class="platform-chip">iOS</span>`);

  return icons.join("");
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
    setActive(btn);
    applyFilters(true);
  };
});

document.querySelectorAll(".platforms button").forEach(btn => {
  btn.onclick = () => {
    activePlatform = btn.dataset.platform || "all";
    setActive(btn);
    applyFilters(true);
  };
});

showMoreBtn.onclick = () => applyFilters();

/* =========================
   UI
========================= */
function setActive(button) {
  button.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

loadGames();
