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
  const ul = $("game-list");
  if (!ul) {
    console.warn("Missing <ul id='game-list'> in index.html");
    return;
  }
  ul.innerHTML = `<li style="border-bottom:none; color:#555;">${msg}</li>`;
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
  const ul = $("game-list");
  if (!ul) return;

  const results = Array.isArray(data?.results) ? data.results : [];
  ul.innerHTML = "";

  if (results.length === 0) {
    setListMessage("No games returned for this date range / platform.");
    return;
  }

  for (const game of results) {
    const li = document.createElement("li");

    const name = game?.name || "Untitled";
    const released = game?.released || "TBA";
    const img = game?.background_image || "";
    const slug = game?.slug || "";
    const href = slug ? `https://rawg.io/games/${slug}` : "#";

    li.innerHTML = `
      ${
        img
          ? `<img src="${img}" alt="${name}" width="80" height="45" style="object-fit:cover;" />`
          : `<div style="width:80px;height:45px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px;">No image</div>`
      }
      <div>
        <a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a>
        <div style="color:#666; font-size: 0.9rem;">Released: ${released}</div>
      </div>
    `;

    ul.appendChild(li);
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

  loadGames();

});
