import { PRIORITY_ORDER, Priority, Quest } from "./types";

const priorityRank: Record<Priority, number> = PRIORITY_ORDER.reduce(
  (acc, p, i) => {
    acc[p] = i;
    return acc;
  },
  {} as Record<Priority, number>
);

// Sort: real quests first (by priority order, Loops last), then parked motion.
// Done quests sink within their group.
export function sortQuests(quests: Quest[]): Quest[] {
  return [...quests].sort((a, b) => {
    if (a.passesMotionTest !== b.passesMotionTest) {
      return a.passesMotionTest ? -1 : 1; // real above motion
    }
    if (a.done !== b.done) return a.done ? 1 : -1; // open above done
    const pr = priorityRank[a.priority] - priorityRank[b.priority];
    if (pr !== 0) return pr;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

// The income lanes. The app's #1 job is to point Adam at the highest-leverage
// income close, so the boss recommendation puts these first.
export const INCOME_LANES = new Set<Priority>(["Leverage", "Marketplace"]);

// A one-way door: an irreversible send. Shipping one is what wins the day, and
// what earns the top XP, so the engine flags them with a 🚪.
// Kept tight to true irreversible sends. Words like "pitch", "apply", "plan"
// are omitted: they read as prep, not a door, and cause false positives.
const ONE_WAY_DOOR_RE =
  /\b(send|sent|submit|submitted|publish|published|post|posted|pay|paid|wire|wired|transfer|deploy|deployed|ship|shipped|sign|signed|launch|launched|invoice|invoiced|email|reply|replied)\b/i;

export function isOneWayDoor(title: string): boolean {
  return ONE_WAY_DOOR_RE.test(title);
}

function bossScore(q: Quest): number {
  return (INCOME_LANES.has(q.priority) ? 0 : 1) * 100 + priorityRank[q.priority];
}

// True when `a` is a higher-leverage boss than `b`: income first, then priority.
export function outranksForBoss(a: Quest, b: Quest): boolean {
  return bossScore(a) < bossScore(b);
}

// The boss the app suggests: the hardest OPEN income close that passes the
// Motion Test, falling back to the top priority lane if there is no income quest.
export function recommendedBinding(quests: Quest[]): Quest | null {
  const eligible = quests
    .filter((q) => q.passesMotionTest && !q.done)
    .sort((a, b) => bossScore(a) - bossScore(b));
  return eligible[0] ?? null;
}

export function bindingGoal(quests: Quest[]): Quest | null {
  return quests.find((q) => q.isBinding) ?? null;
}

// A quest is eligible to be binding only if it passes the Motion Test and is open.
export function canBind(q: Quest): boolean {
  return q.passesMotionTest && !q.done;
}
