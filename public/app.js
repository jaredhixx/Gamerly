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

/* =========================
   STORE CTA LOGIC (LOCKED, SAFE)
========================= */
function getPrimaryStore(game) {
  if (!Array.isArray(game.platforms)) return null;
  const name = encodeURIComponent(game.name);
  const p = game.platforms.join(" ").toLowerCase();

  if (p.includes("windows") || p.includes("pc"))
    return {
      label: "View on Steam →",
      url: `https://store.steampowered.com/search/?term=${name}&category1=998`,
      platform: "pc",
      store: "steam"
    };

  if (p.includes("playstation"))
    return {
      label: "View on PlayStation →",
      url: `https://store.playstation.com/search/${name}`,
      platform: "playstation",
      store: "playstation"
    };

  if (p.includes("xbox"))
    return {
      label: "View on Xbox →",
      url: `https://www.xbox.com/en-US/Search?q=${name}`,
      platform: "xbox",
      store: "xbox"
    };

  if (p.includes("nintendo"))
    return {
      label: "View on Nintendo →",
      url: `https://www.nintendo.com/us/search/#q=${name}`,
      platform: "nintendo",
      store: "nintendo"
    };

  if (p.includes("ios"))
    return {
      label: "View on App Store →",
      url: `https://www.apple.com/app-store/`,
      platform: "ios",
      store: "apple"
    };

  if (p.includes("android"))
    return {
      label: "View on Google Play →",
      url: `https://play.google.com/store/search?q=${name}&c=apps`,
      platform: "android",
      store: "google_play"
    };

  return {
    label: "View on Store →",
    url: `https://www.google.com/search?q=${name}+game`,
    platform: "unknown",
    store: "generic"
  };
}

/* =========================
   FETCH / FILTERS / RENDER
   (UNCHANGED BELOW)
========================= */

/* ——— EVERYTHING BELOW THIS LINE REMAINS IDENTICAL ——— */

