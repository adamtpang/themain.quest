// Life-left, computed purely from the birthdate. No storage, no permissions.
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

// Rotating identity, same list as the app.
const AFF = [
  "ALL-TIME-GREAT HUMAN",
  "TRILLIONAIRE (they just haven't paid me yet)",
  "Prolific all-time-great musician, philosopher, writer, technologist, businessman",
  "Psychonaut, astronaut, immortal",
  "Trillionaire of love (a table that stays full even stripped of the money)",
];
let i = 0;
try {
  i = (Number(localStorage.getItem("aff") || "0") + 1) % AFF.length;
  localStorage.setItem("aff", String(i));
} catch {
  /* ignore */
}
document.getElementById("aff").textContent = AFF[i];
