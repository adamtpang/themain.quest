// Life-left, computed purely from the birthdate. Works offline, no permissions.
const BIRTH = new Date("2002-07-31T00:00:00");
const LIFE_YEARS = 75;
const MS = 86400000;

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

// Rotating identity, same spirit as the app.
const AFF = [
  "an all-time-great human",
  "a trillionaire (they just haven't paid you yet)",
  "a prolific musician, philosopher, writer, technologist, and businessman",
  "a psychonaut, astronaut, and immortal",
  "a trillionaire of love, with a table that stays full",
];
try {
  const ai = (Number(localStorage.getItem("aff") || "0") + 1) % AFF.length;
  localStorage.setItem("aff", String(ai));
  document.getElementById("aff").textContent = "today you are " + AFF[ai] + ".";
} catch (e) {
  document.getElementById("aff").textContent = "today you are an all-time-great human.";
}

// Live game state, mirrored by the content script on themain.quest.
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
  /* no live state, the glance still works */
}

// The greatest lives ever lived, from the shared roster (mentors.js), picked by
// DATE so the popup, the pinned tab, themain.quest, and the calendar banners
// all name the same mentor on the same day. Cycle for more.
function showMentor(i) {
  const n = ((i % TMQ_MENTORS.length) + TMQ_MENTORS.length) % TMQ_MENTORS.length;
  const m = TMQ_MENTORS[n];
  document.getElementById("mName").textContent = m.name;
  document.getElementById("mTag").textContent = m.tag;
  document.getElementById("mLesson").textContent = m.day;
  document.getElementById("mMove").textContent = m.move;
}

let mi = tmqMentorIndex(new Date());
showMentor(mi);

document.getElementById("nextMentor").addEventListener("click", () => {
  mi = (mi + 1) % TMQ_MENTORS.length;
  showMentor(mi);
});

// The lifeleft move: open the full page, then right-click the tab and pin it.
document.getElementById("openTab").addEventListener("click", () => {
  try {
    chrome.tabs.create({ url: chrome.runtime.getURL("tab.html"), pinned: true });
  } catch (e) {
    window.open("tab.html");
  }
});
