// The ladder record: a lifetime win/loss tally, Hearthstone/Overwatch-style.
// Distinct from Streak (the current unbroken chain) — this is the permanent
// scoreboard, "47W-12L", that never resets and can genuinely go down. Right
// now nothing in this app can actually be LOST; this is what makes a day a
// real match instead of a one-way climb.

export type LadderRecord = {
  wins: number;
  losses: number;
  lastRecordedDate: string; // guards against double-counting the same day
};

export function freshLadder(): LadderRecord {
  return { wins: 0, losses: 0, lastRecordedDate: "" };
}

// Judges a day exactly once, the moment the calendar rolls past it. isWinning
// comes straight from computeScore(day) on the day being closed out (score
// >= WINNING_SCORE, i.e. the 3-rung bar). No half-credit, no "verify later."
export function recordResult(
  l: LadderRecord,
  dateBeingClosed: string,
  isWinning: boolean
): LadderRecord {
  if (!dateBeingClosed || l.lastRecordedDate === dateBeingClosed) return l;
  return {
    wins: l.wins + (isWinning ? 1 : 0),
    losses: l.losses + (isWinning ? 0 : 1),
    lastRecordedDate: dateBeingClosed,
  };
}

export function winRate(l: LadderRecord): number {
  const total = l.wins + l.losses;
  return total > 0 ? Math.round((l.wins / total) * 100) : 0;
}
