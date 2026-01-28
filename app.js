/* =========================
   Gamerly - app.js (Vercel)
   ========================= */

/** ---------- Helpers ---------- **/
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLast7DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return { start: formatDate(start), end: formatDate(end) };
}

function $(id) {
  return document.getElementById(id);
}

function getGamesContainer() {
  // Prefer gamesGrid, fall back to gamesContainer
  return $("gamesGrid") || $("gamesContainer");
}

function safeText(v, fallback = "") {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

/** ---------- API ---------- **/
async function fetchGames() {
  const platform = $("platformSelect")?.value || "4"; // 4 = PC on RAWG
  const sort = $("sortSelect")?.value || "-added";

  const { start, end } = getLast7DaysRange();

  const url =
    `/api/games` +
    `?platform=${encodeURIComponent(platform)}` +
    `&sort=${encodeURIComponent(sort)}` +
    `&start=${start}` +
    `&end=${end}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  console.log("API URL:", url);
  console.log("API response:", data);

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/** ---------- Render ---------- **/
function renderGames(data) {
  const container = getGamesContainer();

  if (!container) {
    console.warn(
      "No container found. Add an element with id='gamesGrid' (preferred) or id='gamesContainer'."
    );
    return;
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
        No games returned for this filter/date range.
      </div>
    `;
    return;
  }

  // Simple responsive grid (inline so it works even if CSS isn’t perfect yet)
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  container.style.gap = "14px";
  container.style.alignItems = "stretch";

  for (const game of results) {
    const name = safeText(game?.name, "Untitled");
    const released = safeText(game?.released, "TBA");
    const img = game?.background_image || "";
    const rating = game?.rating ? Number(game.rating).toFixed(1) : "—";
    const genres = Array.isArray(game?.genres)
      ? game.genres.map((g) => g.name).filter(Boolean).slice(0, 3)
      : [];

    const card = document.createElement("div");
    card.style.border = "1px solid #e5e5e5";
    card.style.borderRadius = "12px";
    card.style.overflow = "hidden";
    card.style.background = "#fff";
    card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";

    card.innerHTML = `
      <div style="height: 130px; background: #f3f3f3;">
        ${
          img
            ? `<img src="${img}" alt="${name}" style="width: 100%; height: 130px; object-fit: cover; display:block;" />`
            : `<div style="height:130px; display:flex; align-items:center; justify-content:center; color:#888;">No image</div>`
        }
      </div>
      <div style="padding: 12px;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">
          ${name}
        </div>
        <div style="font-size: 12px; color: #555; margin-bottom: 6px;">
          Released: <strong>${released}</strong>
        </div>
        <div style="font-size: 12px; color: #555; margin-bottom: 8px;">
          Rating: <strong>${rating}</strong>
        </div>
        ${
          genres.length
            ? `<div style="font-size: 12px; color:#666;">
                ${genres.map((g) => `<span style="margin-right:8px;">${g}</span>`).join("")}
               </div>`
            : `<div style="font-size: 12px; color:#777;">No genres listed</div>`
        }
      </div>
    `;

    container.appendChild(card);
  }
}

/** ---------- UX ---------- **/
function setStatus(message) {
  const container = getGamesContainer();
  if (!container) return;
  container.innerHTML = `
    <div style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
      ${message}
    </div>
  `;
}

async function loadAndRender() {
  try {
    setStatus("Loading games…");
    const data = await fetchGames();
    renderGames(data);
  } catch (err) {
    console.error("Load error:", err);
    setStatus(`Error loading games: ${safeText(err?.message, "Unknown error")}`);
  }
}

/** ---------- Wire up controls ---------- **/
function attachListeners() {
  // If these selects exist, reload games when changed
  $("platformSelect")?.addEventListener("change", loadAndRender);
  $("sortSelect")?.addEventListener("change", loadAndRender);
}

/** ---------- Boot ---------- **/
document.addEventListener("DOMContentLoaded", () => {
  attachListeners();
  loadAndRender();
});
