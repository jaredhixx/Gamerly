// public/app.js
// Gamerly frontend — platform filters + 6-month future cap

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  platforms: new Set(),
};

/* =========================
   AGE VERIFICATION
========================= */
function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function confirmAge() {
  localStorage.setItem("gamerly_age_verified", "true");
  ageGate.style.display = "none";
  fetchGames();
}

if (!isAgeVerified()) {
  ageGate.style.display = "flex";
  ageConfirmBtn.addEventListener("click", confirmAge);
} else {
  ageGate.style.display = "none";
}

/* =========================
   HELPERS
========================= */
function buildApiUrl() {
  const params = new URLSearchParams();

  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }

  return `/api/igdb?${params.toString()}`;
}

function formatDate(date) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString();
}

/* =========================
   FUTURE CAP (6 MONTHS)
========================= */
function applyFutureCap(games) {
  const now = Date.now();
  const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;

  return games.filter(g => {
    if (!g.releaseDate) return true; // keep unknown dates for now
    const releaseTime = new Date(g.releaseDate).getTime();
    return releaseTime - now <= SIX_MONTHS;
  });
}

/* =========================
   RENDER
========================= */
function renderGames(games) {
  grid.innerHTML = "";

  if (!games.length) {
    grid.innerHTML = "<p>No games found.</p>";
    return;
  }

  games.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = g.coverUrl || "";
    img.alt = g.name;
    img.onerror = () => (img.style.display = "none");

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <div class="card-title">${g.name}</div>
      <div class="card-meta">${formatDate(g.releaseDate)}</div>
      <div class="card-meta">${g.rating ? g.rating + "/100" : "No rating"}</div>
    `;

    card.appendChild(img);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* =========================
   FETCH
========================= */
async function fetchGames() {
  loading.style.display = "block";
  errorBox.textContent = "";

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to load games");
    }

    const cappedGames = applyFutureCap(data.games);
    renderGames(cappedGames);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS — PLATFORMS ONLY
========================= */
platformButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const platform = btn.dataset.platform;

    if (state.platforms.has(platform)) {
      state.platforms.delete(platform);
      btn.classList.remove("active");
    } else {
      state.platforms.add(platform);
      btn.classList.add("active");
    }

    fetchGames();
  });
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
