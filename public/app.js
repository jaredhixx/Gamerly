// public/app.js
// Step 5: Fetch and render games from IGDB API

const gamesList = document.getElementById("gamesList");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const rangeSelect = document.getElementById("rangeSelect");
const sortSelect = document.getElementById("sortSelect");
const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  platforms: new Set(),
  range: "this_week",
  sort: "newest",
};

// ---------- helpers ----------
function setLoading(on) {
  loading.style.display = on ? "block" : "none";
}

function setError(msg) {
  if (!msg) {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  } else {
    errorBox.style.display = "block";
    errorBox.textContent = msg;
  }
}

function buildApiUrl() {
  const params = new URLSearchParams();

  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }

  params.set("range", state.range);
  params.set("sort", state.sort);

  return `/api/igdb?${params.toString()}`;
}

// ---------- rendering ----------
function renderGames(games) {
  gamesList.innerHTML = "";

  if (!games.length) {
    gamesList.innerHTML = "<li>No games found.</li>";
    return;
  }

  for (const game of games) {
    const li = document.createElement("li");
    li.textContent = game.name;
    gamesList.appendChild(li);
  }
}

// ---------- API ----------
async function fetchGames() {
  setError("");
  setLoading(true);

  try {
    const res = await fetch(buildApiUrl());
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to load games");
    }

    renderGames(data.games);
  } catch (err) {
    renderGames([]);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

// ---------- events ----------
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
  fetchGames();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  fetchGames();
});

// ---------- init ----------
fetchGames();
