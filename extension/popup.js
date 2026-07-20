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

// The greatest lives ever lived. One mentor per open, or cycle for more. Each is
// the transferable principle behind their success, plus a move you can run today.
const MENTORS = [
  { name: "John D. Rockefeller", tag: "wealth, oil, compounding", lesson: "Measure everything, reinvest the surplus, and stay calm while the market panics. A fortune is patience plus arithmetic.", move: "log your income move before you touch anything else." },
  { name: "Marcus Aurelius", tag: "rome, stoicism", lesson: "You do not control events, only your response to them. The obstacle in the way becomes the way.", move: "step one inch into the thing you are avoiding." },
  { name: "Leonardo da Vinci", tag: "art, science, everything", lesson: "Relentless curiosity across every field compounds into genius. Carry a notebook, question all of it.", move: "write down the question you cannot stop thinking about." },
  { name: "Benjamin Franklin", tag: "founding, self-making", lesson: "Score your virtues nightly. Steady, tracked improvement beats heroic bursts of willpower.", move: "pick one virtue and grade yourself on it tonight." },
  { name: "Warren Buffett", tag: "investing, patience", lesson: "Stay inside your circle of competence and say no to almost everything. Then bet big on the rare yes.", move: "kill one commitment that is outside your circle." },
  { name: "Elon Musk", tag: "engineering, scale", lesson: "Reason from first principles. Delete the requirement before you optimize it, then simplify and accelerate.", move: "delete one task that should not exist." },
  { name: "Marie Curie", tag: "science, firsts", lesson: "Obsessive focus on work that matters, and the nerve to be first. Comfort is not the goal, the discovery is.", move: "give your hardest task 25 unbroken minutes." },
  { name: "Nelson Mandela", tag: "freedom, endurance", lesson: "Play the decades-long game. Forgiveness is strategy, not weakness. Character outlasts every circumstance.", move: "choose the patient move over the reactive one." },
  { name: "Steve Jobs", tag: "products, taste", lesson: "Focus is saying no to a thousand good ideas. Taste and simplicity are the real edge.", move: "cut one feature, one meeting, one yes." },
  { name: "Miyamoto Musashi", tag: "the sword, mastery", lesson: "Master one path through ceaseless practice. A thousand days to learn it, ten thousand to refine it.", move: "give your craft one deep, deliberate block." },
  { name: "Charlie Munger", tag: "mental models", lesson: "Invert, always invert. It is often enough just to avoid the standard ways of failing.", move: "ask what would guarantee failure today, then dodge it." },
  { name: "Viktor Frankl", tag: "meaning, survival", lesson: "When you cannot change the situation, you change yourself. Meaning is the deepest fuel there is.", move: "name who your hard task today is really for." },
  { name: "Seneca", tag: "stoic, time", lesson: "Time is the one thing you can never earn back. Guard it like your life, because it is your life.", move: "cut one time-leak before noon." },
  { name: "Bruce Lee", tag: "martial art, self-expression", lesson: "Absorb what is useful, discard what is not, and add what is uniquely your own. Be water.", move: "adapt one method to fit you, and drop the dogma." },
  { name: "Michelangelo", tag: "sculpture, craft", lesson: "The statue already lives inside the marble. Your only job is to remove everything that is not it.", move: "chip away one thing hiding your main quest." },
  { name: "Aristotle", tag: "philosophy, excellence", lesson: "Excellence is a habit, not a single act. You become what you repeatedly do.", move: "repeat the keystone habit that makes the rest easy." },
  { name: "Confucius", tag: "wisdom, cultivation", lesson: "The one who moves a mountain begins by carrying away the small stones. Cultivate yourself daily.", move: "carry away one small stone of the big thing." },
  { name: "Harriet Tubman", tag: "courage, freedom", lesson: "Once you decide on freedom, you keep going. You do not stop at the first fence, or the tenth.", move: "take the next step even scared, then the next." },
];

function showMentor(i) {
  const n = ((i % MENTORS.length) + MENTORS.length) % MENTORS.length;
  const m = MENTORS[n];
  document.getElementById("mName").textContent = m.name;
  document.getElementById("mTag").textContent = m.tag;
  document.getElementById("mLesson").textContent = m.lesson;
  document.getElementById("mMove").textContent = m.move;
}

let mi = 0;
try {
  mi = (Number(localStorage.getItem("mentor") || "-1") + 1) % MENTORS.length;
  localStorage.setItem("mentor", String(mi));
} catch (e) {
  mi = 0;
}
showMentor(mi);

document.getElementById("nextMentor").addEventListener("click", () => {
  mi = (mi + 1) % MENTORS.length;
  try {
    localStorage.setItem("mentor", String(mi));
  } catch (e) {
    /* ignore */
  }
  showMentor(mi);
});
