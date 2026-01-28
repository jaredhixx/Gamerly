<script>
  const API_KEY = "ac669b002b534781818c488babf5aae4";

const platformSelect = document.getElementById("platform");
const sortSelect = document.getElementById("sort");
const list = document.getElementById("game-list");

  function isKidSafe(game) {
  // 1) ESRB rating check (most reliable)
  const esrb = game.esrb_rating && game.esrb_rating.name
    ? game.esrb_rating.name.toLowerCase()
    : null;

  // Block explicit ratings
  if (esrb === "mature" || esrb === "adults only") {
    return false;
  }
// BALANCED MODE: if no ESRB rating, allow it,
// but keyword filter below still protects you
if (!esrb) {
  // do nothing here (continue)
}


  // 2) Keyword safety net (extra protection)
  const tags = game.tags ? game.tags.map(t => t.name) : [];
  const genres = game.genres ? game.genres.map(g => g.name) : [];

  const textBlob = (
  game.name + " " +
  tags.join(" ") + " " +
  genres.join(" ")
).toLowerCase();


  const blockedKeywords = [
    "hentai",
    "nudity",
    "sexual",
    "sex",
    "porn",
    "erotic",
    "nsfw",
    "adult"
  ];

  for (const word of blockedKeywords) {
    if (textBlob.includes(word)) {
      return false;
    }
  }

  return true;
}


  function formatDate(dateObj) {
    return dateObj.toISOString().split("T")[0];
  }

  function getDateRangeLast7Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    return {
      startStr: formatDate(start),
      endStr: formatDate(end),
    };
  }

  function clearList() {
    list.innerHTML = "";
  }

  function showMessage(text) {
    clearList();
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  }

  function renderGames(games) {
  clearList();

  games.forEach((game) => {
    // Skip games with no release date (quality filter)
    if (!game.released) return;

    const li = document.createElement("li");

    // Thumbnail (if available)
    if (game.background_image) {
      const img = document.createElement("img");
      img.src = game.background_image;
      img.alt = game.name;
      img.width = 80; // simple, no CSS needed
      img.loading = "lazy"; // helps performance
      li.appendChild(img);
    }

    // Link title
    const a = document.createElement("a");
    a.textContent = game.name;
    a.href = game.slug ? `https://rawg.io/games/${game.slug}` : "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    // Release date
    const meta = document.createElement("span");
    meta.textContent = ` — ${game.released}`;

    // Put title/date after image
    li.appendChild(a);
    li.appendChild(meta);

    list.appendChild(li);
  });
}





  function fetchAndRenderGames() {
    const platformId = platformSelect.value;
    const { startStr, endStr } = getDateRangeLast7Days();

    const sortValue = sortSelect.value;

const url = `https://api.rawg.io/api/games?dates=${startStr},${endStr}&platforms=${platformId}&ordering=${sortValue}&page_size=50&key=${API_KEY}`;



    showMessage("Loading...");

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
  then((data) => {
  // If RAWG returns an error message, show it clearly
  if (data.detail) {
    showMessage(`RAWG error: ${data.detail}`);
    return;
  }

  if (!data.results || data.results.length === 0) {
    showMessage("No releases found in the last 7 days.");
    return;
  }

  const safeResults = data.results.filter(isKidSafe);

  if (safeResults.length === 0) {
    showMessage("No kid-safe releases found in the last 7 days. Try a different platform.");
    return;
  }

  renderGames(safeResults);

  // If renderGames filters out everything (ex: missing released date)
  if (list.children.length === 0) {
    showMessage("Nothing to display (all results were missing release dates). Try a different platform.");
  }
})


      .catch((error) => {
        console.error("Fetch error:", error);
        showMessage("Error loading games. Check console.");
      });
  }

  // 1) Load games once when the page first opens
  fetchAndRenderGames();

  // 2) Re-load games whenever the dropdown changes
  platformSelect.addEventListener("change", () => {
    fetchAndRenderGames();
  });
  sortSelect.addEventListener("change", () => {
  fetchAndRenderGames();
});

</script>
