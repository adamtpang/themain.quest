// The Climb: lifetime XP that never resets. Only real closes move it.
// This is the "visible becoming" layer. Motion earns nothing.

export const XP_PER_QUEST = 25; // a real close (passes the Motion Test)
export const XP_BOSS_BONUS = 75; // closing the binding goal: 100 total

export type Progress = { xp: number };

// Cumulative XP required to BE at a given level. Level 1 = 0.
// 50 * L * (L-1): L2=100, L3=300, L4=600, L5=1000, fast early then a real grind.
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export type LevelInfo = {
  level: number;
  intoLevel: number;
  neededForNext: number;
  pct: number;
};

export function levelInfo(xp: number): LevelInfo {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const intoLevel = xp - base;
  const neededForNext = next - base;
  const pct = neededForNext > 0 ? Math.min(100, (intoLevel / neededForNext) * 100) : 0;
  return { level, intoLevel, neededForNext, pct };
}

export type Rank = { name: string; minLevel: number };

// The ranked ladder. Elon sits at the top as the champion to dethrone.
export const RANKS: Rank[] = [
  { name: "ROOKIE", minLevel: 1 },
  { name: "HUSTLER", minLevel: 3 },
  { name: "OPERATOR", minLevel: 5 },
  { name: "CLOSER", minLevel: 8 },
  { name: "KILLER", minLevel: 12 },
  { name: "LEGEND", minLevel: 17 },
  { name: "S-TIER", minLevel: 23 },
  { name: "CHAMPION", minLevel: 30 }, // dethroned Elon
];

export function rankForLevel(level: number): {
  current: Rank;
  next: Rank | null;
  levelsToNext: number;
} {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (level >= RANKS[i].minLevel) idx = i;
  }
  const current = RANKS[idx];
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  const levelsToNext = next ? Math.max(0, next.minLevel - level) : 0;
  return { current, next, levelsToNext };
}
