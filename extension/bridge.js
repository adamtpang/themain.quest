// Runs on themain.quest and mirrors your live game state into chrome.storage,
// so the command center popup can show your real main quest, level, streak, and
// boss even when the tab is closed. It only reads, never writes to the game, and
// it is wrapped so it can never break the page.
(function () {
  function num(v) {
    return typeof v === "number" && isFinite(v) ? v : 0;
  }
  // Matches the app's curve: xpForLevel(L) = 50 * L * (L - 1).
  function levelForXp(xp) {
    let L = 1;
    while (50 * (L + 1) * L <= xp) L += 1;
    return L;
  }
  function refresh() {
    try {
      const quests = JSON.parse(localStorage.getItem("tmq.quests") || "[]");
      const progress = JSON.parse(localStorage.getItem("tmq.progress") || "{}");
      const streak = JSON.parse(localStorage.getItem("tmq.streak") || "{}");
      const match = JSON.parse(localStorage.getItem("tmq.match") || "{}");
      const binding = Array.isArray(quests)
        ? quests.find((q) => q && q.isBinding && !q.done)
        : null;
      const xp = num(progress.xp);
      const snapshot = {
        mainQuest: binding ? String(binding.title || "").slice(0, 90) : null,
        xp: xp,
        level: levelForXp(xp),
        streak: num(streak.current),
        bossDone: num(match.bossHpDone),
        bossMax: num(match.bossHpMax) || 6,
        updatedAt: new Date().toISOString(),
      };
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ "tmq.snapshot": snapshot });
      }
    } catch (e) {
      /* never break the page */
    }
  }
  refresh();
  // The app writes localStorage after React hydrates, so refresh a few times and
  // whenever the tab regains focus.
  setInterval(refresh, 8000);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) refresh();
  });
})();
