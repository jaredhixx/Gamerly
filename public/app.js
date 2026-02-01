const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const showMoreBtn = document.getElementById("showMore");

/* =========================
   AGE GATE
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
let visibleCount = 0;
const PAGE_SIZE = 24;

let activeSection = "out";   // out | soon
let activeTime = "all";      // all | today | week | month
let activePlatform = "all";

/* =========================
   FETCH
========================= */
async function loadGames() {
  try {
    loading.style.display = "block";
    errorBox.textContent = "";

    const res = await fetch("/api/igdb");
    const data = await res.json();

    if (!data || !Array.isArray(data.games)) {
      throw new Error("Invalid API response");
    }

    allGames = data.games;
    updateCounts();
    applyFilters(true);
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;

  const now = new Date();

  let list = allGames.filter(g => {
    const d = new Date(g.releaseDate);
    return activeSection === "out" ? d <= now : d > now;
  });

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(g =>
      g.platforms.some(p => p.toLowerCase().includes(key))
    );
  }

  if (activeSection === "soon" && activeTime !== "all") {
    list = list.filter(g => {
      const d = new Date(g.releaseDate);

      if (activeTime === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (activeTime === "week") {
        return d <= new Date(now.getTime() + 7 * 86400000);
      }
      if (activeTime === "month") {
        return d <= new Date(now.getTime() + 30 * 86400000);
      }
      return true;
    });
  }

  render(list);
}

/* =========================
   COUNTS
========================= */
function updateCounts() {
  const now = new Date();
  const outNowCount = allGames.filter(g => new Date(g.releaseDate) <= now).length;
  const soonCount = allGames.length - outNowCount;

  document.querySelector(".section-segment button:nth-child(1)").innerHTML =
    `Out Now <span class="count">${outNowCount}</span>`;
  document.querySelector(".section-segment button:nth-child(2)").innerHTML =
    `Coming Soon <span class="count">${soonCount}</span>`;
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
      <img src="${game.coverUrl}" loading="lazy" />
      <div class="card-body">
        ${game.category ? `<div class="badge-row"><span class="badge-category">${game.category}</span></div>` : ""}
        <div class="card-title">${game.name}</div>
        <div class="card-meta">${new Date(game.releaseDate).toLocaleDateString()}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   PLATFORM ICONS
========================= */
function renderPlatforms(game) {
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
   EVENTS
========================= */
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
  button.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

/* =========================
   INIT
========================= */
loadGames();
