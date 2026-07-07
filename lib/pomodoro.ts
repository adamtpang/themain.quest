// The Pomodoro quest engine. Pure, testable functions that turn today's quests
// into a capped, main-quest-first quest line. It encodes Adam's life rules:
// the ONE income/visa close ranks first, the Displacement Trap is parked as
// sand, and the day is capped so a wall of tiny tasks cannot masquerade as work.

import { INCOME_LANES, isOneWayDoor } from "./board";
import { Priority, Quest } from "./types";

export const MAX_POMODOROS = 7; // more than this is sand, park it
export const MAX_STONES = 3; // heavy must-happen items per day
export const POMODORO_MIN = 20; // one Pomodoro, the hard ceiling per block
export const WHITESPACE_MIN = 5; // mandatory recovery gap between Pomodoros

export type Tier = "P1" | "P2" | "P3" | "P4";

// Google Calendar colorIds, so the same tier that colors the app can later
// color the real calendar with zero extra mapping.
export const TIER_GCAL_COLOR: Record<Tier, string> = {
  P1: "11", // Tomato, red: important + urgent, the closes
  P2: "6", // Tangerine, orange: important, scheduled/supporting
  P3: "5", // Banana, yellow: build, not urgent
  P4: "8", // Graphite, gray: neither, park or drop
};

const SUPPORT_LANES: Priority[] = ["Life", "Health", "Visa", "Taxes"];

function isUrgent(q: Quest): boolean {
  return q.isBinding || !!q.scheduledTime || q.rungHint === 7;
}

// The priority x urgency tier. P4 is anything that fails the Motion Test or is
// pure Loops meta-work: it never gets scheduled, it gets parked. P1 is "the
// closes": the main quest and any irreversible income, visa, or tax send.
export function tierOf(q: Quest): Tier {
  if (!q.passesMotionTest || q.priority === "Loops") return "P4";
  const income = INCOME_LANES.has(q.priority);
  const door = isOneWayDoor(q.title);
  const isClose =
    q.isBinding ||
    (income && (isUrgent(q) || door)) ||
    (door && (q.priority === "Visa" || q.priority === "Taxes"));
  if (isClose) return "P1";
  if (isUrgent(q) || SUPPORT_LANES.includes(q.priority)) return "P2";
  return "P3";
}

// XP schedule: fuel/admin 100, real progress 200, visa send 300, income send 500.
export function xpFor(q: Quest): number {
  const door = isOneWayDoor(q.title);
  const income = q.isBinding || INCOME_LANES.has(q.priority);
  if (door && income) return 500;
  if (door && q.priority === "Visa") return 300;
  if (q.passesMotionTest && q.priority !== "Loops") return 200;
  return 100;
}

// A stone is a heavy must-happen item: a close or an urgent supporting block.
function isStone(q: Quest, tier: Tier): boolean {
  return tier === "P1" || (tier === "P2" && isUrgent(q));
}

export type PomodoroStep = {
  quest: Quest;
  tier: Tier;
  colorId: string; // the Google Calendar colorId for this tier
  oneWayDoor: boolean; // an irreversible send, the 🚪
  xp: number;
  stone: boolean;
};

export type ParkedItem = { quest: Quest; reason: string };

export type QuestLine = {
  main: PomodoroStep | null; // the main quest, always first
  pomodoros: PomodoroStep[]; // ordered, main first, at most MAX_POMODOROS
  parked: ParkedItem[]; // the overflow and the sand, with reasons
  stones: number; // scheduled stones, at most MAX_STONES
  totalXp: number; // XP available in the scheduled line
  winMove: PomodoroStep | null; // ship this 🚪 send and the day is 10/10
};

const TIER_ORDER: Record<Tier, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };

function toStep(q: Quest): PomodoroStep {
  const tier = tierOf(q);
  return {
    quest: q,
    tier,
    colorId: TIER_GCAL_COLOR[tier],
    oneWayDoor: isOneWayDoor(q.title),
    xp: xpFor(q),
    stone: isStone(q, tier),
  };
}

// The whole pipeline in one pure pass: score, order main-quest-first, enforce
// the stone and Pomodoro caps, and park everything that overflows or is sand.
export function buildQuestLine(quests: Quest[]): QuestLine {
  const open = quests.filter((q) => !q.done);
  const steps = open.map(toStep);
  const parked: ParkedItem[] = [];

  // P4 never schedules: motion is a trap, Loops is meta-work.
  for (const s of steps.filter((s) => s.tier === "P4")) {
    parked.push({
      quest: s.quest,
      reason: s.quest.passesMotionTest ? "Loops meta-work, parked" : "motion, fails the Motion Test",
    });
  }

  const schedulable = steps
    .filter((s) => s.tier !== "P4")
    .sort((a, b) => {
      if (a.quest.isBinding !== b.quest.isBinding) return a.quest.isBinding ? -1 : 1;
      if (TIER_ORDER[a.tier] !== TIER_ORDER[b.tier]) return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      const at = a.quest.scheduledTime ?? "99:99";
      const bt = b.quest.scheduledTime ?? "99:99";
      if (at !== bt) return at.localeCompare(bt);
      return a.quest.createdAt.localeCompare(b.quest.createdAt);
    });

  // Cap the stones first: the fourth heavy item is parked, not crammed in.
  let stones = 0;
  const afterStoneCap: PomodoroStep[] = [];
  for (const s of schedulable) {
    if (s.stone) {
      if (stones >= MAX_STONES) {
        parked.push({ quest: s.quest, reason: "over the 3 stone cap" });
        continue;
      }
      stones += 1;
    }
    afterStoneCap.push(s);
  }

  // Then the Pomodoro cap: everything past 7 is sand.
  const pomodoros = afterStoneCap.slice(0, MAX_POMODOROS);
  for (const s of afterStoneCap.slice(MAX_POMODOROS)) {
    parked.push({ quest: s.quest, reason: "over the 7 Pomodoro cap, sand" });
  }

  const main = pomodoros.find((s) => s.quest.isBinding) ?? pomodoros.find((s) => s.tier === "P1") ?? null;
  const winMove =
    pomodoros.find((s) => s.oneWayDoor && (s.quest.isBinding || INCOME_LANES.has(s.quest.priority))) ??
    pomodoros.find((s) => s.oneWayDoor && s.quest.priority === "Visa") ??
    null;
  const totalXp = pomodoros.reduce((n, s) => n + s.xp, 0);

  return { main, pomodoros, parked, stones, totalXp, winMove };
}

// Clock the line from a start time (minutes-since-midnight), 20 min per block
// plus a mandatory 5 min of whitespace. Pure, so it is trivial to test and to
// feed the calendar writer later.
export function scheduleLine(line: QuestLine, startMinuteOfDay: number): string[] {
  const times: string[] = [];
  let t = startMinuteOfDay;
  for (let i = 0; i < line.pomodoros.length; i++) {
    const h = Math.floor(t / 60) % 24;
    const m = t % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    t += POMODORO_MIN + WHITESPACE_MIN;
  }
  return times;
}
