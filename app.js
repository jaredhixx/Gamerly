// === Gamerly v5.0 — IGDB Integration Build ===
// Fetches curated data directly from IGDB (Twitch API)
// Retains all existing filters, card layout, and overlay logic

document.addEventListener("DOMContentLoaded", () => {
  const overlayId = "gamerly-overlay";
  const listEl = document.getElementById("games");
  const statusEl = document.getElementById("status");
  const sortEl = document.getElementById("sort");
  const rangeEl = document.getElementById("range");
  const platformBtns = document.querySelectorAll(".platform-filter");
  const searchEl = document.getElementById("search");

  let currentSort = "-released";
  let currentRange = "3months";
  let currentPlatform = "";
  let allGames = [];

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

  // === Fetch Games from IGDB (via Vercel API route) ===
  async function fetchGames() {
    if (statusEl) statusEl.textContent = "Loading...";
    if (listEl) listEl.innerHTML = "";

    try {
      const url = new URL("/api/igdb", window.location.origin);

      // Sorting
      if (currentSort === "-rating") url.searchParams.set("sort", "total_rating desc");
      else url.searchParams.set("sort", "first_release_date desc");

      // Search
      if (searchEl && searchEl.value.trim()) url.searchParams.set("search", searchEl.value.trim());

      // Fetch data
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!Array.isArray(data) || !data.length) {
        listEl.innerHTML = `<p style="text-align:center;color:#888;">No games found.</p>`;
        if (statusEl) statusEl.textContent = "";
        return;
      }

      // Transform IGDB response into RAWG-like objects for compatibility
      allGames = data.map((g) => ({
        slug: g.id,
        name: g.name,
        released: g.first_release_date
          ? new Date(g.first_release_date * 1000).toISOString().split("T")[0]
          : "TBA",
        background_image: g.cover
          ? `https:${g.cover.url.replace("t_thumb", "t_1080p")}`
          : g.screenshots?.[0]
          ? `https://images.igdb.com/igdb/image/upload/t_1080p/${g.screenshots[0].image_id}.jpg`
          : "/placeholder.webp",
        screenshots: g.screenshots?.map(
          (s) => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`
        ),
        metacritic: g.total_rating ? Math.round(g.total_rating) : null,
        platforms: g.platforms?.map((p) => p.name) || [],
        genres: g.genres?.map((gn) => gn.name) || [],
      }));

      // Filter and render
      renderList();
      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      console.error("IGDB fetch error:", err);
      if (statusEl) statusEl.textContent = "Error loading games.";
    }
  }

  // === Filtering + Rendering ===
  function renderList() {
    let visible = [...allGames];

    // Range filter (date)
    const now = new Date();
    if (currentRange === "week") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      visible = visible.filter((g) => new Date(g.released) >= sevenDaysAgo);
    } else if (currentRange === "3months") {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      visible = visible.filter((g) => new Date(g.released) >= threeMonthsAgo);
    }

    // Platform filter
    if (currentPlatform) {
      visible = visible.filter((g) =>
        g.platforms.some((p) =>
          p.toLowerCase().includes(currentPlatform.toLowerCase())
        )
      );
    }

    // Search filter
    if (searchEl && searchEl.value.trim()) {
      const q = searchEl.value.trim().toLowerCase();
      visible = visible.filter((g) => g.name.toLowerCase().includes(q));
    }

    // Sort again (client-side if needed)
    if (currentSort === "-rating") {
      visible.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
    } else if (currentSort === "released") {
      visible.sort((a, b) => new Date(b.released) - new Date(a.released));
    }

    // Render
    listEl.innerHTML = visible.map(renderGameCard).join("");

    // Fade-in loaded images
    const imgs = listEl.querySelectorAll(".card-img img");
    imgs.forEach((img) => {
      img.addEventListener("load", () => img.classList.add("loaded"));
      if (img.complete) img.classList.add("loaded");
    });
  }

  // === Game Card Template ===
  function renderGameCard(game) {
    const released = game.released || "TBA";
    const img = game.background_image || "/placeholder.webp";

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
      game.platforms?.map((p) => `<span class="badge">${p}</span>`).join(" ") || "";

    return `
      <div class="card" data-slug="${game.slug}" title="${game.name}"
           onclick="window.location='/game.html?slug=${game.slug}'">
        <div class="card-img">
          <img src="${img}" alt="${game.name}" loading="lazy" onerror="this.src='/placeholder.webp'">
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

  // === Event Listeners ===
  sortEl?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderList();
  });

  rangeEl?.addEventListener("change", (e) => {
    currentRange = e.target.value;
    renderList();
  });

  platformBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      platformBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPlatform = btn.dataset.platform || "";
      renderList();
    });
  });

  searchEl?.addEventListener("input", () => renderList());
});
