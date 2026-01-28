let currentRange = "upcoming";
/* =========================
   Gamerly - app.js (matches your index.html IDs)
   ========================= */

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDateRange() {
  const today = new Date();

  let start;
  let end;

  if (currentRange === "today") {
    start = new Date(today);
    end = new Date(today);
  }

  if (currentRange === "week") {
    start = new Date(today);
    end = new Date(today);
    end.setDate(end.getDate() + 7);
  }

  if (currentRange === "upcoming") {
    start = new Date(today);
    end = new Date(today);
    end.setDate(end.getDate() + 30);
  }

  return {
    startStr: formatDate(start),
    endStr: formatDate(end),
  };
}


function $(id) {
  return document.getElementById(id);
}

function setListMessage(msg) {
  const grid = $("game-list");
  if (!grid) return;
  grid.innerHTML = `<div style="padding:12px; color:#555;">${msg}</div>`;
}
function isKidSafe(game) {
  // 1) Block explicit ESRB ratings if present
  const esrb = game?.esrb_rating?.name ? game.esrb_rating.name.toLowerCase() : "";

  if (esrb.includes("mature") || esrb.includes("adults only")) {
    return false;
  }

  // 2) Keyword safety net using name + tags + genres
  const tags = Array.isArray(game?.tags) ? game.tags.map(t => t?.name).filter(Boolean) : [];
  const genres = Array.isArray(game?.genres) ? game.genres.map(g => g?.name).filter(Boolean) : [];

  const textBlob = [game?.name || "", ...tags, ...genres].join(" ").toLowerCase();

  const blockedKeywords = [
    "hentai",
    "nudity",
    "sexual",
    "sex",
    "porn",
    "erotic",
    "nsfw",
    "adult",
    "bdsm"
  ];

  for (const word of blockedKeywords) {
    if (textBlob.includes(word)) return false;
  }

  return true;
}



async function fetchGames() {
  const platform = $("platform")?.value || "4";
  const sort = $("sort")?.value || "-added";
  const { startStr, endStr } = getDateRange();


  const url =
  `/api/games?platform=${encodeURIComponent(platform)}` +
  `&sort=${encodeURIComponent(sort)}` +
  `&range=${encodeURIComponent(currentRange)}`;



  console.log("Fetching:", url);

  const res = await fetch(url, { cache: "no-store" });
const data = await res.json();

console.log("Response:", data);

if (!res.ok) {
  throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
}

// ✅ Fallback: if no results found, fetch last 30 days instead
if (!data.results || data.results.length === 0) {
  console.log("No new/upcoming games — fetching recent releases as fallback...");
  const fallbackEnd = new Date();
  const fallbackStart = new Date();
  fallbackStart.setDate(fallbackEnd.getDate() - 30);

  const fallbackUrl =
    `/api/games?platform=${encodeURIComponent(platform)}` +
    `&sort=${encodeURIComponent(sort)}` +
    `&start=${encodeURIComponent(formatDate(fallbackStart))}` +
    `&end=${encodeURIComponent(formatDate(fallbackEnd))}`;

  const fallbackRes = await fetch(fallbackUrl, { cache: "no-store" });
  const fallbackData = await fallbackRes.json();

  return fallbackData;
}

return data;

}

function renderGames(data) {
  const grid = $("game-list");
  if (!grid) return;

const resultsRaw = Array.isArray(data?.results) ? data.results : [];
const results = resultsRaw.filter(isKidSafe);

  grid.innerHTML = "";

  if (results.length === 0) {
    setListMessage("No games returned for this date range / platform.");
    return;
  }

  for (const game of results) {
    const name = game?.name || "Untitled";
    const released = game?.released || "TBA";
    const img = game?.background_image || "";
    const slug = game?.slug || "";
    const href = slug ? `/game.html?slug=${slug}` : "#";


    // Platforms (badges)
    const platforms = Array.isArray(game?.platforms)
      ? game.platforms
          .map((p) => p?.platform?.name)
          .filter(Boolean)
          .slice(0, 6)
      : [];

    const badgesHtml = platforms
      .map((p) => `<span class="badge">${p}</span>`)
      .join("");

    const card = document.createElement("div");
    card.className = "card";

    // Determine Metacritic score or fallback
let meta = null;

if (typeof game?.metacritic === "number") {
  meta = game.metacritic;
} else if (Array.isArray(game?.metacritic_platforms) && game.metacritic_platforms.length > 0) {
  const allScores = game.metacritic_platforms
    .map(p => p?.metascore)
    .filter(s => typeof s === "number");
  if (allScores.length) {
    meta = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  }
}

// Build color-coded Metacritic badge
const metaBadge = `
  <span style="
    display:inline-block;
    margin-top:3px;
    background:${meta
      ? meta >= 75
        ? '#16a34a'
        : meta >= 50
        ? '#facc15'
        : '#dc2626'
      : '#e5e7eb'};
    color:${meta ? 'white' : '#374151'};
    font-weight:600;
    border-radius:4px;
    padding:1px 5px;
    font-size:0.7rem;
    line-height:1;">
    ${meta ? `★ ${meta}` : 'N/A'}
  </span>
`;


card.innerHTML = `
  <div class="card-img">
    ${img ? `<img src="${img}" alt="${name}" loading="lazy" />` : ""}
  </div>

  <div class="card-body">
    <div class="card-title">
      <a href="/game.html?slug=${slug}">${name}</a>
    </div>

    ${metaBadge}
    <div class="card-meta">Released: ${released}</div>

    ${badgesHtml ? `<div class="badges">${badgesHtml}</div>` : ""}
  </div>
`;


    grid.appendChild(card);
  }
}


  

async function loadGames() {
  try {
    setListMessage("Loading games…");
    const data = await fetchGames();
    renderGames(data);
  } catch (err) {
    console.error(err);
    setListMessage(`Error loading games: ${err?.message || "Unknown error"}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Reload when dropdowns change
  $("platform")?.addEventListener("change", loadGames);
  $("sort")?.addEventListener("change", loadGames);

  // Time filter buttons (Today / This Week / Upcoming)
  document.querySelectorAll("#time-filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentRange = btn.dataset.range;
      loadGames();
    });
  });

  // First load
  loadGames();
});

