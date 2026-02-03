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
let viewMode = "list";

/* =========================
   HELPERS
========================= */
function slugify(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseDetailsIdFromPath(pathname) {
  const clean = (pathname || "").split("?")[0].split("#")[0];
  const m = clean.match(/^\/game\/(\d+)(?:-.*)?$/);
  return m ? m[1] : null;
}

function setMetaTitle(title) {
  document.title = title;
}

function setMetaDescription(desc) {
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", desc);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActive(button) {
  const group = button.parentElement;
  if (!group) return;
  group.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
}

/* SAFE date normalizer: accepts string OR Date */
function normalizeDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d)) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* =========================
   STORE CTA LOGIC (LOCKED)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;
  const name = encodeURIComponent(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows") || p.includes("pc"))
    return { label: "View on Steam →", url: `https://store.steampowered.com/search/?term=${name}&category1=998`, platform: "pc", store: "steam" };
  if (p.includes("playstation"))
    return { label: "View on PlayStation →", url: `https://store.playstation.com/search/${name}`, platform: "playstation", store: "playstation" };
  if (p.includes("xbox"))
    return { label: "View on Xbox →", url: `https://www.xbox.com/en-US/Search?q=${name}`, platform: "xbox", store: "xbox" };
  if (p.includes("nintendo"))
    return { label: "View on Nintendo →", url: `https://www.nintendo.com/us/search/#q=${name}`, platform: "nintendo", store: "nintendo" };
  if (p.includes("ios"))
    return { label: "View on App Store →", url: `https://www.apple.com/app-store/`, platform: "ios", store: "apple" };
  if (p.includes("android"))
    return { label: "View on Google Play →", url: `https://play.google.com/store/search?q=${name}&c=apps`, platform: "android", store: "google_play" };

  return { label: "View on Store →", url: `https://www.google.com/search?q=${name}+game`, platform: "unknown", store: "generic" };
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

    const id = parseDetailsIdFromPath(window.location.pathname);
    if (id) {
      const g = allGames.find(x => String(x.id) === String(id));
      if (g) {
        renderDetails(g, true);
        return;
      }
      history.replaceState({}, "", "/");
    }

    applyFilters(true);
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Failed to load games.";
  } finally {
    loading.style.display = "none";
  }
}

/* =========================
   FILTER PIPELINE (FINAL)
========================= */
function applyFilters(reset = false) {
  if (reset) visibleCount = 0;
  viewMode = "list";

  setMetaTitle("Gamerly — Daily Game Releases, Curated");
  setMetaDescription("Track new and upcoming game releases across PC, console, and mobile. Updated daily.");

  const today = normalizeDate(new Date());
  const now = today.getTime();
  const DAY = 86400000;

  const outNow = allGames.filter(g => {
    const d = normalizeDate(g.releaseDate);
    return d && d.getTime() <= now;
  });

  const comingSoon = allGames.filter(g => {
    const d = normalizeDate(g.releaseDate);
    return d && d.getTime() > now;
  });

  updateSectionCounts(outNow.length, comingSoon.length);

  let list = activeSection === "out" ? outNow : comingSoon;

  if (activeTime === "week" || activeTime === "month") {
    const rangeMs = (activeTime === "week" ? 7 : 30) * DAY;

    list = list.filter(g => {
      const d = normalizeDate(g.releaseDate);
      if (!d) return false;
      const t = d.getTime();
      return activeSection === "out"
        ? t >= now - rangeMs && t <= now
        : t > now && t <= now + rangeMs;
    });
  }

  if (activePlatform !== "all") {
    const key = activePlatform.toLowerCase();
    list = list.filter(g =>
      Array.isArray(g.platforms) &&
      g.platforms.some(p => p.toLowerCase().includes(key))
    );
  }

  renderList(list);
}

/* =========================
   INIT
========================= */
loadGames();
