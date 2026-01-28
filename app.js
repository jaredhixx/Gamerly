/* =========================
   Gamerly - Safe App.js
   ========================= */

let currentRange = "upcoming";

/* ---------- DATE HELPERS ---------- */

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDateRange() {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);

  if (currentRange === "today") {
    // today only
  } else if (currentRange === "week") {
    end.setDate(end.getDate() + 7);
  } else if (currentRange === "upcoming") {
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

/* ---------- SAFE FILTERS (INDUSTRY-GRADE) ---------- */

const ADULT_KEYWORDS = [
  "hentai","porno","porn","sex","sexual","nsfw","adult","erotic","uncensored",
  "tits","boobs","nude","nudity","futa","bdsm","milf","strip","rape","18+",
  "lewd","ecchi","oppai","yaoi","yuri","fetish","sensual","stripper"
];

const ADULT_TAGS = [
  "nsfw","adult","sexual content","erotic","hentai","mature","nudity","explicit"
];

const ADULT_PUBLISHERS = [
  "nutaku","f95","f95zone","mangagamer","kiss","illusion","alice soft"
];

function isKidSafe(game) {
  if (!game) return false;

  /* ESRB check */
  const esrb = game.esrb_rating?.name?.toLowerCase() || "";
  if (["mature", "adults only"].includes(esrb)) return false;

  /* Name check */
  const name = game.name?.toLowerCase() || "";
  if (ADULT_KEYWORDS.some(k => name.includes(k))) return false;

  /* Tags check */
  const tags = game.tags?.map(t => t.name.toLowerCase()) || [];
  if (tags.some(t => ADULT_TAGS.includes(t))) return false;

  /* Genres */
  const genres = game.genres?.map(g => g.name.toLowerCase()) || [];
  if (genres.some(g => ADULT_TAGS.includes(g))) return false;

  /* Publisher / developer check */
  const devs = game.developers?.map(d => d.name.toLowerCase()) || [];
  const pubs = game.publishers?.map(p => p.name.toLowerCase()) || [];

  if (devs.concat(pubs).some(n => ADULT_PUBLISHERS.some(b => n.includes(b)))) {
    return false;
  }

  return true;
}

/* ---------- FETCH GAMES ---------- */

function setListMessage(msg) {
  $("game-list").innerHTML = `<div style="padding:12px; opacity:0.7;">${msg}</div>`;
}

async function fetchGames() {
  const platform = $("platform")?.value || "4";
  const sort = $("sort")?.value || "-released";
  const { startStr, endStr } = getDateRange();

  const url =
    `/api/games?platform=${platform}&sort=${sort}` +
    `&start=${startStr}&end=${endStr}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "API error");

  return data.results || [];
}

/* ---------- RENDER GAMES ---------- */

function renderGames(results) {
  const grid = $("game-list");
  grid.innerHTML = "";

  const filtered = results.filter(isKidSafe);

  if (filtered.length === 0) {
    setListMessage("No kid-safe games found for this range.");
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement("div");
    card.className = "card";

    const img = game.background_image || "";
    const safePreview = !img ? `<div class="safe-preview">Safe Preview</div>` : "";
    const released = game.released || "TBA";
    const slug = game.slug;
    const isNew =
      released &&
      (new Date() - new Date(released)) / (1000 * 60 * 60 * 24) <= 7;

    card.onclick = () => {
      window.location.href = `/game.html?slug=${encodeURIComponent(slug)}`;
    };

    card.innerHTML = `
      <div class="card-img">
        ${img ? `<img src="${img}" loading="lazy"/>` : safePreview}
      </div>
      <div class="card-body">
        <div class="card-title">
          ${game.name}
          ${isNew ? `<span class="badge-new">NEW</span>` : ""}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ---------- LOAD LOGIC ---------- */

async function loadGames() {
  setListMessage("Loading…");

  try {
    const results = await fetchGames();
    renderGames(results);
  } catch (err) {
    setListMessage("Error loading games.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("platform")?.addEventListener("change", loadGames);
  $("sort")?.addEventListener("change", loadGames);

  $("search")?.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
      const title = card.innerText.toLowerCase();
      card.style.display = title.includes(term) ? "" : "none";
    });
  });

  loadGames();
});
