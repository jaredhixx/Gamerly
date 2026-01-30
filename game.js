async function loadGame() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    document.getElementById("status").textContent = "Missing slug in URL.";
    return;
  }

  try {
    const res = await fetch(`/api/game?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error("Error loading game data.");

    const name = data?.name || "Untitled";
    const released = data?.released || "TBA";
    const img = data?.background_image || "";
    const website = data?.website || "";
    const description = data?.description_raw || "No description available.";
    const clip = data?.clip?.clip || null;
    const screenshots = data?.screenshots || data?.short_screenshots || [];
    const stores = Array.isArray(data?.stores) ? data.stores : [];

    const platforms = Array.isArray(data?.platforms)
      ? data.platforms.map((p) => p?.platform?.name).filter(Boolean)
      : [];
    const genres = Array.isArray(data?.genres)
      ? data.genres.map((g) => g?.name).filter(Boolean)
      : [];

    const badges = [...platforms, ...genres]
      .slice(0, 16)
      .map((x) => `<span class="badge">${x}</span>`)
      .join("");

    let metacritic = data?.metacritic ?? null;
    if (!metacritic && Array.isArray(data.metacritic_platforms)) {
      const allScores = data.metacritic_platforms
        .map((p) => p.metascore)
        .filter((s) => typeof s === "number");
      if (allScores.length)
        metacritic = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    }

    const metaColor =
      metacritic >= 75 ? "#16a34a" : metacritic >= 50 ? "#facc15" : "#dc2626";

    const storeLinks = stores
      .map(
        (s) => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="store-btn">
          Buy on ${s.store?.name || "Store"}
        </a>`
      )
      .join("");

    const trailer = clip
      ? `
        <div class="trailer-container">
          <video id="gameTrailer" autoplay muted loop playsinline>
            <source src="${clip}" type="video/mp4" />
          </video>
          <button id="soundToggle" class="sound-btn">🔇</button>
        </div>`
      : "";

    const screenshotRow =
      screenshots.length > 0
        ? `
        <div class="screenshot-row">
          ${screenshots
            .map(
              (s) =>
                `<img src="${s.image}" alt="Screenshot" loading="lazy" class="screenshot-thumb" />`
            )
            .join("")}
        </div>`
        : "";

    const content = `
      <div class="hero-banner" style="background-image:url('${img}')">
        <div class="overlay-gradient"></div>
        <div class="hero-content">
          <h1>${name}</h1>
          <div class="meta">Released: ${released}</div>
          <div class="score" style="background:${metaColor}">
            ${metacritic ? `Metacritic: ${metacritic}` : "No Score"}
          </div>
          <div class="badges">${badges}</div>
          <div class="links">
            ${website ? `<a href="${website}" target="_blank" class="store-btn">Official Site</a>` : ""}
            ${storeLinks}
          </div>
        </div>
      </div>

      ${trailer}
      ${screenshotRow}

      <div class="panel">
        <h2>About</h2>
        <p>${description}</p>
      </div>
    `;

    const container = document.getElementById("content");
    container.innerHTML = content;
    document.getElementById("status").remove();
    container.style.display = "block";

    // --- Sound toggle ---
    const videoEl = document.getElementById("gameTrailer");
    const soundBtn = document.getElementById("soundToggle");
    if (videoEl && soundBtn) {
      soundBtn.addEventListener("click", () => {
        videoEl.muted = !videoEl.muted;
        soundBtn.textContent = videoEl.muted ? "🔇" : "🔊";
      });
    }

    // --- Auto-scroll horizontal screenshots ---
    const row = document.querySelector(".screenshot-row");
    if (row) {
      let scrollSpeed = 1.2;
      function autoScroll() {
        if (row.scrollLeft + row.clientWidth >= row.scrollWidth) row.scrollLeft = 0;
        else row.scrollLeft += scrollSpeed;
        requestAnimationFrame(autoScroll);
      }
      autoScroll();
    }
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Error loading game data.";
  }
}

loadGame();
