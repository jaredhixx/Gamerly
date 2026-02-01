function applyTimeFilter(games) {
  if (state.timeFilter === "all") return games;

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const DAY = 86400000;

  // OUT NOW — strict past filtering
  if (state.section === "out-now") {
    return games.filter(g => {
      if (!g.releaseDate) return false;
      const t = new Date(g.releaseDate).getTime();

      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        return t >= todayStart - 6 * DAY && t <= todayStart;
      }
      if (state.timeFilter === "month") {
        return t >= todayStart - 29 * DAY && t <= todayStart;
      }
      return true;
    });
  }

  // COMING SOON — keep undated games
  if (state.section === "coming-soon") {
    return games.filter(g => {
      if (!g.releaseDate) return true; // ✅ critical fix

      const t = new Date(g.releaseDate).getTime();

      if (state.timeFilter === "today") {
        return t >= todayStart && t < todayStart + DAY;
      }
      if (state.timeFilter === "week") {
        return t >= todayStart && t <= todayStart + 7 * DAY;
      }
      if (state.timeFilter === "month") {
        return t >= todayStart && t <= todayStart + 31 * DAY;
      }
      return true;
    });
  }

  return games;
}
