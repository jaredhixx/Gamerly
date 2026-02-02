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

/* =========================
   ROUTING (DETAILS)
========================= */
function getGameFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("game");
  if (!id) return null;
  return allGames.find(g => String(g.id) === id) || null;
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

    const detailGame = getGameFromURL();
    if (detailGame) {
      renderDetails(detailGame);
    } else {
      applyFilters(true);
    }
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

  const outNowGames = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) <= now);
  const comingSoonGames = allGames.filter(g => g.releaseDate && new Date(g.releaseDate) > now);

  updateSectionCounts(outNowGames.length, comingSoonGames.length);

  let list = activeSection === "out" ? outNowGames : comingSoonGames;

  if (activeTime !== "all") {
    list = list.filter(game => {
      const d = new Date(game.releaseDate);
      if (activeTime === "today") return d.toDateString() === now.toDateString();
      if (activeTime === "week") return d <= new Date(now.getTime() + 7 * 86400000);
      if (activeTime === "month") return d <= new Date(now.getTime() + 30 * 86400000);
      return true;
    });
  }

  if (activePlatform !== "all") {
    list = list.filter(game =>
      game.platforms?.some(p => p.toLowerCase().includes(activePlatform))
    );
  }

  render(list);
}

/* =========================
   COUNTS (LOCKED)
========================= */
function updateSectionCounts(out, soon) {
  const btns = document.querySelectorAll(".section-segment button");
  if (!btns.length) return;
  btns[0].innerHTML = `Out Now <span class="count">${out}</span>`;
  btns[1].innerHTML = `Coming Soon <span class="count">${soon}</span>`;
}

/* =========================
   GRID RENDER
========================= */
function render(list) {
  const slice = list.slice(0, visibleCount + PAGE_SIZE);
  visibleCount = slice.length;

  grid.innerHTML = "";

  slice.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => {
      history.pushState({}, "", `/?game=${game.id}`);
      renderDetails(game);
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
        <div class="card-meta">${new Date(game.releaseDate).toLocaleDateString()}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  showMoreBtn.style.display = visibleCount < list.length ? "block" : "none";
}

/* =========================
   DETAILS VIEW
========================= */
function renderDetails(game) {
  grid.innerHTML = `
    <div class="details">
      <div class="details-cover">
        <img src="${game.coverUrl}" />
      </div>
      <div class="details-info">
        <h1>${game.name}</h1>
        ${renderRating(game)}
        <div class="details-meta">${new Date(game.releaseDate).toDateString()}</div>
        <a class="cta-primary" href="#" target="_blank">View on Store</a>
        <button class="details-back" onclick="history.back()">← Back</button>
      </div>
    </div>
  `;
  showMoreBtn.style.display = "none";
}

/* =========================
   UI PIECES
========================= */
function renderRating(game) {
  if (!game.aggregated_rating || game.aggregated_rating < 65) return "";
  return `<div class="rating-badge">${Math.round(game.aggregated_rating)}</div>`;
}

function renderPlatforms(game) {
  const p = game.platforms?.join(" ").toLowerCase() || "";
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
========================= */
showMoreBtn.onclick = () => {
  visibleCount += PAGE_SIZE;
  applyFilters();
};

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

function setActive(button) {
  button.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

window.onpopstate = () => {
  const game = getGameFromURL();
  if (game) renderDetails(game);
  else applyFilters(true);
};

/* =========================
   INIT
========================= */
loadGames();
