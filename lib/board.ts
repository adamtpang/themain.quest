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

// The hardest OPEN close = highest-priority open quest that passes the Motion Test.
// This is what the binding-goal slot should hold; the app nudges toward it.
export function recommendedBinding(quests: Quest[]): Quest | null {
  const eligible = quests
    .filter((q) => q.passesMotionTest && !q.done)
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  return eligible[0] ?? null;
}

export function bindingGoal(quests: Quest[]): Quest | null {
  return quests.find((q) => q.isBinding) ?? null;
}

// A quest is eligible to be binding only if it passes the Motion Test and is open.
export function canBind(q: Quest): boolean {
  return q.passesMotionTest && !q.done;
}
