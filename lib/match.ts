// The Match: today's Hearthstone-style loop, played in pomodoro turns. Focus
// crystals are mana, the boss has HP you chip with focus blocks, and "lethal"
// fires when you can still close it today. Damage lands on the check-in tap,
// not silently at timer zero, so the dopamine is tied to an action.

export const FOCUS_MINUTES = 25; // one pomodoro, one turn
export const BREAK_MINUTES = 5; // the opponent's turn
export const SHIP_XP = 10; // the micro-goal died this turn
export const DEFAULT_CRYSTALS = 8; // 8 pomodoros = the 200-minute deep work cap
export const DEFAULT_BOSS_HP = 6; // 150 focused minutes to strike the boss dead

export type FlowRating = "easy" | "edge" | "hard";

export type MatchState = {
  date: string;
  crystals: number;
  spent: number;
  bossId: string | null; // which binding goal the HP belongs to
  bossHpMax: number;
  bossHpDone: number;
  focusEndsAt: number | null; // epoch ms when the running turn completes
  focusQuestId: string | null;
  focusGoal: string | null; // the typed micro-goal, this turn's win condition
  awaitingResolve: boolean; // turn ended, check-in not yet done
  breakEndsAt: number | null; // epoch ms; non-null means the opponent's turn
  lastRating: FlowRating | null; // tunes the next turn's coaching line
};

export function freshMatch(date: string): MatchState {
  return {
    date,
    crystals: DEFAULT_CRYSTALS,
    spent: 0,
    bossId: null,
    bossHpMax: DEFAULT_BOSS_HP,
    bossHpDone: 0,
    focusEndsAt: null,
    focusQuestId: null,
    focusGoal: null,
    awaitingResolve: false,
    breakEndsAt: null,
    lastRating: null,
  };
}

export function crystalsLeft(m: MatchState): number {
  return Math.max(0, m.crystals - m.spent);
}

export function bossRemaining(m: MatchState): number {
  return Math.max(0, m.bossHpMax - m.bossHpDone);
}

// The addictive moment: enough crystals left to finish the boss today.
export function isLethal(m: MatchState, hasBoss: boolean): boolean {
  if (!hasBoss) return false;
  const rem = bossRemaining(m);
  return rem > 0 && crystalsLeft(m) >= rem;
}

// The one state machine every surface derives from. Never branch on raw fields.
export type MatchPhase = "no_boss" | "ready" | "focus" | "resolve" | "break" | "out_of_mana";

export function matchPhase(m: MatchState, hasBoss: boolean, now: number): MatchPhase {
  if (!hasBoss) return "no_boss";
  if (m.awaitingResolve) return "resolve";
  // An expired rope is already a check-in, even before the tick flips the flag.
  if (m.focusEndsAt) return now < m.focusEndsAt ? "focus" : "resolve";
  if (m.breakEndsAt && now < m.breakEndsAt) return "break";
  if (crystalsLeft(m) === 0) return "out_of_mana";
  return "ready";
}
