const API_BASE = "/api/games";
const listEl = document.getElementById("game-list");
const sortEl = document.getElementById("sort");
const searchEl = document.getElementById("search");
const dateEl = document.getElementById("date-range");

// Platform toggles
const platformRow = document.createElement("div");
platformRow.className = "platform-row";
document.querySelector(".toolbar").before(platformRow);

const platforms = [
  { id: "pc", label: "PC" },
  { id: "playstation", label: "PlayStation" },
  { id: "xbox", label: "Xbox" },
  { id: "nintendo", label: "Nintendo" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
];

let activePlatforms = new Set();
let allGames = [];

platformRow.innerHTML = platforms
  .map((p) => `<button class="platform-btn" data-id="${p.id}">
    ${p.label}<span class="checkmark">✓</span></button>`)
  .join("");

platformRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".platform-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  btn.classList.toggle("active");
  if (activePlatforms.has(id)) activePlatforms.delete(id);
  else activePlatforms.add(id);
  renderList();
});

// Helpers
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const withinRange = (dateStr, range) => {
  const d = new Date(dateStr);
  if (range === "today") return d >= daysAgo(1);
  if (range === "week") return d >= daysAgo(7);
  if (range === "year") return d >= daysAgo(90);
  return true;
};

// Fetch games
async function fetchGames() {
  listEl.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div>`;
  try {
    const res = await fetch(`${API_BASE}?page_size=80`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.results)) return [];
    return data.results.filter(
      (g) => g.released &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.name || "") &&
        !/sex|porn|hentai|erotic|nsfw|lewd|nude/i.test(g.slug || "")
    );
  } catch (err) {
    console.error("fetch error:", err);
    return [];
  }
}

// Render cards
function renderGameCard(game) {
  const released = game.released || "TBA";
  const img = game.background_image || "";
  const platformsHTML =
    game.parent_platforms?.map(p => `<span class="badge">${p.platform.name}</span>`).join(" ") || "";

  const meta = game.metacritic != null
    ? `<span class="badge-meta ${
        game.metacritic >= 75 ? "meta-good" :
        game.metacritic >= 50 ? "meta-mid" : "meta-bad"
      }">${game.metacritic}</span>`
    : `<span class="badge-meta meta-na">N/A</span>`;

  const previewVideo = game.clip?.clip || null;
  const previewHTML = previewVideo
    ? `<div class="preview-box"><video src="${previewVideo}" autoplay muted loop></video>
        <button class="view-btn" onclick="window.location='/game.html?slug=${game.slug}'">View</button></div>`
    : "";

  return `
    <div class="card" onclick="window.location='/game.html?slug=${game.slug}'" title="${game.name}">
      <div class="card-img"><img src="${img}" alt="${game.name}" loading="lazy"></div>
      ${previewHTML}
      <div class="card-body">
        <div class="card-title">${game.name}</div>
        <div class="meta-row">${meta}<span class="release-date">Released: ${released}</span></div>
        <div class="badges">${platformsHTML}</div>
      </div>
    </div>`;
}

// Render list
function renderList() {
  let visible = [...allGames];
  if (activePlatforms.size) {
    visible = visible.filter((g) =>
      g.parent_platforms?.some((p) =>
        activePlatforms.has(p.platform.slug || p.platform.name?.toLowerCase())
      )
    );
  }
  const range = dateEl.value;
  if (range && range !== "all") visible = visible.filter((g) => withinRange(g.released, range));
  const q = searchEl.value.trim().toLowerCase();
  if (q) visible = visible.filter((g) => g.name.toLowerCase().includes(q));

  const sort = sortEl.value;
  if (sort === "released") visible.sort((a, b) => new Date(b.released) - new Date(a.released));
  if (sort === "-rating") visible.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
  if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name));

  listEl.innerHTML = visible.length
    ? visible.map(renderGameCard).join("")
    : `<div style="padding:40px;text-align:center;color:#777;">No games found.</div>`;
}

// Init
async function init() {
  allGames = await fetchGames();
  renderList();
}
sortEl.addEventListener("change", renderList);
searchEl.addEventListener("input", renderList);
dateEl.addEventListener("change", renderList);
init();

// 18+ Modal
const overlay = document.getElementById("ageOverlay");
const confirmBtn = document.getElementById("confirmAge");
if (!localStorage.getItem("gamerly_age_verified")) overlay.classList.remove("hidden");
else overlay.classList.add("hidden");
confirmBtn.addEventListener("click", () => {
  localStorage.setItem("gamerly_age_verified", "true");
  overlay.classList.add("hidden");
});
