// The Match: today's Hearthstone-style loop. Focus crystals are mana, the boss
// has HP you chip with focus blocks, and "lethal" fires when you can close it today.

export const FOCUS_MINUTES = 25;
export const DEFAULT_CRYSTALS = 8; // focus blocks available per day
export const DEFAULT_BOSS_HP = 3; // focus blocks to strike the boss dead

export type MatchState = {
  date: string;
  crystals: number;
  spent: number;
  bossId: string | null; // which binding goal the HP belongs to
  bossHpMax: number;
  bossHpDone: number;
  focusEndsAt: number | null; // epoch ms when the running block completes
  focusQuestId: string | null;
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
