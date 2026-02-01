// public/app.js
// FINAL — correct data split + restored age verification

const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

const sectionButtons = document.querySelectorAll(".section-segment button");
const platformButtons = document.querySelectorAll("[data-platform]");

const state = {
  section: "out-now",
  platforms: new Set(),
  data: { outNow: [], comingSoon: [] },
};

/* =========================
   AGE VERIFICATION
========================= */
function isAgeVerified() {
  return localStorage.getItem("gamerly_age_verified") === "true";
}

function hideAgeGate() {
  ageGate.style.display = "none";
}

function confirmAge() {
  localStorage.setItem("gamerly_age_verified", "true");
  hideAgeGate();
  fetchGames();
}

if (isAgeVerified()) {
  hideAgeGate();
} else {
  ageGate.style.display = "flex";
  ageConfirmBtn.addEventListener("click", confirmAge);
}

/* =========================
   API
========================= */
function buildApiUrl() {
  const params = new URLSearchParams();
  if (state.platforms.size) {
    params.set("platforms", [...state.platforms].join(","));
  }
  return `/api/igdb?${params.toString()}`;
}

/* =========================
   RENDER
========================= */
function render(games) {
  grid.innerHTML = "";

  games.slice(0, 36).forEach(g => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img loading="lazy" src="${g.coverUrl || ""}" alt="${g.name}">
      <div class="card-body">
        <div class="card-title">${g.name}</div>
        <div class="card-meta">
          ${g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBD"}
        </div>
      </div>
    `;

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
    if (!data.ok) throw new Error(data.error);

    state.data = data;

    // update counts
    sectionButtons[0].innerHTML = `Out Now <span class="count">${data.outNow.length}</span>`;
    sectionButtons[1].innerHTML = `Coming Soon <span class="count">${data.comingSoon.length}</span>`;

    render(state.section === "out-now" ? data.outNow : data.comingSoon);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   EVENTS
========================= */
sectionButtons.forEach(btn => {
  btn.onclick = () => {
    sectionButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.section = btn.textContent.toLowerCase().includes("coming")
      ? "coming-soon"
      : "out-now";
    render(state.section === "out-now" ? state.data.outNow : state.data.comingSoon);
  };
});

platformButtons.forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
    btn.classList.contains("active")
      ? state.platforms.add(btn.dataset.platform)
      : state.platforms.delete(btn.dataset.platform);
    fetchGames();
  };
});

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
