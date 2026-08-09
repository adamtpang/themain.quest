// The Climb: lifetime XP that never resets. Only real closes move it.
// This is the "visible becoming" layer. Motion earns nothing.

import { Pillar, PILLAR_ORDER } from "./types";

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

// Three independent XP pools, one per pillar (LIFE_GAME.md, decided
// 2026-08-07). Same xpForLevel/levelForXp curve as the single-pool Progress
// above — no reason for three different curves — but tracked separately so
// none of them can be starved by a big week in the others.
export type PillarProgress = Record<Pillar, number>;

export function freshPillarProgress(): PillarProgress {
  return { Health: 0, Wealth: 0, Wisdom: 0 };
}

export function levelInfoByPillar(
  pillars: PillarProgress
): Record<Pillar, LevelInfo> {
  const out = {} as Record<Pillar, LevelInfo>;
  for (const p of PILLAR_ORDER) out[p] = levelInfo(pillars[p]);
  return out;
}

// THE actual fix, not just three visible numbers: overall level is the
// LOWEST of the three pillar levels, never the average and never the sum.
// You cannot level up by only feeding your favorite pillar.
export function overallLevelFromPillars(pillars: PillarProgress): number {
  return Math.min(...PILLAR_ORDER.map((p) => levelForXp(pillars[p])));
}

// Which pillar is currently gating overall level — the one to feed next.
export function weakestPillar(pillars: PillarProgress): Pillar {
  return PILLAR_ORDER.reduce((weakest, p) =>
    levelForXp(pillars[p]) < levelForXp(pillars[weakest]) ? p : weakest
  );
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
