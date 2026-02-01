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
let outNowGames = [];
let comingSoonGames = [];

let activeSection = "out";   // out | soon
let activeTime = "all";      // all | today | week | month
let activePlatform = "all";

let visibleCount = 0;
const PAGE_SIZE = 24;

/* =========================
   PLATFORM MAP (IGDB)
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
   FETCH (LOCKED)
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb");
    const data = await res.json();
    if (!data.ok) throw new Error("API failed");

    outNowGames = data.outNow || [];
    comingSoonGames = data.comingSoon || [];

    // Restore counts (trust signal)
    document.querySelector(".section-segment button:nth-child(1)").innerHTML =
      `Out Now <span class="count">${outNowGames.length}</span>`;
    document.querySelector(".section-segment button:nth-child(2)").innerHTML =
      `Coming Soon <span class="count">${comingSoonGames.length}</span>`;

    applyFilters(true);
  } catch {
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE (FINAL)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  let list =
    activeSection === "out"
      ? [...outNowGames]
      : [...comingSoonGames];

  /* PLATFORM FILTER */
  if (activePlatform !== "all") {
    const validIds = PLATFORM_MAP[activePlatform] || [];
    list = list.filter(game =>
      Array.isArray(game.platformIds) &&
      game.platformIds.some(id => validIds.includes(id))
    );
  }

  /* TIME FILTER
     - Out Now: intentionally NONE
     - Coming Soon: bounded windows
  */
  if (activeSection === "soon" && activeTime !== "all") {
    const now = new Date();

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

  render(list);
}

/* =========================
   RENDER (LOCKED)
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
      <img src="${game.cover || ""}" loading="lazy" />
      <div class="card-body">
        <div class="badge-row">
          ${(game.genres || [])
            .map(g => `<span class="badge-category">${g}</span>`)
            .join("")}
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
   PLATFORM ICONS (IGDB SAFE)
========================= */
function renderPlatforms(game) {
  if (!Array.isArray(game.platformIds)) return "";

  const ids = game.platformIds;
  const chips = [];

  if (ids.includes(6)) chips.push(`<span class="platform-chip pc">PC</span>`);
  if ([48,49,169].some(id => ids.includes(id)))
    chips.push(`<span class="platform-chip xbox">Xbox</span>`);
  if ([130,167].some(id => ids.includes(id)))
    chips.push(`<span class="platform-chip">Switch</span>`);
  if (ids.includes(39)) chips.push(`<span class="platform-chip">iOS</span>`);
  if (ids.includes(34)) chips.push(`<span class="platform-chip">Android</span>`);

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
