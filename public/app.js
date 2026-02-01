const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const rangeSelect = document.getElementById("rangeSelect");
const sortSelect = document.getElementById("sortSelect");
const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  platforms: new Set(),
  range: "this_week",
  sort: "newest",
  allGames: [], // 🔑 cache raw API results
};

/* =========================
   HELPERS
========================= */
function buildApiUrl() {
  const params = new URLSearchParams();

  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }

  params.set("sort", state.sort);
  return `/api/igdb?${params.toString()}`;
}

function formatDate(date) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString();
}

/* =========================
   RANGE FILTER (CLIENT SIDE)
========================= */
function applyRangeFilter(games) {
  const now = Date.now();

  if (state.range === "all_time") return games;

  if (state.range === "past_3_months") {
    const cutoff = now - 90 * 24 * 60 * 60 * 1000;
    return games.filter(g => {
      if (!g.releaseDate) return true;
      return new Date(g.releaseDate).getTime() >= cutoff;
    });
  }

  // this_week = show recent + upcoming
  return games;
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

    state.allGames = data.games;

    const filtered = applyRangeFilter(state.allGames);
    renderGames(filtered);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
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

rangeSelect.addEventListener("change", () => {
  state.range = rangeSelect.value;
  renderGames(applyRangeFilter(state.allGames));
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  fetchGames();
});

/* =========================
   INIT
========================= */
fetchGames();
