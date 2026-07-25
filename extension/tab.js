// The pinned tab: a lifeleft-style page that stays open all day. Everything
// recomputes hourly so a tab pinned for a week never shows a stale clock or
// yesterday's mentor.
const BIRTH = new Date("2002-07-31T00:00:00");
const LIFE_YEARS = 75;
const MS = 86400000;

function paintClock() {
  const now = new Date();
  const death = new Date(BIRTH);
  death.setFullYear(death.getFullYear() + LIFE_YEARS);

  const total = Math.max(1, Math.round((death - BIRTH) / MS));
  const lived = Math.max(0, Math.floor((now - BIRTH) / MS));
  const left = Math.max(0, Math.round((death - now) / MS));
  const pct = Math.min(100, Math.max(0, (lived / total) * 100));

  document.getElementById("daysLeft").textContent = left.toLocaleString();
  document.getElementById("fill").style.width = pct + "%";
  document.getElementById("spent").textContent =
    pct.toFixed(1) + "% of the game spent · " + lived.toLocaleString() + " lived";
}

function paintMentor() {
  const m = TMQ_MENTORS[tmqMentorIndex(new Date())];
  document.getElementById("mName").textContent = m.name;
  document.getElementById("mTag").textContent = m.tag;
  document.getElementById("mDay").textContent = m.day;
  document.getElementById("mMove").textContent = m.move;
}

// Live game state, mirrored by the content script on themain.quest.
function paintSnapshot() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("tmq.snapshot", (data) => {
        const s = data && data["tmq.snapshot"];
        if (!s) return;
        if (typeof s.level === "number") document.getElementById("lvl").textContent = s.level;
        if (typeof s.streak === "number") document.getElementById("streak").textContent = s.streak;
        if (typeof s.bossDone === "number") {
          const max = s.bossMax || 6;
          document.getElementById("boss").textContent = Math.max(0, max - s.bossDone) + "/" + max;
        }
        if (s.mainQuest) document.getElementById("mainQuest").textContent = s.mainQuest;
      });
    }
  } catch (e) {
    /* the glance still works without live state */
  }
}

function paintAll() {
  paintClock();
  paintMentor();
  paintSnapshot();
}

paintAll();
setInterval(paintAll, 60 * 60 * 1000); // hourly, so the pinned tab stays true
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) paintAll();
});
