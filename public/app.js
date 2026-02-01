const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const rangeSelect = document.getElementById("rangeSelect");
const sortSelect = document.getElementById("sortSelect");
const platformButtons = document.querySelectorAll("[data-platform]");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const state = {
  platforms: new Set(),
  range: "this_week",
  sort: "newest",
};

function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function verifyAge() {
  localStorage.setItem("gamerly_age_verified", "true");
  ageGate.style.display = "none";
  fetchGames();
}

if (!isAgeVerified()) {
  ageConfirmBtn.addEventListener("click", verifyAge);
} else {
  ageGate.style.display = "none";
}

function buildUrl() {
  const params = new URLSearchParams();
  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }
  params.set("range", state.range);
  params.set("sort", state.sort);
  return `/api/igdb?${params.toString()}`;
}

function formatDate(date) {
  if (!date) return "Unknown release";
  return new Date(date).toLocaleDateString();
}

function renderGames(games) {
  grid.innerHTML = "";

  if (!games.length) {
    grid.innerHTML = "<p>No games found.</p>";
    return;
  }

  for (const g of games) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = g.coverUrl || "";
    img.onerror = () => (img.src = "");
    img.alt = g.name;

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
  }
}

async function fetchGames() {
  loading.style.display = "block";
  errorBox.textContent = "";

  try {
    const res = await fetch(buildUrl());
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to load games");
    }

    renderGames(data.games);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

platformButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const p = btn.dataset.platform;
    btn.classList.toggle("active");

    state.platforms.has(p)
      ? state.platforms.delete(p)
      : state.platforms.add(p);

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

if (isAgeVerified()) {
  fetchGames();
}
