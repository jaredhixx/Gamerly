// === Gamerly v4.5 Stable ===
// Fixes image fallback + fade-in animation + keeps all filters working

document.addEventListener("DOMContentLoaded", () => {
  const overlayId = "gamerly-overlay";
  const listEl = document.getElementById("games");
  const statusEl = document.getElementById("status");
  const sortEl = document.getElementById("sort");
  const rangeEl = document.getElementById("range");
  const platformBtns = document.querySelectorAll(".platform-filter");

  let currentSort = "-released";
  let currentRange = "3months";
  let currentPlatform = "";

  // --- 🧠 Gamerly Age Gate Overlay ---
  if (!localStorage.getItem("gamerly_age_verified")) {
    const overlayEl = document.createElement("div");
    overlayEl.id = overlayId;
    overlayEl.innerHTML = `
      <div class="overlay-content">
        <h1 class="gamerly-title fade-in">🎮 Gamerly</h1>
        <p class="tagline">The home for all new and upcoming games.</p>
        <p class="age-warning">This site may contain mature game content.<br>Please confirm your age to continue.</p>
        <button id="ageConfirmBtn" class="enter-btn">Yes, I am 18+</button>
      </div>`;
    document.body.appendChild(overlayEl);

    overlayEl.querySelector("#ageConfirmBtn").addEventListener("click", () => {
      overlayEl.classList.add("fade-out");
      localStorage.setItem("gamerly_age_verified", "true");
      setTimeout(() => overlayEl.remove(), 400);
      fetchGames();
    });
  } else {
    fetchGames();
  }

  // --- Fetch Games ---
  async function fetchGames() {
    if (statusEl) statusEl.textContent = "Loading...";
    if (listEl) listEl.innerHTML = "";

    try {
      let ordering = "-released";
      if (currentSort === "-rating") ordering = "-metacritic";
      else if (currentSort === "released") ordering = "-released";
      else if (currentSort === "name") ordering = "name";

      const url = new URL("/api/games", window.location.origin);
      url.searchParams.set("ordering", ordering);
      url.searchParams.set("page_size", 80);

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.results?.length) {
        listEl.innerHTML = `<p style="text-align:center;color:#888;">No games found.</p>`;
        if (statusEl) statusEl.textContent = "";
        return;
      }

      let games = [...data.results];
      const now = new Date();
      games = games.filter((g) => g.released);

      // --- Filter by date range ---
      if (currentRange === "week") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        games = games.filter((g) => new Date(g.released) >= sevenDaysAgo);
      } else if (currentRange === "3months") {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        games = games.filter((g) => new Date(g.released) >= threeMonthsAgo);
      }

      // --- Platform filter (normalize) ---
      if (currentPlatform) {
        const platformMap = {
          pc: ["pc"],
          playstation: ["playstation", "ps4", "ps5"],
          xbox: ["xbox", "xbox-one", "xbox-series-x"],
          nintendo: ["switch", "nintendo"],
          ios: ["ios"],
          android: ["android"],
        };
        const targets = platformMap[currentPlatform.toLowerCase()] || [];
        games = games.filter((g) =>
          g.parent_platforms?.some((p) =>
            targets.includes(p.platform.slug?.toLowerCase())
          )
        );
      }

      // --- Sorting: fallback to rating if no metacritic ---
      if (currentSort === "-rating") {
        games.sort(
          (a, b) =>
            (b.metacritic || b.rating || 0) - (a.metacritic || a.rating || 0)
        );
      } else if (currentSort === "released") {
        games.sort(
          (a, b) => new Date(b.released) - new Date(a.released)
        );
      }

      renderGameList(games);
      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      console.error("Fetch error:", err);
      if (statusEl) statusEl.textContent = "Error loading games.";
    }
  }

  // --- Render Game Cards ---
  function renderGameList(games) {
    listEl.innerHTML = games.map(renderGameCard).join("");

    // Image fade-in after load
    const imgs = listEl.querySelectorAll(".card-img img");
    imgs.forEach((img) => {
      img.addEventListener("load", () => img.classList.add("loaded"));
      if (img.complete) img.classList.add("loaded");
    });
  }

  // --- Game Card Template ---
  function renderGameCard(game) {
    const released = game.released || "TBA";

    // Smart fallback image logic
    let img =
      game.background_image ||
      (game.short_screenshots && game.short_screenshots[0]?.image) ||
      (game.screenshots && game.screenshots[0]?.image) ||
      "/placeholder.webp";

    if (!img || img.trim() === "" || img.endsWith("null")) {
      img = "/placeholder.webp";
    }

    const hasRealImage =
      img !== "/placeholder.webp" &&
      !img.includes("placeholder") &&
      !img.endsWith("null");

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

    const platformsHTML =
      game.parent_platforms
        ?.map((p) => `<span class="badge">${p.platform.name}</span>`)
        .join(" ") || "";

    return `
      <div class="card" data-slug="${game.slug}" title="${game.name}" onclick="window.location='/game.html?slug=${game.slug}'">
        <div class="card-img">
          <img src="${img}" alt="${game.name}" loading="lazy">
          ${!hasRealImage ? `<div class="no-image-overlay">No Image Available</div>` : ""}
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

  // --- Event Listeners ---
  sortEl?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    fetchGames();
  });

  rangeEl?.addEventListener("change", (e) => {
    currentRange = e.target.value;
    fetchGames();
  });

  platformBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      platformBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPlatform = btn.dataset.platform || "";
      fetchGames();
    });
  });
});
