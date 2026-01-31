// app.js — Gamerly v4.2 Final
// Fixes popup event binding, ensures games load properly, keeps all filters + visuals

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const listEl = document.getElementById("games");
  const statusEl = document.getElementById("status");
  const sortEl = document.getElementById("sort");
  const rangeEl = document.getElementById("range");
  const platformBtns = document.querySelectorAll(".platform-filter");

  let currentSort = "-released";
  let currentRange = "3months";
  let currentPlatform = "";

  // 🧠 --- Build Gamerly Overlay Dynamically ---
  if (overlay) {
    overlay.innerHTML = `
      <div class="overlay-content">
        <h1 class="gamerly-title fade-in">🎮 Gamerly</h1>
        <p class="tagline">The home for all new and upcoming games.</p>
        <p class="age-warning">This site may contain mature game content.<br>Please confirm your age to continue.</p>
        <button id="confirm-age-btn" class="enter-btn">Yes, I am 18+</button>
      </div>
    `;
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
  }

  // ✅ --- Wait for Button then Handle Click ---
  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "confirm-age-btn") {
      const overlay = document.getElementById("overlay");
      if (overlay) {
        overlay.classList.add("fade-out");
        setTimeout(() => {
          overlay.remove();
          fetchGames(); // Only run once overlay is gone
        }, 400);
      }
    }
  });

  // 🧩 --- Fetch Games ---
  async function fetchGames() {
    if (statusEl) statusEl.textContent = "Loading...";
    if (listEl) listEl.innerHTML = "";

    try {
      const sortValue =
        currentSort === "-rating"
          ? "-metacritic"
          : currentSort === "released"
          ? "-released"
          : currentSort;

      const url = new URL("/api/games", window.location.origin);
      url.searchParams.set("ordering", sortValue);
      url.searchParams.set("range", currentRange);
      url.searchParams.set("page_size", 80);

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.results?.length) {
        listEl.innerHTML = `<p style="text-align:center;color:#888;">No games found.</p>`;
        if (statusEl) statusEl.textContent = "";
        return;
      }

      const games = currentPlatform
        ? data.results.filter((g) =>
            g.parent_platforms?.some(
              (p) =>
                p.platform.name.toLowerCase() ===
                currentPlatform.toLowerCase()
            )
          )
        : data.results;

      renderGameList(games);
      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      console.error("Fetch error:", err);
      if (statusEl) statusEl.textContent = "Error loading games.";
    }
  }

  // 🎮 --- Render Game Cards ---
  function renderGameList(games) {
    const html = games.map((game) => renderGameCard(game)).join("");
    listEl.innerHTML = html;

    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", showPreview);
      card.addEventListener("mouseleave", hidePreview);
      card.addEventListener("click", () => {
        const slug = card.dataset.slug;
        if (slug) window.location.href = `/game.html?slug=${slug}`;
      });
    });
  }

  // 🧩 --- Game Card Template ---
  function renderGameCard(game) {
    const released = game.released || "TBA";

    // Smart fallback image logic
    const img =
      game.background_image ||
      (game.short_screenshots && game.short_screenshots[0]?.image) ||
      (game.screenshots && game.screenshots[0]?.image) ||
      "/placeholder.webp";

    const platformsHTML =
      game.parent_platforms
        ?.map((p) => `<span class="badge">${p.platform.name}</span>`)
        .join(" ") || "";

    const meta =
      game.metacritic != null
        ? `<span class="badge-meta ${
            game.metacritic >= 75
              ? "meta-good"
              : game.metacritic >= 50
              ? "meta-mid"
              : "meta-bad"
          }">${game.metacritic}</span>`
        : `<span class="badge-meta meta-na">N/A</span>`;

    return `
      <div class="card" data-slug="${game.slug}" title="${game.name}">
        <div class="card-img">
          <img src="${img}" alt="${game.name}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-title">${game.name}</div>
          <div class="meta-row">
            ${meta}<span class="release-date">Released: ${released}</span>
          </div>
          <div class="badges">${platformsHTML}</div>
        </div>
      </div>`;
  }

  // 💫 --- Hover Preview Effects ---
  let previewTimer;
  function showPreview(e) {
    const card = e.currentTarget;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => card.classList.add("hover"), 200);
  }

  function hidePreview(e) {
    const card = e.currentTarget;
    clearTimeout(previewTimer);
    card.classList.remove("hover");
  }

  // 🔘 --- Event Listeners for Sort, Range, Platform ---
  if (sortEl) {
    sortEl.addEventListener("change", (e) => {
      currentSort = e.target.value;
      fetchGames();
    });
  }

  if (rangeEl) {
    rangeEl.addEventListener("change", (e) => {
      currentRange = e.target.value;
      fetchGames();
    });
  }

  platformBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      platformBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPlatform = btn.dataset.platform || "";
      fetchGames();
    });
  });
});
