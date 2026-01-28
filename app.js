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


async function fetchGames() {
  const platform = $("platform")?.value || "4";
  const sort = $("sort")?.value || "-added";
  const { startStr, endStr } = getDateRange();


  const url =
  `/api/games?platform=${encodeURIComponent(platform)}` +
  `&sort=${encodeURIComponent(sort)}` +
  `&start=${encodeURIComponent(startStr)}` +
  `&end=${encodeURIComponent(endStr)}`;


  console.log("Fetching:", url);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  console.log("Response:", data);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  return data;
}

function renderGames(data) {
  const grid = $("game-list");
  if (!grid) return;

  const results = Array.isArray(data?.results) ? data.results : [];
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
    const href = slug ? `https://rawg.io/games/${slug}` : "#";

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

    card.innerHTML = `
      <div class="card-img">
        ${
          img
            ? `<img src="${img}" alt="${name}" loading="lazy" />`
            : ""
        }
      </div>

      <div class="card-body">
        <div class="card-title">
          <a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a>
        </div>

        <div class="card-meta">Released: ${released}</div>

        ${
          badgesHtml
            ? `<div class="badges">${badgesHtml}</div>`
            : ""
        }
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

