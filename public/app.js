const grid = document.getElementById("gamesGrid");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const ageGate = document.getElementById("ageGate");
const ageConfirmBtn = document.getElementById("ageConfirmBtn");

/* =========================
   SAFETY CHECK
========================= */
if (!grid || !ageGate || !ageConfirmBtn) {
  console.error("Required DOM elements missing. Check index.html IDs.");
}

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
      <div class="card-meta">
        ${g.releaseDate ? new Date(g.releaseDate).toLocaleDateString() : "TBD"}
      </div>
      <div class="card-meta">
        ${g.rating ? g.rating + "/100" : "No rating"}
      </div>
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
    const res = await fetch("/api/igdb");
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

/* =========================
   INIT
========================= */
if (isAgeVerified()) {
  fetchGames();
}
