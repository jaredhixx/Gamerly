let currentRange = "upcoming";

/* =========================
   Gamerly - app.js
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
  if (!ul) return;
  ul.innerHTML = `<li style="border-bottom:none; color:#555;">${msg}</li>`;
}

async function fetchGames() {
  const platform = $("platform")?.value || "4"; // Default PC
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

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
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
    const href = `/game.html?slug=${slug}`;

    const metacritic =
      typeof game?.metacritic === "number" ? game.metacritic : null;

    // Platform and genre badges
    const platforms = Array.isArray(game?.parent_platforms)
      ? game.parent_platforms.map(p => p.platform?.name).filter(Boolean)
      : [];

    const badgesHtml = platforms
      .slice(0, 5)
      .map(p => `<span class="badge">${p}</span>`)
      .join("");

    // Create card container
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = href;
    });

    card.innerHTML = `
      <div class="card-img">
        ${
          img
            ? `<img src="${img}" alt="${name}" loading="lazy" style="width:100%;height:160px;object-fit:cover;border-top-left-radius:12px;border-top-right-radius:12px;" />`
            : `<div style="width:100%;height:160px;background:#e5e7eb;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;color:#888;">No image</div>`
        }
      </div>

      <div class="card-body" style="padding:10px 12px;">
        <div class="card-title" style="font-weight:700;font-size:1rem;margin-bottom:4px;color:#2563eb;">
          ${name}
        </div>

        ${
          metacritic
            ? `<div style="
                  display:inline-block;
                  background:${metacritic >= 75 ? '#16a34a' : metacritic >= 50 ? '#facc15' : '#dc2626'};
                  color:white;
                  font-weight:700;
                  border-radius:6px;
                  padding:2px 6px;
                  font-size:0.75rem;
                  margin-bottom:6px;">
                  ${metacritic}
               </div>`
            : `<div style="
                  display:inline-block;
                  background:#e5e7eb;
                  color:#6b7280;
                  font-weight:600;
                  border-radius:6px;
                  padding:2px 6px;
                  font-size:0.75rem;
                  margin-bottom:6px;">
                  N/A
               </div>`
        }

        <div class="card-meta" style="font-size:0.85rem;color:#6b7280;">Released: ${released}</div>
        ${badgesHtml ? `<div class="badges" style="margin-top:6px;">${badgesHtml}</div>` : ""}
      </div>
    `;

    li.appendChild(card);
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

// Time filter buttons
document.querySelectorAll("#time-filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentRange = btn.dataset.range;
    loadGames();
  });
});

loadGames();
