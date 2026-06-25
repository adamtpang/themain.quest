import { DayState, KEYSTONE_RUNG } from "./types";

export const BASE_SCORE = 5;
export const WINNING_SCORE = 8; // three rungs hit
export const WOBBLE_CAP = 7; // soft ceiling without the keystone (Goal hit)

export type ScoreResult = {
  score: number;
  completed: number;
  keystoneDone: boolean;
  capped: boolean; // true when the wobble cap is holding the score down
  isWinning: boolean;
};

// score = 5 + (rungs completed), so 3 = 8 and 5 = 10.
// Rung 7 (Goal hit) is the keystone: without it the day caps at a wobble (7),
// no matter what else is checked.
export function computeScore(day: DayState): ScoreResult {
  const completed = day.rungs.filter((r) => r.done).length;
  const keystoneDone = day.rungs.some((r) => r.n === KEYSTONE_RUNG && r.done);

  const raw = BASE_SCORE + completed;
  const ceiling = keystoneDone ? 10 : WOBBLE_CAP;
  const score = Math.min(raw, ceiling);

  return {
    score,
    completed,
    keystoneDone,
    capped: raw > ceiling,
    isWinning: score >= WINNING_SCORE,
  };
}
